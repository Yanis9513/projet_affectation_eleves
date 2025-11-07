from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.form_question import FormQuestion, QuestionType
from app.models.student_response import StudentResponse
from app.models.project import Project
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Pydantic schemas
class FormQuestionBase(BaseModel):
    question_text: str
    question_type: QuestionType
    options: Optional[str] = None
    is_required: bool = False
    order: int = 0
    scale_min: Optional[int] = None
    scale_max: Optional[int] = None

class FormQuestionCreate(FormQuestionBase):
    project_id: int

class FormQuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[QuestionType] = None
    options: Optional[str] = None
    is_required: Optional[bool] = None
    order: Optional[int] = None
    scale_min: Optional[int] = None
    scale_max: Optional[int] = None

class FormQuestionResponse(FormQuestionBase):
    id: int
    project_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class StudentResponseCreate(BaseModel):
    question_id: int
    response_text: Optional[str] = None
    response_value: Optional[str] = None

class StudentResponseResponse(BaseModel):
    id: int
    student_id: int
    question_id: int
    response_text: Optional[str]
    response_value: Optional[str]
    submitted_at: datetime
    
    class Config:
        from_attributes = True

# Routes pour les questions de formulaire
@router.post("/projects/{project_id}/forms", response_model=FormQuestionResponse, status_code=status.HTTP_201_CREATED)
def create_form_question(project_id: int, question: FormQuestionCreate, db: Session = Depends(get_db)):
    """Créer une question de formulaire pour un projet"""
    # Vérifier que le projet existe
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    
    # Créer la question
    db_question = FormQuestion(
        project_id=project_id,
        **question.dict(exclude={'project_id'})
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
    # Marquer le projet comme ayant un formulaire
    project.has_custom_form = True
    db.commit()
    
    return db_question

@router.get("/projects/{project_id}/forms", response_model=List[FormQuestionResponse])
def get_project_forms(project_id: int, db: Session = Depends(get_db)):
    """Récupérer toutes les questions de formulaire d'un projet"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    
    questions = db.query(FormQuestion).filter(
        FormQuestion.project_id == project_id
    ).order_by(FormQuestion.order).all()
    
    return questions

@router.put("/projects/{project_id}/forms/{question_id}", response_model=FormQuestionResponse)
def update_form_question(
    project_id: int,
    question_id: int,
    question_update: FormQuestionUpdate,
    db: Session = Depends(get_db)
):
    """Modifier une question de formulaire"""
    question = db.query(FormQuestion).filter(
        FormQuestion.id == question_id,
        FormQuestion.project_id == project_id
    ).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question non trouvée")
    
    # Update fields
    for field, value in question_update.dict(exclude_unset=True).items():
        setattr(question, field, value)
    
    db.commit()
    db.refresh(question)
    return question

@router.delete("/projects/{project_id}/forms/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form_question(project_id: int, question_id: int, db: Session = Depends(get_db)):
    """Supprimer une question de formulaire"""
    question = db.query(FormQuestion).filter(
        FormQuestion.id == question_id,
        FormQuestion.project_id == project_id
    ).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question non trouvée")
    
    db.delete(question)
    db.commit()
    
    # Vérifier s'il reste des questions pour ce projet
    remaining_questions = db.query(FormQuestion).filter(
        FormQuestion.project_id == project_id
    ).count()
    
    if remaining_questions == 0:
        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            project.has_custom_form = False
            db.commit()
    
    return None

# Routes pour les réponses des étudiants
@router.post("/students/{student_id}/responses", response_model=List[StudentResponseResponse], status_code=status.HTTP_201_CREATED)
def submit_student_responses(
    student_id: int,
    responses: List[StudentResponseCreate],
    db: Session = Depends(get_db)
):
    """Soumettre les réponses d'un étudiant à un formulaire"""
    db_responses = []
    
    for response in responses:
        # Vérifier que la question existe
        question = db.query(FormQuestion).filter(FormQuestion.id == response.question_id).first()
        if not question:
            raise HTTPException(status_code=404, detail=f"Question {response.question_id} non trouvée")
        
        # Vérifier si une réponse existe déjà
        existing_response = db.query(StudentResponse).filter(
            StudentResponse.student_id == student_id,
            StudentResponse.question_id == response.question_id
        ).first()
        
        if existing_response:
            # Mettre à jour la réponse existante
            existing_response.response_text = response.response_text
            existing_response.response_value = response.response_value
            existing_response.submitted_at = datetime.utcnow()
            db_responses.append(existing_response)
        else:
            # Créer une nouvelle réponse
            db_response = StudentResponse(
                student_id=student_id,
                **response.dict()
            )
            db.add(db_response)
            db_responses.append(db_response)
    
    db.commit()
    for resp in db_responses:
        db.refresh(resp)
    
    return db_responses

@router.get("/students/{student_id}/responses", response_model=List[StudentResponseResponse])
def get_student_responses(student_id: int, project_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Récupérer toutes les réponses d'un étudiant"""
    query = db.query(StudentResponse).filter(StudentResponse.student_id == student_id)
    
    if project_id:
        # Filtrer par projet
        query = query.join(FormQuestion).filter(FormQuestion.project_id == project_id)
    
    responses = query.all()
    return responses

@router.get("/projects/{project_id}/responses")
def get_project_responses(project_id: int, db: Session = Depends(get_db)):
    """Récupérer toutes les réponses pour un projet (pour les professeurs)"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    
    # Récupérer toutes les réponses avec les informations des étudiants
    responses = db.query(StudentResponse).join(FormQuestion).filter(
        FormQuestion.project_id == project_id
    ).all()
    
    # Grouper par étudiant
    student_responses = {}
    for response in responses:
        if response.student_id not in student_responses:
            student_responses[response.student_id] = {
                "student_id": response.student_id,
                "student": response.student,
                "responses": []
            }
        student_responses[response.student_id]["responses"].append({
            "question_id": response.question_id,
            "question_text": response.question.question_text,
            "response_text": response.response_text,
            "response_value": response.response_value,
            "submitted_at": response.submitted_at
        })
    
    return list(student_responses.values())
