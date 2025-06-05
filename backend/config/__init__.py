"""
Configuration package initialization.
"""

from .app_config import Settings, configure_logging

settings = Settings()

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_MINUTES = settings.REFRESH_TOKEN_EXPIRE_MINUTES

__all__ = [
    'configure_logging',
    'SECRET_KEY',
    'ALGORITHM',
    'ACCESS_TOKEN_EXPIRE_MINUTES',
    'REFRESH_TOKEN_EXPIRE_MINUTES',
]
