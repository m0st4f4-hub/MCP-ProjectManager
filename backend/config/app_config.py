"""
Application configuration module.
Handles router configuration and logging setup.
"""

import logging
from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from typing import Optional  # Import load_dotenv
from dotenv import load_dotenv  # Import routers  # REMOVED router imports to break circular dependency  # from backend.routers.projects import router as projects_router  # from backend.routers.agents import router as agents_router  # from backend.routers.audit_logs import router as audit_logs_router  # from backend.routers.tasks import router as tasks_router  # from backend.routers.rules import router as rules_router  # from backend.routers.memory import router as memory_router  # from backend.routers.mcp import router as mcp_tools_router  # Load environment variables from a .env file
backend_dir = os.path.dirname(os.path.dirname(__file__))
env_path = os.path.join(backend_dir, '.env')
load_dotenv(env_path)  # Pydantic BaseSettings for application configuration


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables or a .env file.

    This class uses Pydantic's BaseSettings to manage application configuration.
    Settings are loaded from environment variables, with values from a .env file
    taking precedence over defaults defined here.
    """
    DATABASE_URL: str = "sqlite+aiosqlite:///./sql_app.db"  # Default database URL, can be overridden by DATABASE_URL env var in .env
    TEST_DATABASE_URL: Optional[str] = None  # Optional test database URL
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080  # 60 * 24 * 7 (one week)
    DEBUG: bool = False  # Add debug setting
    
    # Rate limiting settings
    RATE_LIMIT_PER_MINUTE: int = 60
    USER_RATE_LIMIT_PER_MINUTE: int = 100

    # OAuth configuration
    OAUTH_CLIENT_ID: str = ""
    OAUTH_CLIENT_SECRET: str = ""
    OAUTH_SERVER_METADATA_URL: str = ""
    OAUTH_REDIRECT_URI: str = "http://localhost:8000/auth/oauth/callback"
    OAUTH_SCOPE: str = "openid email profile"
    
    # Add other configuration variables here as needed  # Add SettingsConfigDict - Allow extra fields to be more flexible
    model_config = SettingsConfigDict(env_file=".env", extra='ignore')

def __init__(self, **kwargs):
        super().__init__(**kwargs)  # Strip whitespace from string values
        if hasattr(self, 'SECRET_KEY'):
            self.SECRET_KEY = self.SECRET_KEY.strip()
        if hasattr(self, 'ALGORITHM'):
            self.ALGORITHM = self.ALGORITHM.strip()
        for attr in [
            'OAUTH_CLIENT_ID',
            'OAUTH_CLIENT_SECRET',
            'OAUTH_SERVER_METADATA_URL',
            'OAUTH_REDIRECT_URI',
            'OAUTH_SCOPE',
        ]:
            if hasattr(self, attr) and getattr(self, attr):
                setattr(self, attr, getattr(self, attr).strip())

settings = Settings()

def configure_logging():
    """
    Configure application logging.
    """
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('task_manager.log', mode='a')
        ]
    )  # REMOVED configure_routers function to break circular dependency  # def configure_routers(app: FastAPI):  # """  # Configure and include all routers in the FastAPI app.  # """  # # API v1 routers  # routers = [  # (projects_router, "projects"),  # (tasks_router, "tasks"),  # (agents_router, "agents"),  # (audit_logs_router, "audit"),  # (rules_router, "rules"),  # (memory_router, "memory"),  # (mcp_tools_router, "mcp-tools"),  # ]  # for router, tag in routers:  # app.include_router(  # router,  # prefix="/api/v1",  # tags=[tag.title()]  # )
