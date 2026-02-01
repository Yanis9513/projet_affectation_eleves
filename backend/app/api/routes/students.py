from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from pydantic import BaseModel
from typing import List, Optional
from app.auth_utils import get_current_user
from app.models.user import User

router = APIRouter()

class StudentBase(BaseModel):
    student_number: str = None
    ranking: Optional[int] = None
    language_level: Optional[str] = None
    filiere: Optional[str] = None
    promotion: Optional[str] = None

class StudentCreate(StudentBase):
    email: str
    full_name: str

class StudentResponse(StudentBase):
    id: int
    email: str
    full_name: str
    
    class Config:
        from_attributes = True

@router.get("/me/profile")
async def get_current_student_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current student profile"""
    from app.models.student import Student
    
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    return {
        "id": student.id,
        "email": current_user.email,
        "full_name": f"{current_user.first_name} {current_user.last_name}",
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "student_number": student.student_number,
        "ranking": student.general_rank,
        "language_level": student.english_level.value if student.english_level else None,
        "filiere": student.filiere.value if student.filiere else None,
        "promotion": student.promotion if hasattr(student, 'promotion') else None
    }

@router.put("/me/profile", response_model=dict)
async def update_current_student_profile(student_update: StudentBase, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update current student profile"""
    from app.models.student import Student, Filiere, EnglishLevel
    
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    # Update fields with proper mapping
    update_data = student_update.model_dump(exclude_unset=True)
    
    # Map 'ranking' to 'general_rank'
    if 'ranking' in update_data:
        update_data['general_rank'] = update_data.pop('ranking')
    
    # Map 'language_level' to 'english_level'
    if 'language_level' in update_data:
        update_data['english_level'] = update_data.pop('language_level')
    
    # Convert string enum values to proper enum types
    if 'english_level' in update_data and update_data['english_level']:
        try:
            update_data['english_level'] = EnglishLevel(update_data['english_level'])
        except (ValueError, KeyError):
            pass  # Keep original value if conversion fails
    
    if 'filiere' in update_data and update_data['filiere']:
        try:
            # Try to find matching Filiere enum
            for fili in Filiere:
                if fili.value == update_data['filiere'] or fili.name == update_data['filiere']:
                    update_data['filiere'] = fili
                    break
        except (ValueError, KeyError):
            pass  # Keep original value if conversion fails
    
    for field, value in update_data.items():
        if hasattr(student, field) and value is not None:
            setattr(student, field, value)
    
    db.commit()
    db.refresh(student)
    
    return {
        "id": student.id,
        "email": current_user.email,
        "full_name": f"{current_user.first_name} {current_user.last_name}",
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "student_number": student.student_number,
        "ranking": student.general_rank,
        "language_level": student.english_level.value if student.english_level else None,
        "filiere": student.filiere.value if student.filiere else None,
        "promotion": student.promotion if hasattr(student, 'promotion') else None
    }

@router.get("/", response_model=List[StudentResponse])
async def get_students(db: Session = Depends(get_db)):
    """Get all students"""
    from app.models.student import Student
    from app.models.user import User
    
    students = db.query(Student).join(User).all()
    return [{
        "id": s.id,
        "email": s.user.email,
        "full_name": f"{s.user.first_name} {s.user.last_name}",
        "student_number": s.student_number,
        "ranking": s.general_rank,
        "language_level": s.english_level.value if s.english_level else None
    } for s in students]

@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(student_id: int, db: Session = Depends(get_db)):
    """Get a specific student by ID"""
    from app.models.student import Student
    
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return {
        "id": student.id,
        "email": student.user.email,
        "full_name": f"{student.user.first_name} {student.user.last_name}",
        "student_number": student.student_number,
        "ranking": student.general_rank,
        "language_level": student.english_level.value if student.english_level else None
    }

@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)

async def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    """Create a new student"""
    # Handled via project upload functionality
    raise HTTPException(status_code=501, detail="Use project CSV upload to add students")

@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(student_id: int, student: StudentBase, db: Session = Depends(get_db)):
    """Update a student"""
    raise HTTPException(status_code=501, detail="Not implemented")

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(student_id: int, db: Session = Depends(get_db)):
    """Delete a student"""
    raise HTTPException(status_code=501, detail="Not implemented")

@router.get("/me/assignments")
async def get_my_assignments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all assignments for the current student across all projects"""
    from app.models.student import Student
    from app.models.assignment import Assignment
    from app.models.project import Project
    from app.models.destination import Destination
    from app.models.destination_preference import DestinationPreference
    
    print(f"[DEBUG] Getting assignments for user {current_user.id} ({current_user.email})")
    
    # Get student record
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        print(f"[DEBUG] Student profile not found for user {current_user.id}")
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    print(f"[DEBUG] Found student {student.id}")
    
    # Get all assignments for this student
    assignments = db.query(Assignment).filter(
        Assignment.student_id == student.id
    ).all()
    
    print(f"[DEBUG] Found {len(assignments)} raw assignments for student {student.id}")
    
    # Build detailed response
    result = []
    for assignment in assignments:
        project = db.query(Project).filter(Project.id == assignment.project_id).first()
        if not project:
            continue
        
        assignment_data = {
            "id": assignment.id,
            "project_id": assignment.project_id,
            "project_title": project.title,
            "project_type": project.project_type.value if hasattr(project.project_type, 'value') else str(project.project_type),
            "group_number": assignment.group_number,
            "satisfaction_score": assignment.satisfaction_score,
            "assigned_at": assignment.assigned_at.isoformat() if assignment.assigned_at else None,
        }
        
        # Add project-type specific details
        if project.project_type.value == "exchange_program":
            # Get destination info from assignment
            if assignment.destination_id:
                destination = db.query(Destination).filter(
                    Destination.id == assignment.destination_id
                ).first()
                if destination:
                    assignment_data["destination"] = {
                        "id": destination.id,
                        "university_name": destination.university_name,
                        "country": destination.country,
                        "city": destination.city
                    }
            
            # Get the grade the student gave this destination
            if assignment.destination_id:
                pref = db.query(DestinationPreference).filter(
                    DestinationPreference.student_id == student.id,
                    DestinationPreference.destination_id == assignment.destination_id,
                    DestinationPreference.project_id == project.id
                ).first()
                if pref:
                    assignment_data["grade"] = pref.grade
        
        elif project.project_type.value == "group_project":
            # Get group members
            group_members = db.query(Assignment).filter(
                Assignment.project_id == assignment.project_id,
                Assignment.group_number == assignment.group_number,
                Assignment.student_id != student.id
            ).all()
            
            members = []
            for member in group_members:
                member_student = db.query(Student).filter(Student.id == member.student_id).first()
                if member_student:
                    members.append({
                        "id": member_student.id,
                        "name": f"{member_student.user.first_name} {member_student.user.last_name}" if member_student.user else "Unknown",
                        "email": member_student.user.email if member_student.user else None
                    })
            
            assignment_data["group_members"] = members
            assignment_data["group_size"] = len(members) + 1  # +1 for current student
        
        elif project.project_type.value == "english_leveling":
            # Get English level info
            assignment_data["english_level"] = student.english_level.value if student.english_level else "Unknown"
            # Get group members with same level
            group_members = db.query(Assignment).filter(
                Assignment.project_id == assignment.project_id,
                Assignment.group_number == assignment.group_number,
                Assignment.student_id != student.id
            ).all()
            
            members = []
            for member in group_members:
                member_student = db.query(Student).filter(Student.id == member.student_id).first()
                if member_student:
                    members.append({
                        "id": member_student.id,
                        "name": f"{member_student.user.first_name} {member_student.user.last_name}" if member_student.user else "Unknown",
                        "email": member_student.user.email if member_student.user else None,
                        "english_level": member_student.english_level.value if member_student.english_level else "Unknown"
                    })
            
            assignment_data["group_members"] = members
            assignment_data["group_size"] = len(members) + 1
        
        result.append(assignment_data)
    
    print(f"[DEBUG] Returning {len(result)} processed assignments")
    for r in result[:2]:  # Print first 2
        print(f"[DEBUG]   Result: project={r.get('project_title')}, type={r.get('project_type')}, has_dest={bool(r.get('destination'))}")
    
    return {
        "student_id": student.id,
        "student_name": f"{current_user.first_name} {current_user.last_name}",
        "total_assignments": len(result),
        "assignments": result
    }
