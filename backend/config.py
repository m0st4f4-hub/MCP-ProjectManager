"""Configuration settings for the backend application."""

import os

# --- Authentication Settings ---
# WARNING: In a production environment, manage secrets securely (e.g., environment variables, secrets manager).
# For development, you can use placeholder values, but ensure they are not committed with real secrets.

# Secret key for signing JWTs. KEEP THIS SECRET!
SECRET_KEY = os.getenv("SECRET_KEY", "a-very-secret-key-for-development-replace-me")

# Algorithm for JWT signing
ALGORITHM = "HS256"

# Access token expiration time in minutes
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- Database Settings (Example - if you move DB URL here later) ---
# DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# --- Other Application Settings ---
# Example: API Prefix
# API_V1_STR = "/api/v1" 