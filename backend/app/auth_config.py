"""
JWT Authentication Configuration
"""
import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Secret key for JWT token signing
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-for-development-only")

# JWT algorithm
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# Token expiration time
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
ACCESS_TOKEN_EXPIRE_DELTA = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
