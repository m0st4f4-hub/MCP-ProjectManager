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

# Import AsyncSession
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession

# Import models and schemas directly
from backend import models

# Import specific schemas as needed
from backend.schemas.task import TaskCreate, TaskUpdate
from backend.schemas.user import User # Import User schema

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
from backend.services import project_service
from backend.services import agent_service
from backend.services.agent_service import AgentService  # Import AgentService
from backend.services.audit_log_service import AuditLogService # Import AuditLogService

# Import auth dependency
from backend.auth import get_current_active_user

# Set up logging - get the logger used in backend.main
logger = logging.getLogger("backend.main")


# Mark all tests in this module as async using pytest-asyncio conventions
pytestmark = pytest.mark.asyncio

async def test_get_root(async_client: AsyncClient):
    response = await async_client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Task Manager API"}

# --- Project API Tests ---
# Adding test_user as a dependency to authenticated tests
async def test_create_project_api(async_client: AsyncClient, test_user: models.User):
    response = await async_client.post("/api/v1/projects/", json={"name": "API Test Project", "description": "Desc"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "API Test Project"
    assert data["id"] is not None
    project_id = data["id"]

    # Test duplicate project name
    response_dup = await async_client.post("/api/v1/projects/", json={"name": "API Test Project", "description": "Desc"})
    assert response_dup.status_code == 400
    assert "already registered" in response_dup.json()["detail"]

# Add a new test function to call the temporary auth endpoint
# Adding test_user as a dependency
async def test_authentication_dependency(async_client: AsyncClient, test_user: models.User):
    """Test that the get_current_active_user dependency works correctly."""
    response = await async_client.get("/test-auth")
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["username"] == test_user.username
    assert user_data["email"] == test_user.email
    assert user_data["full_name"] == test_user.full_name

# Temporary test to verify test user exists in the async_db_session
async def test_verify_test_user_exists(async_db_session: AsyncSession, test_user: models.User):
    from backend.crud.users import get_user_by_username # Import the async CRUD function
    print("[TEST VERIFY USER DEBUG] Attempting to fetch testuser by username...") # Debug print
    user = await get_user_by_username(async_db_session, username="testuser")
    print(f"[TEST VERIFY USER DEBUG] Result of fetching testuser: {user}") # Debug print
    assert user is not None
    assert user.username == "testuser"
    # Also check the fixture user
    assert test_user is not None
    assert test_user.username == "testuser"
