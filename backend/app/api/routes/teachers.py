from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.teacher import Teacher
from app.models.user import User
from app.models.project import Project
from app.auth_utils import get_current_user
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
@router.get("/me/profile", response_model=dict)
def get_current_teacher_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Récupérer le profil du professeur courant"""
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Profil professeur non trouvé")
    
    # Count projects created by this teacher
    projects_count = db.query(Project).filter(Project.teacher_id == teacher.id).count()
    
    # Count total students across all projects
    projects = db.query(Project).filter(Project.teacher_id == teacher.id).all()
    students_count = sum(len(p.students) for p in projects)
    
    # Count active projects
    active_projects_count = db.query(Project).filter(
        Project.teacher_id == teacher.id,
        Project.is_active == True
    ).count()
    
    return {
        "id": teacher.id,
        "user_id": teacher.user_id,
        "department": teacher.department,
        "office": teacher.office,
        "phone": teacher.phone,
        "bio": teacher.bio,
        "projects_count": projects_count,
        "students_count": students_count,
        "active_projects_count": active_projects_count,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "username": current_user.username,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
        }
    }

@router.put("/me/profile", response_model=dict)
def update_current_teacher_profile(teacher_update: TeacherUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Mettre à jour le profil du professeur courant"""
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Profil professeur non trouvé")
    
    # Update fields
    for field, value in teacher_update.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(teacher, field, value)
    
    db.commit()
    db.refresh(teacher)
    
    return {
        "id": teacher.id,
        "user_id": teacher.user_id,
        "department": teacher.department,
        "office": teacher.office,
        "phone": teacher.phone,
        "bio": teacher.bio,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "username": current_user.username,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
        }
    }

@router.get("/", response_model=List[TeacherResponse])
def get_all_teachers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Récupérer la liste de tous les professeurs - requires authentication"""
    teachers = db.query(Teacher).offset(skip).limit(limit).all()
    return teachers

@router.get("/{teacher_id}", response_model=TeacherWithUserResponse)
def get_teacher(teacher_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Récupérer le profil d'un professeur - requires authentication"""
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
def update_teacher(teacher_id: int, teacher_update: TeacherUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Modifier le profil d'un professeur - requires authentication"""
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Professeur non trouvé")
    
    # Only the teacher themselves or an admin can update
    if current_user.teacher_profile and current_user.teacher_profile.id != teacher_id:
        raise HTTPException(status_code=403, detail="Vous ne pouvez modifier que votre propre profil")
    
    # Update fields
    for field, value in teacher_update.model_dump(exclude_unset=True).items():
        setattr(teacher, field, value)
    
    db.commit()
    db.refresh(teacher)
    return teacher

@router.get("/{teacher_id}/projects")
def get_teacher_projects(teacher_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Récupérer tous les projets d'un professeur - requires authentication"""
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Professeur non trouvé")
    
    return teacher.projects
