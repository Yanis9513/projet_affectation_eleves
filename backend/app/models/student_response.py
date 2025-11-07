from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class StudentResponse(Base):
    __tablename__ = "student_responses"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("form_questions.id", ondelete="CASCADE"), nullable=False)
    
    response_text = Column(Text, nullable=True)  # Réponse texte
    response_value = Column(String, nullable=True)  # Pour choix multiples, échelle, oui/non
    
    submitted_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    student = relationship("Student", back_populates="form_responses")
    question = relationship("FormQuestion", back_populates="responses")
