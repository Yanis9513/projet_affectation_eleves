"""
JWT Authentication Configuration
Delegates to app.config.settings for a single source of truth.
"""
from datetime import timedelta
from app.config import settings

# Secret key for JWT token signing — single source from settings
SECRET_KEY = settings.SECRET_KEY

# JWT algorithm
ALGORITHM = settings.ALGORITHM

# Token expiration time
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
ACCESS_TOKEN_EXPIRE_DELTA = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
