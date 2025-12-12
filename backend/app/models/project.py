from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime, Enum as SQLEnum, Table
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
from enum import Enum
from .student import EnglishLevel, Filiere

# Association table for many-to-many relationship between projects and students
project_students = Table(
    'project_students',
    Base.metadata,
    Column('project_id', Integer, ForeignKey('projects.id', ondelete='CASCADE'), primary_key=True),
    Column('student_id', Integer, ForeignKey('students.id', ondelete='CASCADE'), primary_key=True),
    Column('enrolled_at', DateTime, default=datetime.utcnow)
)

class ProjectType(str, Enum):
    GROUP_PROJECT = "group_project"  # Standard group project with optional partner preference
    ENGLISH_LEVELING = "english_leveling"  # Equal level groups based on English proficiency
    EXCHANGE_PROGRAM = "exchange_program"  # University assignment based on preferences

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Project Type (NEW)
    project_type = Column(SQLEnum(ProjectType), default=ProjectType.GROUP_PROJECT, nullable=False)
    
    # Contraintes du projet
    min_students = Column(Integer, default=1, nullable=False)
    max_students = Column(Integer, default=5, nullable=False)
    group_size = Column(Integer, default=3, nullable=True)  # NEW: For group projects
    required_english_level = Column(SQLEnum(EnglishLevel), nullable=True)
    target_filiere = Column(SQLEnum(Filiere), nullable=True)  # Si le projet cible une filière spécifique
    
    # Formulaire personnalisé
    has_custom_form = Column(Boolean, default=False)  # Indique si le projet a un formulaire
    partner_preference_enabled = Column(Boolean, default=True)  # NEW: Allow partner preferences
    
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
    students = relationship("Student", secondary=project_students, back_populates="projects")
