"""
Configuration package initialization - Simplified.
"""

from .app_config import Settings, configure_logging

settings = Settings()

# Export for backward compatibility
SECRET_KEY = settings.secret_key

__all__ = [
    'settings',
    'configure_logging',
    'SECRET_KEY',
]