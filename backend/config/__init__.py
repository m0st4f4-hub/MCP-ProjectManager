"""
Configuration package initialization.
"""

from .app_config import Settings, configure_logging

settings = Settings()

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes
REFRESH_TOKEN_EXPIRE_MINUTES = settings.refresh_token_expire_minutes
OAUTH_CLIENT_ID = settings.oauth_client_id
OAUTH_CLIENT_SECRET = settings.oauth_client_secret
OAUTH_SERVER_METADATA_URL = settings.oauth_server_metadata_url
OAUTH_REDIRECT_URI = settings.oauth_redirect_uri
OAUTH_SCOPE = settings.oauth_scope
CORS_ORIGINS = settings.cors_origins

__all__ = [
    'settings',
    'configure_logging',
    'SECRET_KEY',
    'ALGORITHM',
    'ACCESS_TOKEN_EXPIRE_MINUTES',
    'REFRESH_TOKEN_EXPIRE_MINUTES',
    'OAUTH_CLIENT_ID',
    'OAUTH_CLIENT_SECRET',
    'OAUTH_SERVER_METADATA_URL',
    'OAUTH_REDIRECT_URI',
    'OAUTH_SCOPE',
    'CORS_ORIGINS',
]
