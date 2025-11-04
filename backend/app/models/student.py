from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base

# Association table for student preferences (many-to-many)
student_preferences = Table(
    'student_preferences',
    Base.metadata,
    Column('student_id', Integer, ForeignKey('students.id')),
    Column('project_id', Integer, ForeignKey('projects.id')),
    Column('preference_order', Integer)  # 1 = first choice, 2 = second choice, etc.
)

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    student_number = Column(String, unique=True, nullable=False)
    ranking = Column(Integer)  # Academic ranking
    language_level = Column(String)  # e.g., "B1", "B2", "C1"
    
    # Relationships
    user = relationship("User", back_populates="student_profile")
    project_preferences = relationship("Project", secondary=student_preferences, back_populates="interested_students")
    assigned_project = relationship("Assignment", back_populates="student", uselist=False)
