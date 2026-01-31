"""
Routes API pour la gestion des programmes d'échange (workflow complet)
"""

from typing import List, Dict
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project, ProjectType, Destination, Student
from app.schemas import DestinationResponse, MessageResponse
from app.api.routes.auth import get_current_user, require_teacher
from app.services.exchange_service import (
    run_exchange_optimization,
    fill_missing_preferences_with_f,
    get_student_preferences_for_project,
    get_all_project_destinations,
    get_project_students
)

router = APIRouter(prefix="/exchange", tags=["exchange"])


@router.post("/projects/{project_id}/launch", response_model=MessageResponse)
def launch_exchange_program(
    project_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_teacher)
):
    """
    Lancer un programme d'échange
    Cette action:
    1. Vérifie que le projet est de type EXCHANGE_PROGRAM
    2. Vérifie qu'il y a des étudiants inscrits
    3. Vérifie qu'il y a des destinations définies
    4. Ouvre le projet pour les préférences des étudiants
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    
    # Vérifier que c'est un projet d'échange
    if project.project_type != ProjectType.EXCHANGE_PROGRAM:
        raise HTTPException(
            status_code=400,
            detail="Cette action n'est disponible que pour les projets de type 'exchange_program'"
        )
    
    # Vérifier les étudiants
    students = project.students
    if not students:
        raise HTTPException(
            status_code=400,
            detail="Aucun étudiant inscrit dans ce projet. Ajoutez des étudiants avant de lancer."
        )
    
    # Vérifier les destinations
    destinations = db.query(Destination).filter(Destination.project_id == project_id).all()
    if not destinations:
        raise HTTPException(
            status_code=400,
            detail="Aucune destination définie pour ce projet. Ajoutez des universités avant de lancer."
        )
    
    # Ouvrir le projet pour les préférences
    project.is_open_for_preferences = True
    project.is_active = True
    db.commit()
    
    return MessageResponse(
        message=f"Programme d'échange '{project.title}' lancé avec succès. {len(students)} étudiants peuvent maintenant soumettre leurs préférences pour {len(destinations)} destinations.",
        success=True
    )


@router.post("/projects/{project_id}/close-preferences", response_model=MessageResponse)
def close_preferences(
    project_id: int,
    auto_fill_missing: bool = True,
    db: Session = Depends(get_db),
    current_user = Depends(require_teacher)
):
    """
    Clôturer la période de préférences
    Si auto_fill_missing=True, remplit automatiquement les préférences manquantes avec des F
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    
    if project.project_type != ProjectType.EXCHANGE_PROGRAM:
        raise HTTPException(
            status_code=400,
            detail="Cette action n'est disponible que pour les projets de type 'exchange_program'"
        )
    
    # Fermer les préférences
    project.is_open_for_preferences = False
    
    message_parts = ["Période de préférences clôturée."]
    
    # Remplir les préférences manquantes si demandé
    if auto_fill_missing:
        count, modifications = fill_missing_preferences_with_f(db, project_id, dry_run=False)
        if count > 0:
            message_parts.append(f"{count} étudiant(s) n'avaient pas rempli leurs préférences. Des grades F ont été attribués automatiquement.")
        else:
            message_parts.append("Tous les étudiants avaient rempli leurs préférences.")
    
    db.commit()
    
    return MessageResponse(
        message=" ".join(message_parts),
        success=True
    )


@router.post("/projects/{project_id}/preview-missing-preferences")
def preview_missing_preferences(
    project_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_teacher)
):
    """
    Prévisualiser les étudiants qui n'ont pas rempli toutes leurs préférences
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    
    if project.project_type != ProjectType.EXCHANGE_PROGRAM:
        raise HTTPException(
            status_code=400,
            detail="Cette action n'est disponible que pour les projets de type 'exchange_program'"
        )
    
    count, modifications = fill_missing_preferences_with_f(db, project_id, dry_run=True)
    
    return {
        "project_id": project_id,
        "project_title": project.title,
        "students_with_missing_preferences": count,
        "total_students": len(project.students),
        "preview": modifications
    }


@router.post("/projects/{project_id}/run-optimization")
def run_optimization(
    project_id: int,
    algorithm: str = "greedy",  # "greedy" ou "genetic"
    respect_constraints: bool = True,
    db: Session = Depends(get_db),
    current_user = Depends(require_teacher)
):
    """
    Lancer l'algorithme d'optimisation pour assigner les étudiants aux destinations
    
    Args:
        algorithm: "greedy" (rapide, déterministe) ou "genetic" (plus lent, meilleures solutions)
        respect_constraints: Si True, vérifie les contraintes des destinations (filière, anglais, etc.)
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    
    if project.project_type != ProjectType.EXCHANGE_PROGRAM:
        raise HTTPException(
            status_code=400,
            detail="Cette action n'est disponible que pour les projets de type 'exchange_program'"
        )
    
    # Vérifier que les préférences sont clôturées
    if project.is_open_for_preferences:
        raise HTTPException(
            status_code=400,
            detail="Les préférences doivent être clôturées avant de lancer l'optimisation."
        )
    
    # Lancer l'algorithme
    result = run_exchange_optimization(db, project_id, algorithm, respect_constraints)
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result


@router.get("/projects/{project_id}/students-status")
def get_students_preferences_status(
    project_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Obtenir le statut des préférences de tous les étudiants d'un projet
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    
    destinations = get_all_project_destinations(db, project_id)
    students = get_project_students(db, project_id)
    preferences = get_student_preferences_for_project(db, project_id)
    
    students_status = []
    for student in students:
        student_id = student.id
        student_prefs = preferences.get(student_id, {})
        
        # Construire le statut pour chaque destination
        dest_status = []
        for dest in destinations:
            dest_status.append({
                "destination_id": dest.id,
                "university_name": dest.university_name,
                "grade": student_prefs.get(dest.id, None)  # None = pas de préférence
            })
        
        filled_count = len(student_prefs)
        total_destinations = len(destinations)
        
        students_status.append({
            "student_id": student_id,
            "student_name": f"{student.user.first_name} {student.user.last_name}" if student.user else f"Student {student_id}",
            "email": student.user.email if student.user else None,
            "filiere": student.filiere.value if student.filiere else None,
            "filled_preferences": filled_count,
            "total_destinations": total_destinations,
            "is_complete": filled_count == total_destinations,
            "preferences": dest_status
        })
    
    return {
        "project_id": project_id,
        "project_title": project.title,
        "is_open": project.is_open_for_preferences,
        "deadline": project.deadline.isoformat() if project.deadline else None,
        "total_students": len(students),
        "students_completed": sum(1 for s in students_status if s['is_complete']),
        "students": students_status
    }


@router.get("/projects/{project_id}/statistics")
def get_project_statistics(
    project_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_teacher)
):
    """
    Obtenir les statistiques d'un projet d'échange
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    
    if project.project_type != ProjectType.EXCHANGE_PROGRAM:
        raise HTTPException(
            status_code=400,
            detail="Cette action n'est disponible que pour les projets de type 'exchange_program'"
        )
    
    students = get_project_students(db, project_id)
    destinations = get_all_project_destinations(db, project_id)
    preferences = get_student_preferences_for_project(db, project_id)
    
    # Statistiques générales
    total_students = len(students)
    total_destinations = len(destinations)
    total_places = sum(d.total_places for d in destinations)
    
    # Statistiques des préférences
    students_completed = 0
    grade_distribution = {"A": 0, "B": 0, "C": 0, "D": 0, "E": 0, "F": 0}
    
    for student in students:
        student_prefs = preferences.get(student.id, {})
        if len(student_prefs) == total_destinations:
            students_completed += 1
        
        for grade in student_prefs.values():
            if grade in grade_distribution:
                grade_distribution[grade] += 1
    
    return {
        "project_id": project_id,
        "project_title": project.title,
        "is_active": project.is_active,
        "is_open_for_preferences": project.is_open_for_preferences,
        "deadline": project.deadline.isoformat() if project.deadline else None,
        "statistics": {
            "total_students": total_students,
            "students_completed_preferences": students_completed,
            "completion_rate": round(students_completed / total_students * 100, 2) if total_students > 0 else 0,
            "total_destinations": total_destinations,
            "total_available_places": total_places,
            "grade_distribution": grade_distribution
        }
    }
