from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.api.routes import auth, students, projects, assignments, teachers, forms, preferences, destinations, exchange
from app.database import engine, Base
from app.config import settings
from app.middleware import RequestLoggingMiddleware, setup_logging
import os

# Configuration du logging
setup_logging(os.getenv('LOG_LEVEL', 'INFO'))

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Student Assignment API",
    description="API pour la gestion des affectations d'etudiants et programmes d'echange",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middleware de logging (seulement en dev)
if os.getenv('ENVIRONMENT', 'development') == 'development':
    app.add_middleware(RequestLoggingMiddleware)

# CORS middleware configuration - utilise les origines de la config
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
    expose_headers=["X-Process-Time"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(teachers.router, prefix="/api/teachers", tags=["Teachers"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(forms.router, prefix="/api/forms", tags=["Forms"])
app.include_router(preferences.router, prefix="/api/preferences", tags=["Preferences"])
app.include_router(assignments.router, prefix="/api/assignments", tags=["Assignments"])
app.include_router(destinations.router, prefix="/api", tags=["Destinations"])
app.include_router(exchange.router, prefix="/api", tags=["Exchange Program"])

@app.get("/", tags=["Health"])
async def root():
    """Point d'entree de l'API."""
    return {
        "message": "Bienvenue sur l'API d'affectation des etudiants",
        "docs": "/docs",
        "redoc": "/redoc",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Verification de l'etat de sante de l'API."""
    return {
        "status": "healthy",
        "database": "connected",
        "version": "1.0.0"
    }

@app.get("/api/info", tags=["Health"])
async def api_info():
    """Informations sur l'API."""
    return {
        "name": "Student Assignment API",
        "version": "1.0.0",
        "environment": os.getenv('ENVIRONMENT', 'development'),
        "endpoints": {
            "auth": "/api/auth",
            "students": "/api/students",
            "teachers": "/api/teachers",
            "projects": "/api/projects",
            "forms": "/api/forms",
            "preferences": "/api/preferences",
            "assignments": "/api/assignments",
            "destinations": "/api/projects/{id}/destinations",
            "exchange": "/api/projects/{id}/exchange",
        }
    }
