from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.preference import StudentPreference
from app.models.student import Student
from app.models.project import Project
from app.schemas import PreferenceCreate, PreferenceResponse, MessageResponse
from pydantic import BaseModel, validator
from datetime import datetime

router = APIRouter()

# Additional schemas (keeping existing ones for compatibility)
class PreferenceBase(BaseModel):
    project_id: int
    rank: int

class PreferenceUpdate(BaseModel):
    rank: int

class PreferenceWithProjectResponse(PreferenceResponse):
    project: dict

class PreferencesBulkCreate(BaseModel):
    preferences: List[PreferenceBase]
    
    @validator('preferences')
    @classmethod
    def validate_preferences(cls, v):
        if not v:
            raise ValueError("La liste de préférences ne peut pas être vide")
        
        # Vérifier que les rangs sont uniques
        ranks = [pref.rank for pref in v]
        if len(ranks) != len(set(ranks)):
            raise ValueError("Les rangs doivent être uniques")
        
        # Vérifier que les project_ids sont uniques
        project_ids = [pref.project_id for pref in v]
        if len(project_ids) != len(set(project_ids)):
            raise ValueError("Chaque projet ne peut apparaître qu'une seule fois")
        
        # Vérifier que les rangs commencent à 1 et sont consécutifs
        sorted_ranks = sorted(ranks)
        if sorted_ranks[0] != 1:
            raise ValueError("Les rangs doivent commencer à 1")
        
        for i, rank in enumerate(sorted_ranks):
            if rank != i + 1:
                raise ValueError("Les rangs doivent être consécutifs (1, 2, 3, ...)")
        
        return v

# Routes
@router.post("/students/{student_id}/preferences", response_model=List[PreferenceResponse], status_code=status.HTTP_201_CREATED)
def create_student_preferences(
    student_id: int,
    preferences_data: PreferencesBulkCreate,
    db: Session = Depends(get_db)
):
    """Soumettre les préférences d'un étudiant (création en masse)"""
    # Vérifier que l'étudiant existe
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Étudiant non trouvé")
    
    # Vérifier que tous les projets existent et sont ouverts
    for pref in preferences_data.preferences:
        project = db.query(Project).filter(Project.id == pref.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail=f"Projet {pref.project_id} non trouvé")
        if not project.is_active or not project.is_open_for_preferences:
            raise HTTPException(
                status_code=400,
                detail=f"Le projet '{project.title}' n'accepte plus de préférences"
            )
        # Vérifier la deadline
        if project.deadline and project.deadline < datetime.utcnow():
            raise HTTPException(
                status_code=400,
                detail=f"La deadline pour le projet '{project.title}' est dépassée"
            )
    
    # Supprimer les préférences existantes de cet étudiant
    db.query(StudentPreference).filter(StudentPreference.student_id == student_id).delete()
    
    # Créer les nouvelles préférences
    db_preferences = []
    for pref in preferences_data.preferences:
        db_pref = StudentPreference(
            student_id=student_id,
            project_id=pref.project_id,
            rank=pref.rank
        )
        db.add(db_pref)
        db_preferences.append(db_pref)
    
    db.commit()
    for pref in db_preferences:
        db.refresh(pref)
    
    return db_preferences

# ===== NEW: PARTNER PREFERENCE ENDPOINT =====

@router.post("/students/{student_id}/partner-preference", response_model=MessageResponse)
def submit_partner_preference(
    student_id: int,
    preference_data: PreferenceCreate,
    db: Session = Depends(get_db)
):
    """Submit partner preference for a group project"""
    
    # Verify student exists
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Verify project exists
    project = db.query(Project).filter(Project.id == preference_data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify project allows partner preferences
    if not project.partner_preference_enabled:
        raise HTTPException(
            status_code=400,
            detail="This project does not allow partner preferences"
        )
    
    # Check if project is still open
    if not project.is_active or not project.is_open_for_preferences:
        raise HTTPException(status_code=400, detail="Project is no longer accepting preferences")
    
    # Verify deadline
    if project.deadline and project.deadline < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Deadline has passed")
    
    # Verify preferred partner exists (if provided)
    if preference_data.preferred_partner_id:
        partner = db.query(Student).filter(Student.id == preference_data.preferred_partner_id).first()
        if not partner:
            raise HTTPException(status_code=404, detail="Preferred partner not found")
        
        # Prevent self-selection
        if preference_data.preferred_partner_id == student_id:
            raise HTTPException(status_code=400, detail="Cannot select yourself as partner")
    
    # Check if preference already exists
    existing_pref = db.query(StudentPreference).filter(
        StudentPreference.student_id == student_id,
        StudentPreference.project_id == preference_data.project_id
    ).first()
    
    if existing_pref:
        # Update existing preference
        existing_pref.preferred_partner_id = preference_data.preferred_partner_id
        existing_pref.rank = preference_data.rank
        if preference_data.university_ranking:
            existing_pref.university_ranking = preference_data.university_ranking
        db.commit()
        message = "Partner preference updated successfully"
    else:
        # Create new preference
        new_pref = StudentPreference(
            student_id=student_id,
            project_id=preference_data.project_id,
            preferred_partner_id=preference_data.preferred_partner_id,
            rank=preference_data.rank,
            university_ranking=preference_data.university_ranking
        )
        db.add(new_pref)
        db.commit()
        message = "Partner preference submitted successfully"
    
    return MessageResponse(message=message, success=True)

@router.get("/students/{student_id}/preferences", response_model=List[PreferenceWithProjectResponse])
def get_student_preferences(student_id: int, db: Session = Depends(get_db)):
    """Récupérer les préférences d'un étudiant"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Étudiant non trouvé")
    
    preferences = db.query(StudentPreference).filter(
        StudentPreference.student_id == student_id
    ).order_by(StudentPreference.rank).all()
    
    # Enrichir avec les informations du projet
    result = []
    for pref in preferences:
        result.append({
            **pref.__dict__,
            "project": {
                "id": pref.project.id,
                "title": pref.project.title,
                "description": pref.project.description,
                "min_students": pref.project.min_students,
                "max_students": pref.project.max_students,
                "required_english_level": pref.project.required_english_level,
                "teacher_id": pref.project.teacher_id
            }
        })
    
    return result

@router.put("/students/{student_id}/preferences", response_model=List[PreferenceResponse])
def update_student_preferences(
    student_id: int,
    preferences_data: PreferencesBulkCreate,
    db: Session = Depends(get_db)
):
    """Modifier les préférences d'un étudiant (remplace toutes les préférences existantes)"""
    # Utiliser la même logique que la création
    return create_student_preferences(student_id, preferences_data, db)

@router.delete("/students/{student_id}/preferences", status_code=status.HTTP_204_NO_CONTENT)
def delete_student_preferences(student_id: int, db: Session = Depends(get_db)):
    """Supprimer toutes les préférences d'un étudiant"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Étudiant non trouvé")
    
    db.query(StudentPreference).filter(
        StudentPreference.student_id == student_id
    ).delete()
    
    db.commit()
    return None

@router.get("/projects/{project_id}/preferences")
def get_project_preferences(project_id: int, db: Session = Depends(get_db)):
    """Récupérer toutes les préférences pour un projet (utile pour les professeurs)"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    
    preferences = db.query(StudentPreference).filter(
        StudentPreference.project_id == project_id
    ).order_by(StudentPreference.rank).all()
    
    # Grouper par rang
    result = {
        "project_id": project_id,
        "project_title": project.title,
        "total_preferences": len(preferences),
        "by_rank": {}
    }
    
    for pref in preferences:
        rank_str = f"rank_{pref.rank}"
        if rank_str not in result["by_rank"]:
            result["by_rank"][rank_str] = []
        
        result["by_rank"][rank_str].append({
            "student_id": pref.student_id,
            "student_number": pref.student.student_number,
            "student_name": f"{pref.student.user.first_name} {pref.student.user.last_name}",
            "filiere": pref.student.filiere,
            "english_level": pref.student.english_level,
            "general_rank": pref.student.general_rank
        })
    
    return result

@router.get("/preferences/stats")
def get_preferences_stats(db: Session = Depends(get_db)):
    """Récupérer des statistiques globales sur les préférences"""
    total_students = db.query(Student).count()
    students_with_preferences = db.query(StudentPreference.student_id).distinct().count()
    total_projects = db.query(Project).filter(Project.is_active == True).count()
    total_preferences = db.query(StudentPreference).count()
    
    return {
        "total_students": total_students,
        "students_with_preferences": students_with_preferences,
        "students_without_preferences": total_students - students_with_preferences,
        "completion_rate": (students_with_preferences / total_students * 100) if total_students > 0 else 0,
        "total_active_projects": total_projects,
        "total_preferences_submitted": total_preferences,
        "avg_preferences_per_student": (total_preferences / students_with_preferences) if students_with_preferences > 0 else 0
    }
