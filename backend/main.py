from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.api.routes import auth, students, projects, assignments, teachers, forms, preferences, destinations, exchange
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Student Assignment API",
    description="API for managing student project assignments and exchange programs",
    version="1.0.0"
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

@app.get("/")
async def root():
    return {
        "message": "Welcome to Student Assignment API",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
