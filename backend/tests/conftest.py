"""
Shared test fixtures and configuration.
"""
# flake8: noqa
import os
import sys
import pytest
import asyncio
from typing import AsyncGenerator, Generator
from unittest.mock import AsyncMock, Mock
import subprocess
import time
from pathlib import Path

# Add project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from sqlalchemy import event
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport
import uuid

from backend.database import Base, get_db
from backend.models import User as UserModel
from backend.models import Project as ProjectModel
from backend.models import Task as TaskModel
from backend.models import Agent as AgentModel
from backend.models import ProjectMember as ProjectMemberModel
from backend.crud.users import get_password_hash
from backend.enums import UserRoleEnum, TaskStatusEnum
from backend.main import app


@pytest.fixture(scope="session")
def backend_server() -> Generator[None, None, None]:
    """Start the FastAPI backend in a subprocess for integration tests."""
    repo_root = Path(__file__).resolve().parents[2]
    script = repo_root / "scripts" / "start_test_backend.py"
    process = subprocess.Popen([sys.executable, str(script)])
    time.sleep(2)
    try:
        yield
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()

# Test database URL - use SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True
)

# Create test session factory
TestingSessionLocal = async_sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

@pytest.fixture(scope="function")
async def async_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        yield session
        await session.rollback()

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture(scope="function")
def test_app(async_db_session: AsyncSession):
    """Create a test FastAPI app."""
    # Create a fresh app instance
    from fastapi import FastAPI
    test_app = FastAPI(title="Task Manager Test")
    
    # Add root route
    @test_app.get("/")
    async def read_root():
        return {"message": "Welcome to the Task Manager API"}
    
    # Include basic routers
    try:
        from backend.routers import projects
        test_app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projects"])
    except Exception as e:
        print(f"Error including projects router: {e}")

    try:
        from backend.routers import tasks
        test_app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])
    except Exception as e:
        print(f"Error including tasks router: {e}")
    
    # Include auth router
    try:
        from backend.routers.users.auth.auth import router as auth_router
        test_app.include_router(auth_router, prefix="/api/v1", tags=["auth"])
    except Exception as e:
        print(f"Error including auth router: {e}")

    # Include users router
    try:
        from backend.routers import users
        test_app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
    except Exception as e:
        print(f"Error including users router: {e}")

    try:
        from backend.routers import memory
        test_app.include_router(memory.router, prefix="/api/memory", tags=["Memory"])
    except Exception as e:
        print(f"Error including memory router: {e}")

    # Override database dependency with direct function
    async def get_test_db():
        yield async_db_session
    
    test_app.dependency_overrides[get_db] = get_test_db

    from backend.middleware.error_handlers import register_exception_handlers
    register_exception_handlers(test_app)

    return test_app

@pytest.fixture(scope="function")
def test_client(test_app):
    """Create a test client."""
    return TestClient(test_app)

@pytest.fixture(scope="function")
async def async_client(test_app) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client."""
    async with AsyncClient(transport=ASGITransport(app=test_app, raise_app_exceptions=False), base_url="http://test") as client:
        yield client

@pytest.fixture
async def test_user(async_db_session: AsyncSession):
    """Create a test user."""
    user = UserModel(
        username="test_user",
        email="test@example.com",
        hashed_password=get_password_hash("testpassword"),
        disabled=False,
        role=UserRoleEnum.MANAGER  # Give MANAGER role to allow project creation
    )
    async_db_session.add(user)
    await async_db_session.commit()
    await async_db_session.refresh(user)
    return user

@pytest.fixture
async def authenticated_client(async_client: AsyncClient, test_user) -> AsyncClient:
    """Create an authenticated async client with JWT token."""
    from backend.auth import create_access_token
    
    # Create access token for test user
    access_token = create_access_token(data={"sub": test_user.username})
    
    # Add authorization header to client
    async_client.headers.update({"Authorization": f"Bearer {access_token}"})
    
    return async_client

@pytest.fixture
async def test_project(async_db_session: AsyncSession, test_user):
    """Create a test project."""
    project = ProjectModel(
        name="Test Project",
        description="A test project",
        owner_id=test_user.id  # Use string UUID directly, not uuid.UUID()
    )
    async_db_session.add(project)
    await async_db_session.commit()
    await async_db_session.refresh(project)
    return project

@pytest.fixture
async def test_agent(async_db_session: AsyncSession):
    """Create a test agent."""
    agent = AgentModel(
        name="Test Agent",
        description="A test AI agent"
    )
    async_db_session.add(agent)
    await async_db_session.commit()
    await async_db_session.refresh(agent)
    return agent

@pytest.fixture
async def test_task(async_db_session: AsyncSession, test_project):
    """Create a test task."""
    task = TaskModel(
        title="Test Task",
        description="A test task",
        status=TaskStatusEnum.TO_DO,
        project_id=test_project.id,
        task_number=1
    )
    async_db_session.add(task)
    await async_db_session.commit()
    await async_db_session.refresh(task)
    return task
