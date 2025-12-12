from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint, String
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class StudentPreference(Base):
    __tablename__ = "student_preferences"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    
    rank = Column(Integer, nullable=False)  # 1 = premier choix, 2 = deuxième choix, etc.
    
    # NEW: Partner preference for group projects
    preferred_partner_id = Column(Integer, ForeignKey("students.id", ondelete="SET NULL"), nullable=True)
    
    # NEW: University ranking for exchange programs (A-F)
    university_ranking = Column(String(10), nullable=True)  # Stores something like "A,B,C,D,F"
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = relationship("Student", foreign_keys=[student_id], back_populates="preferences")
    preferred_partner = relationship("Student", foreign_keys=[preferred_partner_id])
    project = relationship("Project", back_populates="student_preferences")
    
    # Contrainte: un étudiant ne peut avoir qu'une seule préférence par projet
    __table_args__ = (
        UniqueConstraint('student_id', 'project_id', name='unique_student_project_preference'),
        UniqueConstraint('student_id', 'rank', name='unique_student_rank'),
    )
