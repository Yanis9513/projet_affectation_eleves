"""
Script pour peupler la base de données avec des données de test
"""

from app.database import SessionLocal
from app.models import (
    User, UserRole, Student, Teacher, Project, 
    EnglishLevel, Filiere, FormQuestion, QuestionType,
    StudentPreference
)
from passlib.context import CryptContext
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def seed_database():
    """Peupler la base de données avec des données de test"""
    db = SessionLocal()
    
    try:
        print("🌱 Peuplement de la base de données...")
        
        # 1. Créer un Admin
        print("\n📝 Création de l'administrateur...")
        admin_user = User(
            email="admin@esiee.fr",
            username="admin",
            hashed_password=hash_password("admin123"),
            first_name="Admin",
            last_name="ESIEE",
            role=UserRole.ADMIN
        )
        db.add(admin_user)
        db.commit()
        print("   ✓ Admin créé: admin@esiee.fr / admin123")
        
        # 2. Créer des Professeurs
        print("\n👨‍🏫 Création des professeurs...")
        teachers_data = [
            {
                "email": "prof.dupont@esiee.fr",
                "username": "dupont",
                "first_name": "Jean",
                "last_name": "Dupont",
                "department": "Informatique",
                "office": "Bureau 301"
            },
            {
                "email": "prof.martin@esiee.fr",
                "username": "martin",
                "first_name": "Marie",
                "last_name": "Martin",
                "department": "Électronique",
                "office": "Bureau 205"
            },
            {
                "email": "prof.bernard@esiee.fr",
                "username": "bernard",
                "first_name": "Pierre",
                "last_name": "Bernard",
                "department": "Systèmes Embarqués",
                "office": "Bureau 102"
            }
        ]
        
        teachers = []
        for t_data in teachers_data:
            user = User(
                email=t_data["email"],
                username=t_data["username"],
                hashed_password=hash_password("prof123"),
                first_name=t_data["first_name"],
                last_name=t_data["last_name"],
                role=UserRole.TEACHER
            )
            db.add(user)
            db.flush()
            
            teacher = Teacher(
                user_id=user.id,
                department=t_data["department"],
                office=t_data["office"]
            )
            db.add(teacher)
            teachers.append(teacher)
            print(f"   ✓ Professeur créé: {t_data['email']} / prof123")
        
        db.commit()
        
        # 3. Créer des Élèves
        print("\n👨‍🎓 Création des élèves...")
        students_data = [
            {"num": "E2025001", "fname": "Alice", "lname": "Dubois", "filiere": Filiere.INFORMATIQUE, "eng": EnglishLevel.B2, "rank": 1, "gpa": 16.5},
            {"num": "E2025002", "fname": "Bob", "lname": "Leroy", "filiere": Filiere.INFORMATIQUE, "eng": EnglishLevel.B1, "rank": 5, "gpa": 14.8},
            {"num": "E2025003", "fname": "Charlie", "lname": "Moreau", "filiere": Filiere.ELECTRONIQUE, "eng": EnglishLevel.C1, "rank": 2, "gpa": 15.9},
            {"num": "E2025004", "fname": "Diana", "lname": "Petit", "filiere": Filiere.INFORMATIQUE, "eng": EnglishLevel.B2, "rank": 3, "gpa": 15.2},
            {"num": "E2025005", "fname": "Ethan", "lname": "Roux", "filiere": Filiere.SYSTEMES_EMBARQUES, "eng": EnglishLevel.B1, "rank": 8, "gpa": 13.5},
            {"num": "E2025006", "fname": "Fiona", "lname": "Simon", "filiere": Filiere.INFORMATIQUE, "eng": EnglishLevel.C1, "rank": 2, "gpa": 16.1},
            {"num": "E2025007", "fname": "George", "lname": "Laurent", "filiere": Filiere.RESEAUX, "eng": EnglishLevel.B2, "rank": 4, "gpa": 14.5},
            {"num": "E2025008", "fname": "Hannah", "lname": "Blanc", "filiere": Filiere.INFORMATIQUE, "eng": EnglishLevel.B1, "rank": 10, "gpa": 12.8},
            {"num": "E2025009", "fname": "Ivan", "lname": "Garnier", "filiere": Filiere.ELECTRONIQUE, "eng": EnglishLevel.B2, "rank": 6, "gpa": 14.2},
            {"num": "E2025010", "fname": "Julia", "lname": "Faure", "filiere": Filiere.INFORMATIQUE, "eng": EnglishLevel.C2, "rank": 1, "gpa": 17.2},
        ]
        
        students = []
        for s_data in students_data:
            user = User(
                email=f"{s_data['fname'].lower()}.{s_data['lname'].lower()}@edu.esiee.fr",
                username=s_data['num'].lower(),
                hashed_password=hash_password("student123"),
                first_name=s_data['fname'],
                last_name=s_data['lname'],
                role=UserRole.STUDENT
            )
            db.add(user)
            db.flush()
            
            student = Student(
                user_id=user.id,
                student_number=s_data['num'],
                filiere=s_data['filiere'],
                english_level=s_data['eng'],
                general_rank=s_data['rank'],
                gpa=s_data['gpa'],
                promotion="2025"
            )
            db.add(student)
            students.append(student)
            print(f"   ✓ Élève créé: {user.email} / student123")
        
        db.commit()
        
        # 4. Créer des Projets
        print("\n📊 Création des projets...")
        projects_data = [
            {
                "title": "Application Mobile IA",
                "description": "Développer une application mobile utilisant l'intelligence artificielle pour la reconnaissance d'images",
                "teacher": teachers[0],
                "min": 3,
                "max": 5,
                "eng_level": EnglishLevel.B2,
                "filiere": Filiere.INFORMATIQUE,
                "has_form": True
            },
            {
                "title": "Système Domotique IoT",
                "description": "Concevoir un système domotique connecté avec capteurs et actionneurs",
                "teacher": teachers[1],
                "min": 2,
                "max": 4,
                "eng_level": EnglishLevel.B1,
                "filiere": Filiere.ELECTRONIQUE,
                "has_form": True
            },
            {
                "title": "Plateforme E-commerce",
                "description": "Créer une plateforme e-commerce complète avec paiement en ligne",
                "teacher": teachers[0],
                "min": 4,
                "max": 6,
                "eng_level": EnglishLevel.B1,
                "filiere": Filiere.INFORMATIQUE,
                "has_form": False
            },
            {
                "title": "Robot Autonome",
                "description": "Développer un robot autonome capable de naviguer dans un environnement complexe",
                "teacher": teachers[2],
                "min": 3,
                "max": 4,
                "eng_level": EnglishLevel.B2,
                "filiere": Filiere.SYSTEMES_EMBARQUES,
                "has_form": True
            },
            {
                "title": "Blockchain & Cryptomonnaie",
                "description": "Implémenter une blockchain et créer une cryptomonnaie",
                "teacher": teachers[0],
                "min": 2,
                "max": 3,
                "eng_level": EnglishLevel.C1,
                "filiere": Filiere.INFORMATIQUE,
                "has_form": False
            }
        ]
        
        projects = []
        for p_data in projects_data:
            project = Project(
                teacher_id=p_data["teacher"].id,
                title=p_data["title"],
                description=p_data["description"],
                min_students=p_data["min"],
                max_students=p_data["max"],
                required_english_level=p_data["eng_level"],
                target_filiere=p_data["filiere"],
                has_custom_form=p_data["has_form"],
                deadline=datetime.utcnow() + timedelta(days=30)
            )
            db.add(project)
            projects.append(project)
            print(f"   ✓ Projet créé: {p_data['title']}")
        
        db.commit()
        
        # 5. Créer des questions de formulaire pour certains projets
        print("\n📋 Création des formulaires...")
        
        # Formulaire pour "Application Mobile IA"
        form1_questions = [
            {
                "text": "Avez-vous déjà développé une application mobile?",
                "type": QuestionType.YES_NO,
                "required": True,
                "order": 1
            },
            {
                "text": "Quel est votre niveau en Python?",
                "type": QuestionType.SCALE,
                "required": True,
                "order": 2,
                "scale_min": 1,
                "scale_max": 10
            },
            {
                "text": "Décrivez votre expérience en machine learning:",
                "type": QuestionType.TEXTAREA,
                "required": False,
                "order": 3
            }
        ]
        
        for q_data in form1_questions:
            question = FormQuestion(
                project_id=projects[0].id,
                question_text=q_data["text"],
                question_type=q_data["type"],
                is_required=q_data["required"],
                order=q_data["order"],
                scale_min=q_data.get("scale_min"),
                scale_max=q_data.get("scale_max")
            )
            db.add(question)
        
        # Formulaire pour "Système Domotique IoT"
        form2_questions = [
            {
                "text": "Quelle plateforme IoT préférez-vous?",
                "type": QuestionType.MULTIPLE_CHOICE,
                "required": True,
                "order": 1,
                "options": '["Arduino", "Raspberry Pi", "ESP32", "Autre"]'
            },
            {
                "text": "Avez-vous des compétences en électronique?",
                "type": QuestionType.YES_NO,
                "required": True,
                "order": 2
            }
        ]
        
        for q_data in form2_questions:
            question = FormQuestion(
                project_id=projects[1].id,
                question_text=q_data["text"],
                question_type=q_data["type"],
                is_required=q_data["required"],
                order=q_data["order"],
                options=q_data.get("options")
            )
            db.add(question)
        
        print("   ✓ Formulaires créés")
        db.commit()
        
        # 6. Créer des préférences pour quelques élèves
        print("\n⭐ Création des préférences des élèves...")
        
        # Alice préfère: AI Mobile > E-commerce > Blockchain
        preferences_alice = [
            StudentPreference(student_id=students[0].id, project_id=projects[0].id, rank=1),
            StudentPreference(student_id=students[0].id, project_id=projects[2].id, rank=2),
            StudentPreference(student_id=students[0].id, project_id=projects[4].id, rank=3),
        ]
        
        # Bob préfère: E-commerce > AI Mobile > Domotique
        preferences_bob = [
            StudentPreference(student_id=students[1].id, project_id=projects[2].id, rank=1),
            StudentPreference(student_id=students[1].id, project_id=projects[0].id, rank=2),
            StudentPreference(student_id=students[1].id, project_id=projects[1].id, rank=3),
        ]
        
        # Charlie préfère: Domotique > Robot
        preferences_charlie = [
            StudentPreference(student_id=students[2].id, project_id=projects[1].id, rank=1),
            StudentPreference(student_id=students[2].id, project_id=projects[3].id, rank=2),
        ]
        
        for pref in preferences_alice + preferences_bob + preferences_charlie:
            db.add(pref)
        
        print("   ✓ Préférences créées")
        db.commit()
        
        print("\n" + "="*60)
        print("✅ Base de données peuplée avec succès!")
        print("="*60)
        print("\n📊 Résumé:")
        print(f"   - 1 Administrateur")
        print(f"   - {len(teachers)} Professeurs")
        print(f"   - {len(students)} Élèves")
        print(f"   - {len(projects)} Projets")
        print(f"   - Formulaires personnalisés pour 2 projets")
        print(f"   - Préférences pour 3 élèves")
        
        print("\n🔑 Comptes de test:")
        print("   Admin: admin@esiee.fr / admin123")
        print("   Prof: prof.dupont@esiee.fr / prof123")
        print("   Élève: alice.dubois@edu.esiee.fr / student123")
        
    except Exception as e:
        print(f"\n❌ Erreur lors du peuplement: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
