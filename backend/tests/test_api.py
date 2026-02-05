"""
Tests unitaires pour l'API Student Assignment.
Utilise pytest et FastAPI TestClient.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.teacher import Teacher
from app.models.student import Student
from app.models.project import Project

# Base de donnees de test en memoire
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override de la dependance get_db pour les tests."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def db():
    """Fixture pour creer les tables avant chaque test."""
    Base.metadata.create_all(bind=engine)
    yield TestingSessionLocal()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client():
    """Fixture pour le client de test."""
    Base.metadata.create_all(bind=engine)
    yield TestClient(app)
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def teacher_token(client, db):
    """Fixture pour creer un enseignant et obtenir son token."""
    # Creer un enseignant via l'API
    response = client.post(
        "/api/auth/register/teacher",
        json={
            "email": "teacher@test.com",
            "password": "password123",
            "first_name": "Test",
            "last_name": "Teacher"
        }
    )
    assert response.status_code == 200
    
    # Se connecter
    response = client.post(
        "/api/auth/login",
        data={
            "username": "teacher@test.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture
def student_token(client, db):
    """Fixture pour creer un etudiant et obtenir son token."""
    # D'abord creer un enseignant et un projet
    teacher_response = client.post(
        "/api/auth/register/teacher",
        json={
            "email": "teacher2@test.com",
            "password": "password123",
            "first_name": "Test",
            "last_name": "Teacher"
        }
    )
    
    # Connecter l'enseignant
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "teacher2@test.com",
            "password": "password123"
        }
    )
    teacher_token = login_response.json()["access_token"]
    
    # Creer un projet
    project_response = client.post(
        "/api/projects/",
        json={
            "title": "Test Project",
            "description": "A test project",
            "max_students": 30,
            "group_size": 4
        },
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    # Creer l'etudiant
    response = client.post(
        "/api/auth/register/student",
        json={
            "email": "student@test.com",
            "password": "password123",
            "first_name": "Test",
            "last_name": "Student"
        }
    )
    assert response.status_code == 200
    
    # Se connecter
    response = client.post(
        "/api/auth/login",
        data={
            "username": "student@test.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    return response.json()["access_token"]


class TestHealth:
    """Tests pour les endpoints de sante."""
    
    def test_root(self, client):
        """Test de l'endpoint racine."""
        response = client.get("/")
        assert response.status_code == 200
        assert "message" in response.json()
    
    def test_health_check(self, client):
        """Test du health check."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


class TestAuthentication:
    """Tests pour l'authentification."""
    
    def test_register_teacher(self, client):
        """Test d'inscription d'un enseignant."""
        response = client.post(
            "/api/auth/register/teacher",
            json={
                "email": "newteacher@test.com",
                "password": "password123",
                "first_name": "New",
                "last_name": "Teacher"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "newteacher@test.com"
        assert data["role"] == "teacher"
    
    def test_register_duplicate_email(self, client):
        """Test d'inscription avec un email existant."""
        # Premier enregistrement
        client.post(
            "/api/auth/register/teacher",
            json={
                "email": "duplicate@test.com",
                "password": "password123",
                "first_name": "First",
                "last_name": "User"
            }
        )
        
        # Tentative de doublon
        response = client.post(
            "/api/auth/register/teacher",
            json={
                "email": "duplicate@test.com",
                "password": "password456",
                "first_name": "Second",
                "last_name": "User"
            }
        )
        assert response.status_code == 400
    
    def test_login_success(self, client):
        """Test de connexion reussie."""
        # Creer un utilisateur
        client.post(
            "/api/auth/register/teacher",
            json={
                "email": "login@test.com",
                "password": "password123",
                "first_name": "Login",
                "last_name": "Test"
            }
        )
        
        # Se connecter
        response = client.post(
            "/api/auth/login",
            data={
                "username": "login@test.com",
                "password": "password123"
            }
        )
        assert response.status_code == 200
        assert "access_token" in response.json()
    
    def test_login_wrong_password(self, client):
        """Test de connexion avec mauvais mot de passe."""
        # Creer un utilisateur
        client.post(
            "/api/auth/register/teacher",
            json={
                "email": "wrong@test.com",
                "password": "password123",
                "first_name": "Wrong",
                "last_name": "Password"
            }
        )
        
        # Tentative avec mauvais mot de passe
        response = client.post(
            "/api/auth/login",
            data={
                "username": "wrong@test.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401


class TestProjects:
    """Tests pour les projets."""
    
    def test_create_project(self, client, teacher_token):
        """Test de creation de projet."""
        response = client.post(
            "/api/projects/",
            json={
                "title": "My New Project",
                "description": "A great project",
                "max_students": 50,
                "group_size": 5,
                "project_type": "group_project"
            },
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "My New Project"
        assert data["max_students"] == 50
    
    def test_create_project_unauthorized(self, client):
        """Test de creation de projet sans authentification."""
        response = client.post(
            "/api/projects/",
            json={
                "title": "Unauthorized Project",
                "description": "Should fail",
                "max_students": 30,
                "group_size": 4
            }
        )
        assert response.status_code == 401
    
    def test_list_projects(self, client, teacher_token):
        """Test de liste des projets."""
        # Creer quelques projets
        for i in range(3):
            client.post(
                "/api/projects/",
                json={
                    "title": f"Project {i}",
                    "description": f"Description {i}",
                    "max_students": 30,
                    "group_size": 4
                },
                headers={"Authorization": f"Bearer {teacher_token}"}
            )
        
        # Lister les projets
        response = client.get(
            "/api/projects/",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200
        assert len(response.json()) >= 3
    
    def test_get_project_by_id(self, client, teacher_token):
        """Test de recuperation d'un projet par ID."""
        # Creer un projet
        create_response = client.post(
            "/api/projects/",
            json={
                "title": "Specific Project",
                "description": "Get by ID",
                "max_students": 30,
                "group_size": 4
            },
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        project_id = create_response.json()["id"]
        
        # Recuperer le projet
        response = client.get(
            f"/api/projects/{project_id}",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200
        assert response.json()["title"] == "Specific Project"
    
    def test_update_project(self, client, teacher_token):
        """Test de mise a jour d'un projet."""
        # Creer un projet
        create_response = client.post(
            "/api/projects/",
            json={
                "title": "Original Title",
                "description": "Original description",
                "max_students": 30,
                "group_size": 4
            },
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        project_id = create_response.json()["id"]
        
        # Mettre a jour
        response = client.put(
            f"/api/projects/{project_id}",
            json={
                "title": "Updated Title",
                "description": "Updated description"
            },
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200
        assert response.json()["title"] == "Updated Title"
    
    def test_delete_project(self, client, teacher_token):
        """Test de suppression d'un projet."""
        # Creer un projet
        create_response = client.post(
            "/api/projects/",
            json={
                "title": "To Delete",
                "description": "Will be deleted",
                "max_students": 30,
                "group_size": 4
            },
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        project_id = create_response.json()["id"]
        
        # Supprimer
        response = client.delete(
            f"/api/projects/{project_id}",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200
        
        # Verifier la suppression
        get_response = client.get(
            f"/api/projects/{project_id}",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert get_response.status_code == 404


class TestStudentAccess:
    """Tests pour les acces etudiants."""
    
    def test_student_cannot_create_project(self, client, student_token):
        """Test qu'un etudiant ne peut pas creer de projet."""
        response = client.post(
            "/api/projects/",
            json={
                "title": "Student Project",
                "description": "Should fail",
                "max_students": 30,
                "group_size": 4
            },
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 403


class TestValidation:
    """Tests de validation des donnees."""
    
    def test_project_missing_title(self, client, teacher_token):
        """Test de creation de projet sans titre."""
        response = client.post(
            "/api/projects/",
            json={
                "description": "No title",
                "max_students": 30,
                "group_size": 4
            },
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 422
    
    def test_project_invalid_max_students(self, client, teacher_token):
        """Test de creation de projet avec max_students invalide."""
        response = client.post(
            "/api/projects/",
            json={
                "title": "Invalid Students",
                "description": "Invalid max",
                "max_students": -5,
                "group_size": 4
            },
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 422


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
