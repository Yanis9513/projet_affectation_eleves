"""
Routes API pour les destinations (universités partenaires)
"""

from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Destination, Project, ProjectType, DestinationPreference, Student
from app.schemas import (
    DestinationCreate, 
    DestinationUpdate, 
    DestinationResponse,
    DestinationPreferencesSubmit,
    DestinationPreferenceResponse
)
from app.api.routes.auth import get_current_user, require_teacher

router = APIRouter(prefix="/destinations", tags=["destinations"])


# =============================================================================
# STATIC ROUTES - Must be defined BEFORE dynamic routes
# =============================================================================

@router.post("/preferences", response_model=List[DestinationPreferenceResponse], status_code=status.HTTP_201_CREATED)
def submit_destination_preferences(
    preferences_data: DestinationPreferencesSubmit,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Soumettre les préférences de destination pour un étudiant
    L'étudiant attribue une note de A (plus préférable) à F (moins préférable) à chaque destination
    """
    # Vérifier que l'utilisateur est un étudiant
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    
    if not student:
        raise HTTPException(
            status_code=403, 
            detail="Vous devez être un étudiant pour soumettre des préférences"
        )
    
    # Vérifier que le projet existe et est de type exchange_program
    project = db.query(Project).filter(Project.id == preferences_data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    
    if project.project_type != ProjectType.EXCHANGE_PROGRAM:
        raise HTTPException(
            status_code=400,
            detail="Ce type de projet ne supporte pas les préférences de destination"
        )
    
    # Vérifier que le projet est ouvert pour les préférences
    if not project.is_open_for_preferences:
        raise HTTPException(status_code=400, detail="Ce projet n'accepte plus de préférences")
    
    # Vérifier que la deadline n'est pas dépassée
    if project.deadline and project.deadline < datetime.utcnow():
        raise HTTPException(status_code=400, detail="La deadline pour soumettre les préférences est dépassée")
    
    # Vérifier que toutes les destinations existent et appartiennent au bon projet
    destination_ids = [pref.destination_id for pref in preferences_data.preferences]
    destinations = db.query(Destination).filter(
        Destination.id.in_(destination_ids),
        Destination.project_id == preferences_data.project_id
    ).all()
    
    if len(destinations) != len(destination_ids):
        raise HTTPException(status_code=400, detail="Une ou plusieurs destinations sont invalides")
    
    # Vérifier que chaque destination est unique
    if len(destination_ids) != len(set(destination_ids)):
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas sélectionner la même destination plusieurs fois")
    
    # Supprimer les préférences existantes de cet étudiant pour ce projet
    db.query(DestinationPreference).filter(
        DestinationPreference.student_id == student.id,
        DestinationPreference.project_id == preferences_data.project_id
    ).delete()
    
    # Créer les nouvelles préférences avec le système de notes A-F
    created_preferences = []
    for pref in preferences_data.preferences:
        db_pref = DestinationPreference(
            student_id=student.id,
            destination_id=pref.destination_id,
            project_id=preferences_data.project_id,
            grade=pref.grade.upper()
        )
        db.add(db_pref)
        created_preferences.append(db_pref)
    
    db.commit()
    
    # Recharger avec les relations
    for pref in created_preferences:
        db.refresh(pref)
    
    # Construire la réponse avec les dates converties en strings
    result = []
    for pref in created_preferences:
        pref_dict = {
            "id": pref.id,
            "student_id": pref.student_id,
            "destination_id": pref.destination_id,
            "project_id": pref.project_id,
            "grade": pref.grade,
            "created_at": pref.created_at.isoformat() if pref.created_at else None,
            "updated_at": pref.updated_at.isoformat() if pref.updated_at else None,
        }
        # Ajouter les infos de destination si disponibles
        if pref.destination:
            pref_dict["destination"] = {
                "id": pref.destination.id,
                "project_id": pref.destination.project_id,
                "university_name": pref.destination.university_name,
                "country": pref.destination.country,
                "city": pref.destination.city,
                "total_places": pref.destination.total_places,
                "available_places": pref.destination.available_places,
                "mobility_type": pref.destination.mobility_type.value if hasattr(pref.destination.mobility_type, 'value') else pref.destination.mobility_type,
                "accepted_filieres": pref.destination.accepted_filieres,
                "min_english_level": pref.destination.min_english_level,
                "min_toeic_score": pref.destination.min_toeic_score,
                "min_gpa": pref.destination.min_gpa,
                "description": pref.destination.description,
                "website_url": pref.destination.website_url,
                "is_active": pref.destination.is_active,
                "created_at": pref.destination.created_at.isoformat() if pref.destination.created_at else None,
                "updated_at": pref.destination.updated_at.isoformat() if pref.destination.updated_at else None,
            }
        result.append(pref_dict)
    
    return result


@router.get("/preferences/{project_id}", response_model=List[DestinationPreferenceResponse])
def get_my_destination_preferences(
    project_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Récupérer mes préférences de destination pour un projet"""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=403, detail="Seuls les étudiants peuvent consulter leurs préférences")
    
    preferences = db.query(DestinationPreference).filter(
        DestinationPreference.student_id == student.id,
        DestinationPreference.project_id == project_id
    ).all()
    
    # Convertir les dates en strings pour la réponse
    result = []
    for pref in preferences:
        pref_dict = {
            "id": pref.id,
            "student_id": pref.student_id,
            "destination_id": pref.destination_id,
            "project_id": pref.project_id,
            "grade": pref.grade,
            "created_at": pref.created_at.isoformat() if pref.created_at else None,
            "updated_at": pref.updated_at.isoformat() if pref.updated_at else None,
        }
        # Ajouter les infos de destination si disponibles
        if pref.destination:
            pref_dict["destination"] = {
                "id": pref.destination.id,
                "project_id": pref.destination.project_id,
                "university_name": pref.destination.university_name,
                "country": pref.destination.country,
                "city": pref.destination.city,
                "total_places": pref.destination.total_places,
                "available_places": pref.destination.available_places,
                "mobility_type": pref.destination.mobility_type.value if hasattr(pref.destination.mobility_type, 'value') else pref.destination.mobility_type,
                "accepted_filieres": pref.destination.accepted_filieres,
                "min_english_level": pref.destination.min_english_level,
                "min_toeic_score": pref.destination.min_toeic_score,
                "min_gpa": pref.destination.min_gpa,
                "description": pref.destination.description,
                "website_url": pref.destination.website_url,
                "is_active": pref.destination.is_active,
                "created_at": pref.destination.created_at.isoformat() if pref.destination.created_at else None,
                "updated_at": pref.destination.updated_at.isoformat() if pref.destination.updated_at else None,
            }
        result.append(pref_dict)
    
    return result


# =============================================================================
# DYNAMIC ROUTES - Must be defined AFTER static routes
# =============================================================================

@router.post("/{project_id}/bulk", response_model=List[DestinationResponse], status_code=status.HTTP_201_CREATED)
def upload_destinations_bulk(
    project_id: int,
    destinations_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(require_teacher)
):
    """
    Upload multiple destinations at once
    Body: { "destinations": [ {...}, {...}, ... ] }
    """
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    
    if project.project_type != ProjectType.EXCHANGE_PROGRAM:
        raise HTTPException(
            status_code=400,
            detail="Ce type de projet ne supporte pas les destinations"
        )
    
    destinations = destinations_data.get("destinations", [])
    if not destinations:
        raise HTTPException(status_code=400, detail="Aucune destination fournie")
    
    created_destinations = []
    
    for dest_data in destinations:
        # Create destination
        db_destination = Destination(
            project_id=project_id,
            university_name=dest_data.get("university_name"),
            country=dest_data.get("country"),
            city=dest_data.get("city", ""),
            total_places=dest_data.get("total_places", 1),
            available_places=dest_data.get("total_places", 1),  # Initially all places available
            mobility_type=dest_data.get("mobility_type", "ECHANGE_ACADEMIQUE"),
            accepted_filieres=dest_data.get("accepted_filieres", "ALL"),
            min_english_level=dest_data.get("min_english_level"),
            min_toeic_score=dest_data.get("min_toeic_score"),
            min_gpa=dest_data.get("min_gpa"),
            description=dest_data.get("description"),
            website_url=dest_data.get("website_url"),
            is_active=True
        )
        
        db.add(db_destination)
        created_destinations.append(db_destination)
    
    db.commit()
    
    # Refresh all destinations to get their IDs
    for dest in created_destinations:
        db.refresh(dest)
    
    # Convert to response format
    result = []
    for dest in created_destinations:
        dest_dict = {
            "id": dest.id,
            "project_id": dest.project_id,
            "university_name": dest.university_name,
            "country": dest.country,
            "city": dest.city,
            "total_places": dest.total_places,
            "available_places": dest.available_places,
            "mobility_type": dest.mobility_type.value if hasattr(dest.mobility_type, 'value') else dest.mobility_type,
            "accepted_filieres": dest.accepted_filieres,
            "min_english_level": dest.min_english_level,
            "min_toeic_score": dest.min_toeic_score,
            "min_gpa": dest.min_gpa,
            "description": dest.description,
            "website_url": dest.website_url,
            "is_active": dest.is_active,
            "created_at": dest.created_at.isoformat() if dest.created_at else None,
            "updated_at": dest.updated_at.isoformat() if dest.updated_at else None,
        }
        result.append(dest_dict)
    
    return result


@router.post("/{project_id}", response_model=DestinationResponse, status_code=status.HTTP_201_CREATED)
def create_destination(
    project_id: int,
    destination: DestinationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_teacher)
):
    """Créer une nouvelle destination pour un projet d'échange"""
    # Vérifier que le projet existe et est de type exchange_program
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    
    if project.project_type != ProjectType.EXCHANGE_PROGRAM:
        raise HTTPException(
            status_code=400,
            detail="Les destinations ne peuvent être ajoutées qu'aux projets de type 'exchange_program'"
        )
    
    # Créer la destination — set available_places = total_places by default
    dest_data = destination.model_dump()
    db_destination = Destination(
        project_id=project_id,
        available_places=dest_data.get("total_places", 0),
        **dest_data
    )
    
    db.add(db_destination)
    db.commit()
    db.refresh(db_destination)
    
    return db_destination


@router.get("/{project_id}", response_model=List[DestinationResponse])
def get_project_destinations(
    project_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Récupérer toutes les destinations d'un projet"""
    destinations = db.query(Destination).filter(
        Destination.project_id == project_id
    ).all()
    
    # Convert datetime fields to ISO format strings
    result = []
    for dest in destinations:
        dest_dict = {
            "id": dest.id,
            "project_id": dest.project_id,
            "university_name": dest.university_name,
            "country": dest.country,
            "city": dest.city,
            "total_places": dest.total_places,
            "available_places": dest.available_places,
            "mobility_type": dest.mobility_type.value if hasattr(dest.mobility_type, 'value') else dest.mobility_type,
            "accepted_filieres": dest.accepted_filieres,
            "min_english_level": dest.min_english_level,
            "min_toeic_score": dest.min_toeic_score,
            "min_gpa": dest.min_gpa,
            "description": dest.description,
            "website_url": dest.website_url,
            "is_active": dest.is_active,
            "created_at": dest.created_at.isoformat() if dest.created_at else None,
            "updated_at": dest.updated_at.isoformat() if dest.updated_at else None,
        }
        result.append(dest_dict)
    
    return result


@router.get("/detail/{destination_id}", response_model=DestinationResponse)
def get_destination(
    destination_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Récupérer les détails d'une destination"""
    destination = db.query(Destination).filter(Destination.id == destination_id).first()
    
    if not destination:
        raise HTTPException(status_code=404, detail="Destination non trouvée")
    
    return destination


@router.put("/{destination_id}", response_model=DestinationResponse)
def update_destination(
    destination_id: int,
    destination_update: DestinationUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_teacher)
):
    """Mettre à jour une destination"""
    db_destination = db.query(Destination).filter(Destination.id == destination_id).first()
    
    if not db_destination:
        raise HTTPException(status_code=404, detail="Destination non trouvée")
    
    # Mettre à jour les champs
    update_data = destination_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_destination, field, value)
    
    db.commit()
    db.refresh(db_destination)
    
    return db_destination


@router.delete("/{destination_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_destination(
    destination_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_teacher)
):
    """Supprimer une destination"""
    destination = db.query(Destination).filter(Destination.id == destination_id).first()
    
    if not destination:
        raise HTTPException(status_code=404, detail="Destination non trouvée")
    
    db.delete(destination)
    db.commit()
    
    return None
