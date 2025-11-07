from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class StudentPreference(Base):
    __tablename__ = "student_preferences"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    
    rank = Column(Integer, nullable=False)  # 1 = premier choix, 2 = deuxième choix, etc.
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = relationship("Student", back_populates="preferences")
    project = relationship("Project", back_populates="student_preferences")
    
    # Contrainte: un étudiant ne peut avoir qu'une seule préférence par projet
    __table_args__ = (
        UniqueConstraint('student_id', 'project_id', name='unique_student_project_preference'),
        UniqueConstraint('student_id', 'rank', name='unique_student_rank'),
    )
