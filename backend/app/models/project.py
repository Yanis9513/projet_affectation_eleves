from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
from .student import EnglishLevel, Filiere

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Contraintes du projet
    min_students = Column(Integer, default=1, nullable=False)
    max_students = Column(Integer, default=5, nullable=False)
    required_english_level = Column(Enum(EnglishLevel), nullable=True)
    target_filiere = Column(Enum(Filiere), nullable=True)  # Si le projet cible une filière spécifique
    
    # Formulaire personnalisé
    has_custom_form = Column(Boolean, default=False)  # Indique si le projet a un formulaire
    
    # Statut et dates
    is_active = Column(Boolean, default=True)
    is_open_for_preferences = Column(Boolean, default=True)  # Les élèves peuvent-ils choisir ce projet?
    deadline = Column(DateTime, nullable=True)  # Date limite de soumission des préférences
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    teacher = relationship("Teacher", back_populates="projects")
    form_questions = relationship("FormQuestion", back_populates="project", cascade="all, delete-orphan")
    student_preferences = relationship("StudentPreference", back_populates="project", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="project", cascade="all, delete-orphan")
