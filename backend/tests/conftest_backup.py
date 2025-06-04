"""
Shared test fixtures and configuration.
"""
import os
import sys
import pytest
import asyncio
from typing import AsyncGenerator, Generator
from unittest.mock import AsyncMock, Mock  # Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from sqlalchemy import event
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport

from backend.database import Base, get_db
from backend.main import app
from backend.models import User as UserModel
from backend.models import Project as ProjectModel
from backend.crud.users import get_password_hash
from backend.enums import UserRoleEnum  # Re-enabled for mock_admin_user fixture  # Test database URL - use SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"  # Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True
)  # Create test session factory
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


def override_get_db(async_db_session: AsyncSession):
    """Override the get_db dependency."""
    async def _get_db():
        yield async_db_session
    return _get_db

@pytest.fixture(scope="function")


def test_app(override_get_db):
    """Create a test FastAPI app."""  # Create a fresh app instance
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
        print("Successfully included projects router")
    except ImportError as e:
        print(f"Failed to import projects router: {e}")

    try:
        from backend.routers import tasks
        test_app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])
        print("Successfully included tasks router")
    except ImportError as e:
        print(f"Failed to import tasks router: {e}")
    except Exception as e:
        print(f"Error including tasks router: {e}")
    
    # Include auth router
    try:
        from backend.routers.users.auth.auth import router as auth_router
        test_app.include_router(auth_router, prefix="/api/v1", tags=["auth"])
        print("Successfully included auth router in test app")
    except ImportError as e:
        print(f"Failed to import auth router: {e}")
    except Exception as e:
        print(f"Error including auth router: {e}")  # Override database dependency
    test_app.dependency_overrides[get_db] = override_get_db

    return test_app

@pytest.fixture(scope="function")


def test_client(test_app):
    """Create a test client."""
    return TestClient(test_app)

@pytest.fixture(scope="function")
async def async_client(test_app) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client."""
    async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test") as client:
        yield client

@pytest.fixture


async def mock_admin_user(async_db_session: AsyncSession):
    """Create a mock admin user."""
    user = UserModel(
        username="admin_test",
        email="admin@test.com",
        hashed_password="hashed",
        disabled=False
    )
    
    # Add the admin role
    from backend.models.user import UserRole
    user_role = UserRole(user=user, role_name=UserRoleEnum.ADMIN)
    user.user_roles.append(user_role)
    
    async_db_session.add(user)
    await async_db_session.commit()
    await async_db_session.refresh(user)
    return user

@pytest.fixture


async def mock_project(async_db_session: AsyncSession, mock_admin_user):
    """Create a mock project."""
    project = ProjectModel(
        name="Test Project",
        description="Test Description",
        created_by=mock_admin_user.id
    )
    async_db_session.add(project)
    await async_db_session.commit()
    await async_db_session.refresh(project)
    return project  # Configure pytest-asyncio
@pytest.fixture
async def test_task(async_db_session: AsyncSession, mock_project):
    """Create a test task."""
    from backend.models import Task
    from backend.enums import TaskStatusEnum
    
    task = Task(
        project_id=mock_project.id,
        task_number=1,
        title="Test Task",
        description="Test task description",
        status=TaskStatusEnum.TO_DO
    )
    async_db_session.add(task)
    await async_db_session.commit()
    await async_db_session.refresh(task)
    return task

@pytest.fixture
async def test_agent(async_db_session: AsyncSession):
    """Create a test agent."""
    from backend.models import Agent
    
    agent = Agent(
        name="Test Agent",
        description="Test agent description"
    )
    async_db_session.add(agent)
    await async_db_session.commit()
    await async_db_session.refresh(agent)
    return agent

@pytest.fixture
async def test_user(async_db_session: AsyncSession):
    """Create a test user."""
    user = UserModel(
        username="test_user",
        email="test@example.com",
        hashed_password=get_password_hash("testpassword"),
        disabled=False
    )
    async_db_session.add(user)
    await async_db_session.commit()
    await async_db_session.refresh(user)
    return user

@pytest.fixture
async def test_project(async_db_session: AsyncSession, test_user):
    """Create a test project."""
    project = ProjectModel(
        name="Test Project",
        description="Test Description",
        created_by=test_user.id
    )
    async_db_session.add(project)
    await async_db_session.commit()
    await async_db_session.refresh(project)
    return project


def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    yield loop
    loop.close()
