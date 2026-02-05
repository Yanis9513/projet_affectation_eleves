import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_secret_key() -> str:
    """Get SECRET_KEY from environment or raise error in production."""
    secret = os.getenv("SECRET_KEY")
    env = os.getenv("ENVIRONMENT", "development")
    
    if not secret:
        if env == "production":
            raise ValueError(
                "SECRET_KEY is required in production. "
                "Set the SECRET_KEY environment variable."
            )
        # Only use fallback in development
        return "dev-only-secret-key-change-in-production"
    return secret

class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./student_assignment.db")
    
    # Security - SECRET_KEY obligatoire en production
    SECRET_KEY: str = get_secret_key()
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # CORS - Restrictif selon l'environnement
    @property
    def cors_origins(self) -> list:
        """Return CORS origins based on environment."""
        if self.ENVIRONMENT == "production":
            # En production, utiliser uniquement les domaines autorises
            origins_str = os.getenv("CORS_ORIGINS", "")
            if origins_str:
                return [o.strip() for o in origins_str.split(",")]
            return []
        # En developpement, autoriser les serveurs locaux
        return ["http://localhost:3000", "http://localhost:5173"]
    
    # Database engine settings
    DATABASE_ECHO: bool = os.getenv("DATABASE_ECHO", "False").lower() == "true"
    
    # Email Settings
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "localhost")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "1025"))
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "false").lower() == "true"
    SENDER_EMAIL: str = os.getenv("SENDER_EMAIL", "noreply@esiee.fr")
    SENDER_PASSWORD: str = os.getenv("SENDER_PASSWORD", "")
    
    # Frontend
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Champ pour compatibilite avec ancien .env (sera ignore)
    BACKEND_CORS_ORIGINS: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignorer les champs non definis


settings = Settings()