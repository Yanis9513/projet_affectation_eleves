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
    # TODO: Implement get all students from database
    return []

@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(student_id: int, db: Session = Depends(get_db)):
    """Get a specific student by ID"""
    # TODO: Implement get student by ID
    raise HTTPException(status_code=404, detail="Student not found")

@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    """Create a new student"""
    # TODO: Implement create student
    return student

@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(student_id: int, student: StudentBase, db: Session = Depends(get_db)):
    """Update a student"""
    # TODO: Implement update student
    raise HTTPException(status_code=404, detail="Student not found")

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(student_id: int, db: Session = Depends(get_db)):
    """Delete a student"""
    # TODO: Implement delete student
    pass
