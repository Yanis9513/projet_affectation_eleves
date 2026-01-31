from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class DestinationPreference(Base):
    """
    Préférences des étudiants pour les destinations (universités d'échange)
    Système de notation de A (plus préférable) à F (moins préférable)
    """
    __tablename__ = "destination_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    
    # Grade de préférence (A = meilleur, F = pire)
    grade = Column(String(1), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = relationship("Student", backref="destination_preferences")
    destination = relationship("Destination", back_populates="student_preferences")
    project = relationship("Project", backref="destination_preferences")
    
    # Contraintes - grade doit être entre A et F
    __table_args__ = (
        CheckConstraint("grade IN ('A', 'B', 'C', 'D', 'E', 'F')", name='check_grade_range'),
    )
    
    def __repr__(self):
        return f"<DestinationPreference Student {self.student_id} -> Destination {self.destination_id} (Grade {self.grade})>"
