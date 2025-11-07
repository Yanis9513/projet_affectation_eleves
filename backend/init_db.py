"""
Script pour initialiser la base de données
Crée toutes les tables selon les modèles définis
"""

from app.database import engine, Base
from app.models import (
    User, Student, Teacher, Project, Assignment,
    StudentPreference, FormQuestion, StudentResponse
)

def init_db():
    """Créer toutes les tables dans la base de données"""
    print("🔧 Création des tables de la base de données...")
    
    # Créer toutes les tables
    Base.metadata.create_all(bind=engine)
    
    print("✅ Base de données initialisée avec succès!")
    print("\nTables créées:")
    print("  - users (utilisateurs: admin, professeurs, élèves)")
    print("  - teachers (profils professeurs)")
    print("  - students (profils élèves)")
    print("  - projects (projets d'affectation)")
    print("  - form_questions (questions de formulaire)")
    print("  - student_responses (réponses des élèves)")
    print("  - student_preferences (préférences des élèves)")
    print("  - assignments (affectations finales)")

if __name__ == "__main__":
    init_db()
