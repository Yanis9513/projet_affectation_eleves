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
    from app.models.student import Student
    from app.models.user import User
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    
    preferences = db.query(StudentPreference).filter(
        StudentPreference.project_id == project_id
    ).order_by(StudentPreference.student_id).all()
    
    # Build detailed list with student and partner info
    detailed_preferences = []
    for pref in preferences:
        student = db.query(Student).filter(Student.id == pref.student_id).first()
        student_user = student.user if student else None
        
        partner = None
        if pref.preferred_partner_id:
            partner_student = db.query(Student).filter(Student.id == pref.preferred_partner_id).first()
            if partner_student:
                partner = {
                    "id": partner_student.id,
                    "name": f"{partner_student.user.first_name} {partner_student.user.last_name}" if partner_student.user else "Unknown",
                    "email": partner_student.user.email if partner_student.user else None
                }
        
        detailed_preferences.append({
            "id": pref.id,
            "student_id": pref.student_id,
            "student_name": f"{student_user.first_name} {student_user.last_name}" if student_user else "Unknown",
            "student_email": student_user.email if student_user else None,
            "preferred_partner_id": pref.preferred_partner_id,
            "preferred_partner": partner,
            "rank": pref.rank,
            "submitted_at": pref.created_at.isoformat() if pref.created_at else None
        })
    
    # Calculate mutual matches
    mutual_matches = []
    for pref in detailed_preferences:
        if pref["preferred_partner_id"]:
            # Check if the partner also prefers this student
            partner_pref = next(
                (p for p in detailed_preferences if p["student_id"] == pref["preferred_partner_id"]),
                None
            )
            if partner_pref and partner_pref["preferred_partner_id"] == pref["student_id"]:
                # This is a mutual match - add if not already added
                pair = tuple(sorted([pref["student_id"], pref["preferred_partner_id"]]))
                if pair not in [(tuple(sorted([m["student1"]["id"], m["student2"]["id"]]))) for m in mutual_matches]:
                    mutual_matches.append({
                        "student1": {
                            "id": pref["student_id"],
                            "name": pref["student_name"]
                        },
                        "student2": {
                            "id": partner_pref["student_id"],
                            "name": partner_pref["student_name"]
                        }
                    })
    
    # Count students with and without preferences
    total_students_in_project = db.query(Student).filter(
        Student.projects.any(id=project_id)
    ).count()
    
    return {
        "project_id": project_id,
        "project_title": project.title,
        "project_type": project.project_type.value if hasattr(project.project_type, 'value') else str(project.project_type),
        "total_students": total_students_in_project,
        "students_with_preferences": len(preferences),
        "students_without_preferences": total_students_in_project - len(preferences),
        "mutual_matches_count": len(mutual_matches),
        "mutual_matches": mutual_matches,
        "preferences": detailed_preferences
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
