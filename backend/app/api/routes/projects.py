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
from app.models.destination import Destination, MobilityType
from app.auth_utils import get_current_user
from app.services.email_service import email_service
from typing import List
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter()


def serialize_project(project: Project, include_students: bool = False, students_data: list = None) -> dict:
    """Helper function to serialize a Project model to a dictionary.
    Avoids code duplication across multiple endpoints.
    """
    # Get teacher info
    teacher_info = None
    if project.teacher and project.teacher.user:
        teacher_info = {
            "id": project.teacher.id,
            "first_name": project.teacher.user.first_name,
            "last_name": project.teacher.user.last_name,
            "email": project.teacher.user.email
        }
    
    # Use the database field for algorithm_ran status
    algorithm_ran = project.algorithm_ran if hasattr(project, 'algorithm_ran') else False
    
    result = {
        "id": project.id,
        "teacher_id": project.teacher_id,
        "teacher": teacher_info,
        "title": project.title,
        "description": project.description,
        "project_type": project.project_type.value if hasattr(project.project_type, 'value') else project.project_type,
        "group_size": project.group_size,
        "partner_preference_enabled": project.partner_preference_enabled,
        "required_english_level": project.required_english_level.value if hasattr(project.required_english_level, 'value') else project.required_english_level,
        "target_filiere": project.target_filiere.value if hasattr(project.target_filiere, 'value') else project.target_filiere,
        "deadline": project.deadline.isoformat() if project.deadline else None,
        "is_active": project.is_active,
        "is_open_for_preferences": project.is_open_for_preferences,
        "created_at": project.created_at.isoformat() if project.created_at else None,
        "updated_at": project.updated_at.isoformat() if project.updated_at else None,
        "destinations_count": len(project.destinations) if project.destinations else 0,
        "algorithm_ran": algorithm_ran,
    }
    if include_students:
        result["students"] = students_data or []
    return result


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
                    english_level=student.english_level.value if student.english_level else None,
                    rank=student.general_rank,
                    grade=student.gpa
                ))
        
        projects_with_students.append(serialize_project(project, include_students=True, students_data=students_data))
    
    return projects_with_students

@router.get("/me/my-projects", response_model=List[ProjectWithStudents])
async def get_my_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all projects for the current authenticated student"""
    
    # Get student profile for current user
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    # Get all projects the student is enrolled in
    projects = student.projects
    
    # Format response
    projects_with_students = []
    for project in projects:
        students_data = []
        for proj_student in project.students:
            if proj_student.user:
                full_name = f"{proj_student.user.first_name} {proj_student.user.last_name}" if proj_student.user.first_name else proj_student.user.email
                students_data.append(StudentInProject(
                    id=proj_student.id,
                    name=full_name,
                    email=proj_student.user.email,
                    filiere=proj_student.filiere.value if proj_student.filiere else None,
                    rank=proj_student.general_rank,
                    grade=proj_student.gpa
                ))
        
        projects_with_students.append(serialize_project(project, include_students=True, students_data=students_data))
    
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
                english_level=student.english_level.value if student.english_level else None,
                rank=student.general_rank,
                grade=student.gpa
            ))
    
    return serialize_project(project, include_students=True, students_data=students_data)

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new project with students"""
    
    # Check if current_user is actually resolved
    if hasattr(current_user, '__class__') and current_user.__class__.__name__ == 'Depends':
        logger.error("Authentication dependency not resolved")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur d'authentification"
        )
    
    # Get teacher ID from authenticated user
    if not hasattr(current_user, 'teacher_profile') or not current_user.teacher_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les enseignants peuvent créer des projets"
        )
    
    teacher_id = current_user.teacher_profile.id
    
    try:
        # Convert project_type - handle both string and enum
        project_type_value = project_data.project_type
        if hasattr(project_type_value, 'value'):
            project_type_value = project_type_value.value
        project_type_enum = ProjectType(project_type_value)
        
        # Create project
        new_project = Project(
            teacher_id=teacher_id,
            title=project_data.title,
            description=project_data.description,
            project_type=project_type_enum,
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
        
        # Create/link students if provided (don't send emails during creation - will be sent on finalization)
        if project_data.students:
            await upload_students_to_project(
                new_project.id, 
                StudentUploadRequest(students=project_data.students, send_emails=True),  # Send emails on project creation
                db,
                current_user
            )
        
        # Create destinations if provided (for exchange programs)
        if project_data.destinations:
            for dest_data in project_data.destinations:
                try:
                    # Map mobility type string to enum
                    mobility_type = MobilityType.ECHANGE_ACADEMIQUE
                    if hasattr(MobilityType, dest_data.mobility_type):
                        mobility_type = getattr(MobilityType, dest_data.mobility_type)
                    
                    new_destination = Destination(
                        project_id=new_project.id,
                        university_name=dest_data.university_name,
                        country=dest_data.country,
                        city=dest_data.city,
                        total_places=dest_data.total_places,
                        available_places=dest_data.total_places,
                        mobility_type=mobility_type,
                        accepted_filieres=dest_data.accepted_filieres,
                        min_english_level=dest_data.min_english_level,
                        min_toeic_score=dest_data.min_toeic_score,
                        min_gpa=dest_data.min_gpa
                    )
                    db.add(new_destination)
                except Exception as dest_error:
                    logger.warning("Erreur lors de la création d'une destination: %s", type(dest_error).__name__)
            
            db.commit()
        
        return serialize_project(new_project)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error("Erreur lors de la création du projet: %s", type(e).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création du projet. Veuillez réessayer."
        ) from e

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify ownership - only the project teacher can update
    if not current_user.teacher_profile or project.teacher_id != current_user.teacher_profile.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project teacher can update this project"
        )
    
    try:
        # Update only provided fields
        update_data = project_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(project, field, value)
        
        db.commit()
        db.refresh(project)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error("Erreur lors de la mise à jour du projet: %s", type(e).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour du projet. Veuillez réessayer."
        ) from e
    
    return serialize_project(project)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify ownership - only the project teacher can delete
    if not current_user.teacher_profile or project.teacher_id != current_user.teacher_profile.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project teacher can delete this project"
        )
    
    db.delete(project)
    db.commit()
    return

# ===== STUDENT MANAGEMENT =====

@router.post("/{project_id}/upload-students", response_model=StudentUploadResponse)
async def upload_students_to_project(
    project_id: int,
    upload_data: StudentUploadRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload students to a project via CSV data"""
    
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify ownership - only the project teacher can upload students
    if not current_user.teacher_profile or project.teacher_id != current_user.teacher_profile.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project teacher can upload students to this project"
        )
    
    # Get teacher name
    teacher = project.teacher
    teacher_name = f"{teacher.user.first_name} {teacher.user.last_name}".strip() if teacher.user else "Professeur"
    
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
                    # Send enrollment email only if send_emails is True
                    if upload_data.send_emails:
                        student_name = f"{existing_user.first_name} {existing_user.last_name}".strip() or existing_user.email
                        email_service.send_student_enrollment_email(
                            student_email=existing_user.email,
                            student_name=student_name,
                            project_title=project.title,
                            teacher_name=teacher_name
                        )
                
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
            
            import secrets
            from app.auth_utils import hash_password
            
            # Generate secure random password
            temp_password = secrets.token_urlsafe(16)
            
            # Generate unique username
            base_username = student_data.email.split('@')[0]
            username = base_username
            counter = 1
            while db.query(User).filter(User.username == username).first():
                username = f"{base_username}{counter}"
                counter += 1
            
            new_user = User(
                email=student_data.email,
                username=username,
                first_name=first_name,
                last_name=last_name,
                role=UserRole.STUDENT,
                hashed_password=hash_password(temp_password)
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
            
            # Send enrollment email only if send_emails is True
            if upload_data.send_emails:
                student_name = f"{new_user.first_name} {new_user.last_name}".strip()
                email_service.send_student_enrollment_email(
                    student_email=new_user.email,
                    student_name=student_name,
                    project_title=project.title,
                    teacher_name=teacher_name
                )
            
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
                english_level=student.english_level.value if student.english_level else None,
                rank=student.general_rank,
                grade=student.gpa
            ))
    
    return students_data

@router.delete("/{project_id}/students/{student_id}")
async def remove_student_from_project(
    project_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a student from a project"""
    
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify ownership - only the project teacher can remove students
    if not current_user.teacher_profile or project.teacher_id != current_user.teacher_profile.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project teacher can remove students from this project"
        )
    
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
