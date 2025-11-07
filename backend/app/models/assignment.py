from sqlalchemy import Column, Integer, ForeignKey, Float, DateTime, String, Boolean, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    
    # Scores et satisfaction
    preference_rank = Column(Integer, nullable=True)  # Le rang de préférence obtenu (1 = premier choix)
    satisfaction_score = Column(Float, nullable=True)  # Score de satisfaction calculé (0-10)
    algorithm_score = Column(Float, nullable=True)  # Score donné par l'algorithme génétique
    algorithm_run_id = Column(String, nullable=True)  # To group assignments from same algorithm run
    
    # Validation
    is_validated = Column(Boolean, default=False)  # Affectation validée par admin/professeur
    validated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Notes et commentaires
    notes = Column(Text, nullable=True)  # Notes de l'admin/professeur
    
    # Dates
    assigned_at = Column(DateTime, default=datetime.utcnow)
    validated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    student = relationship("Student", back_populates="assignments")
    project = relationship("Project", back_populates="assignments")
    
    # Contrainte: un étudiant ne peut être affecté qu'à un seul projet
    __table_args__ = (
        UniqueConstraint('student_id', name='unique_student_assignment'),
    )
