"""
JWT Authentication Configuration
"""
from datetime import timedelta

# Secret key for JWT token signing
# In production: use environment variable
SECRET_KEY = "your-secret-key-change-this-in-production-use-env-variable"

# JWT algorithm
ALGORITHM = "HS256"

# Token expiration time
ACCESS_TOKEN_EXPIRE_MINUTES = 30
ACCESS_TOKEN_EXPIRE_DELTA = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
