"""
Script pour initialiser la base de données
Crée toutes les tables selon les modèles définis
"""

from app.database import engine, Base
from app.models import (
    User, Student, Teacher, Project, Assignment,
    StudentPreference, FormQuestion, StudentResponse,
    Destination, DestinationPreference
)
from app.config import settings
import sqlite3

def init_db():
    """Créer toutes les tables dans la base de données"""
    print("Creation des tables de la base de donnees...")
    
    # Créer toutes les tables
    Base.metadata.create_all(bind=engine)
    
    # Ajouter les colonnes manquantes si la table existe déjà (migration)
    print("Verification des migrations...")
    try:
        db_path = settings.DATABASE_URL.replace('sqlite:///', '').replace('sqlite:///', '')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Vérifier les colonnes de la table users
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'password_reset_token' not in columns:
            print("  - Ajout de password_reset_token...")
            cursor.execute("ALTER TABLE users ADD COLUMN password_reset_token VARCHAR NULL")
        
        if 'password_reset_expires' not in columns:
            print("  - Ajout de password_reset_expires...")
            cursor.execute("ALTER TABLE users ADD COLUMN password_reset_expires DATETIME NULL")
        
        conn.commit()
        conn.close()
        print("Migrations appliquees avec succes!")
    except Exception as e:
        print(f"  (Migrations non necessaires ou deja appliquees: {type(e).__name__})")
    
    print("\nBase de donnees initialisee avec succes!")
    print("\nTables creees:")
    print("  - users (utilisateurs: admin, professeurs, eleves)")
    print("  - teachers (profils professeurs)")
    print("  - students (profils eleves)")
    print("  - projects (projets d'affectation)")
    print("  - project_students (association projets-etudiants)")
    print("  - form_questions (questions de formulaire)")
    print("  - student_responses (reponses des eleves)")
    print("  - student_preferences (preferences des eleves)")
    print("  - assignments (affectations finales)")
    print("  - destinations (universites partenaires pour echanges)")
    print("  - destination_preferences (choix des etudiants pour echanges)")

if __name__ == "__main__":
    init_db()
