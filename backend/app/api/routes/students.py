from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class StudentBase(BaseModel):
    student_number: str
    ranking: Optional[int] = None
    language_level: Optional[str] = None

class StudentCreate(StudentBase):
    email: str
    full_name: str

class StudentResponse(StudentBase):
    id: int
    email: str
    full_name: str
    
    class Config:
        from_attributes = True

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
    from app.models.user import User
    
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
