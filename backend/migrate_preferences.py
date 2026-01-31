"""
Script de migration pour changer la colonne 'rank' en 'grade' dans destination_preferences
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from app.config import settings

def migrate_database():
    """Migration pour le système de notation A-F"""
    
    # Get the backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Database is in the backend directory
    db_path = os.path.join(backend_dir, "student_assignment.db")
    database_url = f"sqlite:///{db_path}"
    
    print(f"Connecting to database: {database_url}")
    print(f"Database file path: {db_path}")
    print(f"Database exists: {os.path.exists(db_path)}")
    
    engine = create_engine(database_url)
    
    with engine.connect() as conn:
        # Vérifier si la table existe
        inspector = inspect(engine)
        if 'destination_preferences' not in inspector.get_table_names():
            print("Table destination_preferences n'existe pas encore")
            return
        
        # Vérifier les colonnes existantes
        columns = {col['name'] for col in inspector.get_columns('destination_preferences')}
        
        # Si la colonne 'grade' existe déjà, ne rien faire
        if 'grade' in columns:
            print("Migration déjà appliquée: colonne 'grade' existe déjà")
            return
        
        # Si la colonne 'rank' existe, la renommer en 'grade' et changer le type
        if 'rank' in columns:
            print("Migration: conversion de 'rank' vers 'grade'...")
            
            # SQLite ne supporte pas ALTER COLUMN, donc on doit recréer la table
            # 1. Créer une table temporaire
            conn.execute(text("""
                CREATE TABLE destination_preferences_new (
                    id INTEGER PRIMARY KEY,
                    student_id INTEGER NOT NULL,
                    destination_id INTEGER NOT NULL,
                    project_id INTEGER NOT NULL,
                    grade VARCHAR(1) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                    CHECK (grade IN ('A', 'B', 'C', 'D', 'E', 'F'))
                )
            """))
            
            # 2. Copier les données avec conversion
            # rank 1 -> A, rank 2 -> B, rank 3 -> C, rank 4 -> D, rank 5 -> E, rank 6 -> F
            conn.execute(text("""
                INSERT INTO destination_preferences_new 
                SELECT 
                    id,
                    student_id,
                    destination_id,
                    project_id,
                    CASE rank
                        WHEN 1 THEN 'A'
                        WHEN 2 THEN 'B'
                        WHEN 3 THEN 'C'
                        WHEN 4 THEN 'D'
                        WHEN 5 THEN 'E'
                        ELSE 'F'
                    END as grade,
                    created_at,
                    updated_at
                FROM destination_preferences
            """))
            
            # 3. Supprimer l'ancienne table
            conn.execute(text("DROP TABLE destination_preferences"))
            
            # 4. Renommer la nouvelle table
            conn.execute(text("ALTER TABLE destination_preferences_new RENAME TO destination_preferences"))
            
            # 5. Recréer les index
            conn.execute(text("CREATE INDEX idx_destination_prefs_student ON destination_preferences(student_id)"))
            conn.execute(text("CREATE INDEX idx_destination_prefs_project ON destination_preferences(project_id)"))
            conn.execute(text("CREATE INDEX idx_destination_prefs_destination ON destination_preferences(destination_id)"))
            
            conn.commit()
            print("Migration terminée avec succès!")
        else:
            print("Ni 'rank' ni 'grade' trouvé - table vide ou structure inconnue")

if __name__ == "__main__":
    migrate_database()
