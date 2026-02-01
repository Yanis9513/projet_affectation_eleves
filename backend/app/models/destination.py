from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
from enum import Enum

class MobilityType(str, Enum):
    """Type de mobilité internationale"""
    ECHANGE_ACADEMIQUE = "Échange Académique"
    STAGE_INTERNATIONAL = "Stage International"
    DOUBLE_DIPLOME = "Double Diplôme"
    SEMESTRE_RECHERCHE = "Semestre Recherche"

class Destination(Base):
    """
    Universités/Destinations partenaires pour les programmes d'échange
    """
    __tablename__ = "destinations"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    
    # Informations de l'université
    university_name = Column(String(255), nullable=False, index=True)
    country = Column(String(100), nullable=False)
    city = Column(String(100), nullable=True)
    
    # Contraintes et capacités
    total_places = Column(Integer, nullable=False)  # Nombre total de places
    available_places = Column(Integer, nullable=False)  # Places restantes
    
    # Type de mobilité accepté
    mobility_type = Column(SQLEnum(MobilityType), nullable=False)
    
    # Filières acceptées (stocké comme string séparé par virgules)
    # Ex: "Informatique,Électronique,Réseaux et Télécommunications"
    accepted_filieres = Column(Text, nullable=False)
    
    # Exigences minimales
    min_english_level = Column(String(2), nullable=True)  # Ex: "B2", "C1"
    min_toeic_score = Column(Integer, nullable=True)  # Score TOEIC minimum
    min_gpa = Column(Float, nullable=True)  # Moyenne minimale requise
    
    # Informations supplémentaires
    description = Column(Text, nullable=True)
    website_url = Column(String(500), nullable=True)
    
    # Statut
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="destinations")
    student_preferences = relationship("DestinationPreference", back_populates="destination", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="destination")
    
    def has_available_places(self) -> bool:
        """Vérifie s'il reste des places disponibles"""
        return self.available_places > 0
    
    def accepts_filiere(self, filiere: str) -> bool:
        """Vérifie si la filière est acceptée"""
        accepted = [f.strip() for f in self.accepted_filieres.split(',')]
        return filiere in accepted
    
    def __repr__(self):
        return f"<Destination {self.university_name} ({self.country}) - {self.available_places}/{self.total_places} places>"
