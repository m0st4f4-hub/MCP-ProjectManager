"""
Simple application configuration for single-user mode.
"""

import os
from pathlib import Path

# Simple configuration class
class Settings:
    """Simple settings for single-user local app."""
    
    def __init__(self):
        # Application settings
        self.app_name = "Task Manager API"
        self.debug = os.getenv("DEBUG", "true").lower() == "true"
        self.version = "2.0.1"
        
        # Database settings
        backend_dir = Path(__file__).resolve().parent.parent
        self.database_url = os.getenv(
            "DATABASE_URL", 
            f"sqlite+aiosqlite:///{backend_dir / 'sql_app.db'}"
        )
        
        # Security (simplified)
        self.secret_key = os.getenv(
            "SECRET_KEY", 
            "this_is_a_very_long_secret_key_for_development_use_only_32_chars_minimum"
        )
        
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return not self.debug


def get_settings() -> Settings:
    """Get application settings."""
    return Settings()


# Create global settings instance
settings = get_settings()


def configure_logging() -> None:
    """Configure application logging."""
    import logging
    level = logging.INFO if settings.debug else logging.WARNING
    logging.basicConfig(
        level=level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )