from sqlalchemy import Column, Integer, ForeignKey, Float, DateTime, String
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), unique=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    satisfaction_score = Column(Float)  # Score from the algorithm
    created_at = Column(DateTime, default=datetime.utcnow)
    algorithm_run_id = Column(String)  # To group assignments from same algorithm run
    
    # Relationships
    student = relationship("Student", back_populates="assigned_project")
    project = relationship("Project", back_populates="assignments")
