from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.teacher import Teacher
from pydantic import BaseModel

router = APIRouter()

# Pydantic schemas
class TeacherBase(BaseModel):
    department: Optional[str] = None
    office: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None

class TeacherCreate(TeacherBase):
    user_id: int

class TeacherUpdate(TeacherBase):
    pass

class TeacherResponse(TeacherBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

class TeacherWithUserResponse(TeacherResponse):
    user: dict

# Routes
@router.get("/", response_model=List[TeacherResponse])
def get_all_teachers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Récupérer la liste de tous les professeurs"""
    teachers = db.query(Teacher).offset(skip).limit(limit).all()
    return teachers

@router.get("/{teacher_id}", response_model=TeacherWithUserResponse)
def get_teacher(teacher_id: int, db: Session = Depends(get_db)):
    """Récupérer le profil d'un professeur"""
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Professeur non trouvé")
    
    return {
        **teacher.__dict__,
        "user": {
            "id": teacher.user.id,
            "email": teacher.user.email,
            "username": teacher.user.username,
            "first_name": teacher.user.first_name,
            "last_name": teacher.user.last_name,
        }
    }

@router.put("/{teacher_id}", response_model=TeacherResponse)
def update_teacher(teacher_id: int, teacher_update: TeacherUpdate, db: Session = Depends(get_db)):
    """Modifier le profil d'un professeur"""
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Professeur non trouvé")
    
    # Update fields
    for field, value in teacher_update.dict(exclude_unset=True).items():
        setattr(teacher, field, value)
    
    db.commit()
    db.refresh(teacher)
    return teacher

@router.get("/{teacher_id}/projects")
def get_teacher_projects(teacher_id: int, db: Session = Depends(get_db)):
    """Récupérer tous les projets d'un professeur"""
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Professeur non trouvé")
    
    return teacher.projects
