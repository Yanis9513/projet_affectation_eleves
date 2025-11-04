from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    min_students = Column(Integer, default=1)
    max_students = Column(Integer, default=5)
    required_language_level = Column(String)  # e.g., "B1", "B2"
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    interested_students = relationship("Student", secondary="student_preferences", back_populates="project_preferences")
    assignments = relationship("Assignment", back_populates="project")
