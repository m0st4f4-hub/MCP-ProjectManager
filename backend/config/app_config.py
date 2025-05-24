"""
Application configuration module.
Handles router configuration and logging setup.
"""

import logging
from fastapi import FastAPI
from pydantic_settings import BaseSettings
import os
from typing import Optional

# Import routers # REMOVED router imports to break circular dependency
# from backend.routers.projects import router as projects_router
# from backend.routers.agents import router as agents_router
# from backend.routers.audit_logs import router as audit_logs_router
# from backend.routers.tasks import router as tasks_router
# from backend.routers.rules import router as rules_router
# from backend.routers.memory import router as memory_router
# from backend.routers.mcp import router as mcp_tools_router

# Pydantic BaseSettings for application configuration
class Settings(BaseSettings):
    """
    Application settings loaded from environment variables or a .env file.
    
    This class uses Pydantic's BaseSettings to manage application configuration.
    Settings are loaded from environment variables, with values from a .env file
    taking precedence over defaults defined here.
    """
    DATABASE_URL: str = "sqlite:///D:/mcp/task-manager/sql_app.db" # Default database URL, can be overridden by DATABASE_URL env var in .env
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    # Add other configuration variables here as needed

    class Config:
        env_file = ".env"

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
    )

# REMOVED configure_routers function to break circular dependency
# def configure_routers(app: FastAPI):
#     """
#     Configure and include all routers in the FastAPI app.
#     """
    
#     # API v1 routers
#     routers = [
#         (projects_router, "projects"),
#         (tasks_router, "tasks"),
#         (agents_router, "agents"),
#         (audit_logs_router, "audit"),
#         (rules_router, "rules"),
#         (memory_router, "memory"),
#         (mcp_tools_router, "mcp-tools"),
#     ]
    
#     for router, tag in routers:
#         app.include_router(
#             router, 
#             prefix="/api/v1",
#             tags=[tag.title()]
#         )
