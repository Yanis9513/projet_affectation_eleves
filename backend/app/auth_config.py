"""
JWT Authentication Configuration
Delegates to centralized settings in app.config to avoid duplicate SECRET_KEY.
"""
from datetime import timedelta
from app.config import settings

# Single source of truth for security settings
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
ACCESS_TOKEN_EXPIRE_DELTA = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
