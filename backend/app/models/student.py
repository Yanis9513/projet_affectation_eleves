from sqlalchemy import Column, Integer, String, ForeignKey, Float, Enum, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum

class EnglishLevel(str, enum.Enum):
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"

class Filiere(str, enum.Enum):
    INFORMATIQUE = "Informatique"
    ELECTRONIQUE = "Électronique"
    ENERGIE = "Énergie"
    BIOTECHNOLOGIE = "Biotechnologie"
    SYSTEMES_EMBARQUES = "Systèmes Embarqués"
    RESEAUX = "Réseaux et Télécommunications"
    AUTRE = "Autre"

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    student_number = Column(String, unique=True, index=True, nullable=False)
    filiere = Column(Enum(Filiere), nullable=False)
    english_level = Column(Enum(EnglishLevel), nullable=False, default=EnglishLevel.B1)
    general_rank = Column(Integer, nullable=True)  # Rang général dans la filière
    gpa = Column(Float, nullable=True)  # Note moyenne générale
    promotion = Column(String, nullable=True)  # Ex: "2025", "2026"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="student_profile")
    preferences = relationship("StudentPreference", foreign_keys="[StudentPreference.student_id]", back_populates="student", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="student", cascade="all, delete-orphan")
    form_responses = relationship("StudentResponse", back_populates="student", cascade="all, delete-orphan")
    projects = relationship("Project", secondary="project_students", back_populates="students")
