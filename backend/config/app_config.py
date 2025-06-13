"""
Application configuration following FastAPI Settings and Environment Variables tutorial.
Uses Pydantic Settings for type-safe configuration management.
"""

import logging
import os
from pathlib import Path
from typing import List, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    This class follows FastAPI's recommended pattern for configuration
    using Pydantic Settings with automatic environment variable loading.
    """
    
    # Application settings
    app_name: str = Field(default="Task Manager API", description="Application name")
    debug: bool = Field(default=False, description="Debug mode")
    version: str = Field(default="2.0.1", description="Application version")
    
    # Database settings
    database_url: str = Field(
        default="sqlite+aiosqlite:///./sql_app.db",
        description="Database URL for main database"
    )
    test_database_url: str = Field(
        default="sqlite+aiosqlite:///./test.db",
        description="Database URL for testing"
    )
    
    # Database connection pool settings
    db_pool_size: int = Field(default=5, description="Database connection pool size")
    db_max_overflow: int = Field(default=10, description="Max database connection overflow")
    db_pool_timeout: int = Field(default=30, description="Database pool timeout in seconds")
    db_pool_recycle: int = Field(default=1800, description="Database pool recycle time in seconds")
    db_pool_pre_ping: bool = Field(default=True, description="Enable database pool pre-ping")
    
    # Security settings
    secret_key: str = Field(
        ...,
        description="Secret key for JWT token signing",
        min_length=32
    )
    algorithm: str = Field(default="HS256", description="JWT algorithm")
    access_token_expire_minutes: int = Field(
        default=30,
        description="Access token expiration time in minutes"
    )
    refresh_token_expire_minutes: int = Field(
        default=60 * 24 * 7,  # 7 days
        description="Refresh token expiration time in minutes"
    )
    
    # Rate limiting settings
    rate_limit_per_minute: int = Field(
        default=60,
        description="General rate limit per minute"
    )
    user_rate_limit_per_minute: int = Field(
        default=100,
        description="Rate limit for authenticated users per minute"
    )
    
    # CORS settings
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8080"],
        description="Allowed CORS origins"
    )
    cors_allow_credentials: bool = Field(
        default=True,
        description="Allow credentials in CORS requests"
    )
    
    # OAuth settings (optional)
    oauth_client_id: str = Field(default="", description="OAuth client ID")
    oauth_client_secret: str = Field(default="", description="OAuth client secret")
    oauth_server_metadata_url: str = Field(default="", description="OAuth server metadata URL")
    oauth_redirect_uri: str = Field(
        default="http://localhost:8000/auth/oauth/callback",
        description="OAuth redirect URI"
    )
    oauth_scope: str = Field(
        default="openid email profile",
        description="OAuth scope"
    )
    
    # Redis settings (for caching and session management)
    redis_host: str = Field(default="localhost", description="Redis host")
    redis_port: int = Field(default=6379, description="Redis port")
    redis_password: Optional[str] = Field(default=None, description="Redis password")
    redis_db: int = Field(default=0, description="Redis database number")
    
    # Email settings (for notifications)
    smtp_server: Optional[str] = Field(default=None, description="SMTP server")
    smtp_port: int = Field(default=587, description="SMTP port")
    smtp_username: Optional[str] = Field(default=None, description="SMTP username")
    smtp_password: Optional[str] = Field(default=None, description="SMTP password")
    smtp_tls: bool = Field(default=True, description="Use TLS for SMTP")
    
    # File upload settings
    max_file_size: int = Field(
        default=10 * 1024 * 1024,  # 10MB
        description="Maximum file upload size in bytes"
    )
    upload_directory: str = Field(
        default="uploads",
        description="Directory for file uploads"
    )
    
    # Logging settings
    log_level: str = Field(default="INFO", description="Logging level")
    log_file: Optional[str] = Field(default=None, description="Log file path")
    
    # Feature flags
    enable_metrics: bool = Field(default=True, description="Enable Prometheus metrics")
    enable_mcp: bool = Field(default=True, description="Enable MCP integration")
    enable_websockets: bool = Field(default=True, description="Enable WebSocket support")
    
    # Pydantic model configuration
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v) -> List[str]:
        """Parse CORS origins from string or list."""
        if isinstance(v, str):
            if not v:
                return ["*"]
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v
    
    @field_validator("secret_key")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        """Validate secret key meets minimum security requirements."""
        if len(v.strip()) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v.strip()
    
    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Validate log level is a valid logging level."""
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        v_upper = v.upper()
        if v_upper not in valid_levels:
            raise ValueError(f"LOG_LEVEL must be one of: {', '.join(valid_levels)}")
        return v_upper
    
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return not self.debug
    
    def get_database_url(self, for_testing: bool = False) -> str:
        """Get appropriate database URL."""
        return self.test_database_url if for_testing else self.database_url


def get_settings() -> Settings:
    """
    Get application settings.
    
    This function can be used to inject settings as a dependency:
    
    @app.get("/info")
    async def get_info(settings: Settings = Depends(get_settings)):
        return {"app_name": settings.app_name}
    """
    return Settings()


# Create global settings instance
settings = get_settings()


def configure_logging() -> None:
    """
    Configure application logging based on settings.
    """
    log_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            },
            "detailed": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(module)s:%(lineno)d - %(message)s",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default" if settings.is_production() else "detailed",
                "level": settings.log_level,
            },
        },
        "root": {
            "level": settings.log_level,
            "handlers": ["console"],
        },
    }
    
    # Add file handler if log file is specified
    if settings.log_file:
        log_config["handlers"]["file"] = {
            "class": "logging.FileHandler",
            "filename": settings.log_file,
            "formatter": "detailed",
            "level": settings.log_level,
        }
        log_config["root"]["handlers"].append("file")
    
    logging.config.dictConfig(log_config)


def validate_settings() -> None:
    """
    Validate critical settings on startup.
    
    Raises:
        ValueError: If critical settings are missing or invalid
    """
    errors = []
    
    # Check required settings
    if not settings.secret_key:
        errors.append("SECRET_KEY is required")
    
    if settings.is_production():
        # Production-specific validations
        if settings.cors_origins == ["*"]:
            errors.append("CORS_ORIGINS should not be '*' in production")
        
        if settings.debug:
            errors.append("DEBUG should be False in production")
    
    if errors:
        raise ValueError("Configuration errors: " + "; ".join(errors))


# Validate settings on import
try:
    validate_settings()
except ValueError as e:
    logging.warning(f"Configuration validation warning: {e}")


# Export commonly used values for backward compatibility
SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes
REFRESH_TOKEN_EXPIRE_MINUTES = settings.refresh_token_expire_minutes
CORS_ORIGINS = settings.cors_origins

# Additional exports
OAUTH_CLIENT_ID = settings.oauth_client_id
OAUTH_CLIENT_SECRET = settings.oauth_client_secret
OAUTH_SERVER_METADATA_URL = settings.oauth_server_metadata_url
OAUTH_REDIRECT_URI = settings.oauth_redirect_uri
OAUTH_SCOPE = settings.oauth_scope