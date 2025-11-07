from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Text, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..database import Base

class QuestionType(str, enum.Enum):
    TEXT = "text"  # Réponse texte libre
    TEXTAREA = "textarea"  # Réponse longue
    MULTIPLE_CHOICE = "multiple_choice"  # Choix multiple (une seule réponse)
    CHECKBOX = "checkbox"  # Cases à cocher (plusieurs réponses)
    SCALE = "scale"  # Échelle (1-5, 1-10)
    YES_NO = "yes_no"  # Oui/Non

class FormQuestion(Base):
    __tablename__ = "form_questions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    
    question_text = Column(Text, nullable=False)
    question_type = Column(Enum(QuestionType), nullable=False, default=QuestionType.TEXT)
    
    # Pour les questions à choix multiples
    options = Column(Text, nullable=True)  # JSON string: ["Option 1", "Option 2", "Option 3"]
    
    # Paramètres
    is_required = Column(Boolean, default=False)
    order = Column(Integer, default=0)  # Ordre d'affichage
    
    # Pour les échelles
    scale_min = Column(Integer, nullable=True)  # Ex: 1
    scale_max = Column(Integer, nullable=True)  # Ex: 10
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="form_questions")
    responses = relationship("StudentResponse", back_populates="question", cascade="all, delete-orphan")
