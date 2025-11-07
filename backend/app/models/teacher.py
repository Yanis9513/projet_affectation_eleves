from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    department = Column(String, nullable=True)  # Département du professeur
    office = Column(String, nullable=True)  # Bureau
    phone = Column(String, nullable=True)
    bio = Column(String, nullable=True)  # Biographie courte
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="teacher_profile")
    projects = relationship("Project", back_populates="teacher", cascade="all, delete-orphan")
