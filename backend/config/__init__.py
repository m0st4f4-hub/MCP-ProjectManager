"""
Configuration package initialization.
"""

from .app_config import Settings

settings = Settings()

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
CORS_ORIGINS = settings.CORS_ORIGINS

__all__ = ['configure_logging', 'SECRET_KEY', 'ALGORITHM', 'ACCESS_TOKEN_EXPIRE_MINUTES', 'CORS_ORIGINS']
