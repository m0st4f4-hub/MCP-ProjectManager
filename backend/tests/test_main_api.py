# Task ID: 211
# Agent Role: BuilderAgent
# Request ID: (Inherited from Overmind)
# Project: project-manager
# Timestamp: 2025-05-09T20:45:00Z

import pytest
from sqlalchemy.orm import Session
import uuid
from unittest import mock
import time
from fastapi import HTTPException
from fastapi import FastAPI, Depends # Import Depends
import httpx # Added import
from httpx import AsyncClient
from io import StringIO
import logging
import sys
import json # Import json for serializing details
import pytest_asyncio
from unittest.mock import patch, MagicMock, AsyncMock

# Import AsyncSession
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession

# Import models and schemas directly
from backend import models

# Import specific schemas as needed
from .schemas.task import TaskCreate, TaskUpdate
from .schemas.user import User # Import User schema
from .schemas import user as schemas # Add import for schemas alias

# Import specific crud submodules with aliases
from backend.crud import projects as crud_projects
from backend.crud import tasks as crud_tasks
from backend.crud import agents as crud_agents
from backend.crud import project_members as crud_project_members
from backend.crud import project_file_associations as crud_project_file_associations
from backend.crud import task_file_associations as crud_task_file_associations
from backend.crud import task_dependencies as crud_task_dependencies
from backend.crud.users import get_user_by_username # Import user crud

# Import lifespan from main
from backend.main import lifespan

# Import necessary services for helper functions
from .services import project_service
from .services import agent_service
from .services.agent_service import AgentService # Import AgentService
from .services.audit_log_service import AuditLogService # Import AuditLogService

# Import auth dependency
from .auth import get_current_active_user # Import the dependency itself

# Import get_project_service and get_audit_log_service
from backend.routers.projects import get_project_service, get_audit_log_service

# Set up logging - get the logger used in backend.main
logger = logging.getLogger("backend.main")

# Import MagicMock
from unittest.mock import MagicMock

# Mark all tests in this module as async using pytest-asyncio conventions
pytestmark = pytest.mark.asyncio

async def test_get_root(async_client: AsyncClient):
 response = await async_client.get("/")
 assert response.status_code == 200
 assert response.json() == {"message": "Welcome to the Task Manager API"}

# --- Project API Tests ---
# Adding test_user as a dependency to authenticated tests
async def test_create_project_api(async_client: AsyncClient, test_user: schemas.UserWithRole):
 project_data = {"name": "API Test Project", "description": "Desc"}

 print(" [D:\\mcp\\task-manager\\backend\\tests\\test_main_api.py > test_create_project_api] Sending first POST request with data:", project_data)
 # Use the async_client provided by the fixture
 response = await async_client.post("/api/v1/projects/", json=project_data)

 assert response.status_code == 200
 data = response.json()
 print(" [D:\\mcp\\task-manager\\backend\\tests\\test_main_api.py > test_create_project_api] First POST response status code:", response.status_code)
 print(" [D:\\mcp\\task-manager\\backend\\tests\\test_main_api.py > test_create_project_api] First POST response body:", response.json())
 assert data["data"]["name"] == "API Test Project"

 # Verify that the project was created in the database via the service (indirectly tested)
 # We can add a check here by fetching the project using a direct db session if needed
 # For now, rely on the integration test flow covering this.

 # Assertions for audit log creation are also implicitly tested if the service is called correctly
 # and the log is created without errors.

 print(" [D:\\mcp\\task-manager\\backend\\tests\\test_main_api.py > test_create_project_api] Sending second POST request (duplicate) with data:", {"name": "API Test Project", "description": "Desc"})
 # Test duplicate project name - this should still hit the actual router logic
 response_dup = await async_client.post("/api/v1/projects/", json={"name": "API Test Project", "description": "Desc"})
 print(" [D:\\mcp\\task-manager\\backend\\tests\\test_main_api.py > test_create_project_api] Second POST response status code:", response_dup.status_code)
 print(" [D:\\mcp\\task-manager\\backend\\tests\\test_main_api.py > test_create_project_api] Second POST response body:", response_dup.json())
 assert response_dup.status_code == 409
 assert "Project with identifier API Test Project already exists" in response_dup.json()["detail"]

# Add a new test function to call the temporary auth endpoint
# Adding test_user as a dependency
async def test_authentication_dependency(async_client: AsyncClient, test_user: models.User):
 """Test that the get_current_active_user dependency works correctly via the test client."""
 # Use the async_client provided by the fixture
 response = await async_client.get("/test-auth")

 assert response.status_code == 200
 user_data = response.json()
 assert user_data["username"] == test_user.username
 assert user_data["email"] == test_user.email
 assert user_data["full_name"] == test_user.full_name

# --- Task API Tests --- #
# --- Agent API Tests --- #
# --- Audit Log API Tests --- #
# --- Memory API Tests --- #
# --- Rules API Tests --- #
# --- User API Tests --- #
# --- Other API Tests --- #
