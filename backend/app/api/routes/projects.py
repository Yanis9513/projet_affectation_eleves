from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    ProjectCreate, ProjectResponse, ProjectWithStudents, ProjectUpdate,
    StudentUploadRequest, StudentUploadResponse, StudentInProject
)
from app.models.project import Project, ProjectType
from app.models.student import Student
from app.models.user import User, UserRole
from typing import List

router = APIRouter()

# ===== PROJECT CRUD =====

@router.get("/", response_model=List[ProjectWithStudents])
async def get_projects(
    teacher_id: int = None,
    is_active: bool = None,
    db: Session = Depends(get_db)
):
    """Get all projects with optional filters"""
    query = db.query(Project)
    
    if teacher_id:
        query = query.filter(Project.teacher_id == teacher_id)
    if is_active is not None:
        query = query.filter(Project.is_active == is_active)
    
    projects = query.order_by(Project.created_at.desc()).all()
    
    # Include student count for each project
    projects_with_students = []
    for project in projects:
        students_data = []
        for student in project.students:
            if student.user:
                full_name = f"{student.user.first_name} {student.user.last_name}" if student.user.first_name else student.user.email
                students_data.append(StudentInProject(
                    id=student.id,
                    name=full_name,
                    email=student.user.email,
                    filiere=student.filiere.value if student.filiere else None,
                    rank=student.general_rank,
                    grade=student.gpa
                ))
        
        projects_with_students.append({
            **project.__dict__,
            "students": students_data
        })
    
    return projects_with_students

@router.get("/{project_id}", response_model=ProjectWithStudents)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get a specific project by ID with students"""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get all students linked to this project
    students_data = []
    for student in project.students:
        if student.user:
            full_name = f"{student.user.first_name} {student.user.last_name}" if student.user.first_name else student.user.email
            students_data.append(StudentInProject(
                id=student.id,
                name=full_name,
                email=student.user.email,
                filiere=student.filiere.value if student.filiere else None,
                rank=student.general_rank,
                grade=student.gpa
            ))
    
    return {
        **project.__dict__,
        "students": students_data
    }

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(project_data: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project with students"""
    
    # TODO: Get teacher_id from authenticated user (for now using default)
    # In production, extract from JWT token
    teacher_id = 1  # Placeholder - will be replaced with auth
    
    # Create project
    new_project = Project(
        teacher_id=teacher_id,
        title=project_data.title,
        description=project_data.description,
        project_type=ProjectType[project_data.project_type.value.upper()],
        group_size=project_data.group_size,
        partner_preference_enabled=project_data.partner_preference_enabled,
        required_english_level=project_data.required_english_level,
        target_filiere=project_data.target_filiere,
        deadline=project_data.deadline,
        is_active=True,
        is_open_for_preferences=True
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    # Create/link students if provided
    if project_data.students:
        await upload_students_to_project(
            new_project.id, 
            StudentUploadRequest(students=project_data.students), 
            db
        )
    
    return new_project

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int, 
    project_data: ProjectUpdate, 
    db: Session = Depends(get_db)
):
    """Update a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update only provided fields
    update_data = project_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return

# ===== STUDENT MANAGEMENT =====

@router.post("/{project_id}/upload-students", response_model=StudentUploadResponse)
async def upload_students_to_project(
    project_id: int,
    upload_data: StudentUploadRequest,
    db: Session = Depends(get_db)
):
    """Upload students to a project via CSV data"""
    
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    created_count = 0
    existing_count = 0
    result_students = []
    
    for student_data in upload_data.students:
        # Check if user already exists by email
        existing_user = db.query(User).filter(User.email == student_data.email).first()
        
        if existing_user:
            existing_count += 1
            # Get student profile
            student = db.query(Student).filter(Student.user_id == existing_user.id).first()
            if student:
                # Link student to project if not already linked
                if project not in student.projects:
                    student.projects.append(project)
                
                full_name = f"{existing_user.first_name} {existing_user.last_name}" if existing_user.first_name else existing_user.email
                result_students.append(StudentInProject(
                    id=student.id,
                    name=full_name,
                    email=existing_user.email,
                    filiere=student.filiere.value if student.filiere else None,
                    rank=student.general_rank,
                    grade=student.gpa
                ))
        else:
            # Create new user
            name_parts = student_data.name.split(' ', 1)
            first_name = name_parts[0] if name_parts else student_data.name
            last_name = name_parts[1] if len(name_parts) > 1 else ""
            
            new_user = User(
                email=student_data.email,
                username=student_data.email.split('@')[0],
                first_name=first_name,
                last_name=last_name,
                role=UserRole.STUDENT,
                hashed_password="temporary_password_hash"  # TODO: Generate proper password
            )
            db.add(new_user)
            db.flush()  # Get the user ID
            
            # Create student profile
            from app.models.student import Filiere, EnglishLevel
            
            # Map filiere string to enum (handle common variations)
            filiere_value = Filiere.AUTRE  # Default
            if student_data.filiere:
                filiere_upper = student_data.filiere.upper()
                # Try common mappings
                filiere_map = {
                    'INFORMATIQUE': Filiere.INFORMATIQUE,
                    'INFO': Filiere.INFORMATIQUE,
                    'E5FI': Filiere.INFORMATIQUE,
                    'ELECTRONIQUE': Filiere.ELECTRONIQUE,
                    'ELEC': Filiere.ELECTRONIQUE,
                    'E5SE': Filiere.SYSTEMES_EMBARQUES,
                    'ENERGIE': Filiere.ENERGIE,
                    'BIOTECHNOLOGIE': Filiere.BIOTECHNOLOGIE,
                    'BIOTECH': Filiere.BIOTECHNOLOGIE,
                    'SYSTEMES_EMBARQUES': Filiere.SYSTEMES_EMBARQUES,
                    'RESEAUX': Filiere.RESEAUX,
                    'AUTRE': Filiere.AUTRE
                }
                filiere_value = filiere_map.get(filiere_upper, Filiere.AUTRE)
            
            new_student = Student(
                user_id=new_user.id,
                student_number=f"STU{new_user.id:06d}",  # Auto-generate student number
                filiere=filiere_value,
                english_level=EnglishLevel.B1,  # Default
                general_rank=student_data.rank,
                gpa=student_data.grade
            )
            db.add(new_student)
            db.flush()
            
            # Link student to project
            new_student.projects.append(project)
            
            created_count += 1
            full_name = f"{new_user.first_name} {new_user.last_name}".strip()
            result_students.append(StudentInProject(
                id=new_student.id,
                name=full_name,
                email=new_user.email,
                filiere=new_student.filiere.value if new_student.filiere else None,
                rank=new_student.general_rank,
                grade=new_student.gpa
            ))
    
    db.commit()
    
    return StudentUploadResponse(
        success=True,
        message=f"Uploaded {len(upload_data.students)} students: {created_count} created, {existing_count} existing",
        created_count=created_count,
        existing_count=existing_count,
        students=result_students
    )

@router.get("/{project_id}/students", response_model=List[StudentInProject])
async def get_project_students(project_id: int, db: Session = Depends(get_db)):
    """Get all students enrolled in a project"""
    
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get all students linked to this project via the many-to-many relationship
    students_data = []
    for student in project.students:
        if student.user:
            full_name = f"{student.user.first_name} {student.user.last_name}" if student.user.first_name else student.user.email
            students_data.append(StudentInProject(
                id=student.id,
                name=full_name,
                email=student.user.email,
                filiere=student.filiere.value if student.filiere else None,
                rank=student.general_rank,
                grade=student.gpa
            ))
    
    return students_data

@router.delete("/{project_id}/students/{student_id}")
async def remove_student_from_project(
    project_id: int, 
    student_id: int, 
    db: Session = Depends(get_db)
):
    """Remove a student from a project"""
    
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if student exists
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if student is in the project
    if student not in project.students:
        raise HTTPException(status_code=400, detail="Student is not enrolled in this project")
    
    # Remove student from project
    project.students.remove(student)
    db.commit()
    
    return {"message": "Student removed from project successfully", "student_id": student_id}
