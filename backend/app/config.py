import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./student_assignment.db")
    
    # Security (already handled in auth_config.py, but keeping for compatibility)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback-secret-key-for-development-only")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]
    
    # Database engine settings
    DATABASE_ECHO: bool = os.getenv("DATABASE_ECHO", "False").lower() == "true"
    
    # Email Settings
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "localhost")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "1025"))
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "false").lower() == "true"
    SENDER_EMAIL: str = os.getenv("SENDER_EMAIL", "noreply@esiee.fr")
    SENDER_PASSWORD: str = os.getenv("SENDER_PASSWORD", "")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()