"""Test configuration and fixtures."""
import asyncio
import pytest
import pytest_asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from httpx import AsyncClient
from typing import AsyncGenerator

from backend.database import get_db, Base
from backend.main import app
from backend.models.user import User
from backend.models.agent import Agent
from backend.models.project import Project
from backend.models.task import Task
from backend.enums import UserRoleEnum, ProjectStatus, ProjectPriority, TaskStatusEnum, ProjectVisibility

# Test database URL
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="function")
async def async_client(db_session):
    """Create an async test client."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def sample_user(db_session):
    """Create a sample user for testing."""
    user = User(
        username="testuser",
        email="test@example.com",
        full_name="Test User",
        hashed_password="hashedpassword123",
        disabled=False,
        role=UserRoleEnum.USER
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def sample_admin_user(db_session):
    """Create a sample admin user for testing."""
    user = User(
        username="admin",
        email="admin@example.com", 
        full_name="Admin User",
        hashed_password="hashedpassword123",
        disabled=False,
        role=UserRoleEnum.ADMIN
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def sample_agent(db_session):
    """Create a sample agent for testing."""
    agent = Agent(
        name="Test Agent",
        description="A test agent"
    )
    db_session.add(agent)
    db_session.commit()
    db_session.refresh(agent)
    return agent


@pytest.fixture
def sample_project(db_session, sample_user):
    """Create a sample project for testing."""
    project = Project(
        name="Test Project",
        description="A test project for testing",
        status=ProjectStatus.ACTIVE,
        priority=ProjectPriority.MEDIUM,
        visibility=ProjectVisibility.TEAM,
        owner_id=sample_user.id
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    return project


@pytest.fixture
def sample_task(db_session, sample_project, sample_agent):
    """Create a sample task for testing."""
    task = Task(
        title="Test Task",
        description="A test task",
        status=TaskStatusEnum.TO_DO,
        project_id=sample_project.id,
        agent_id=sample_agent.id,
        task_number=1
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)
    return task


@pytest.fixture
def auth_headers():
    """Create authorization headers for testing."""
    return {"Authorization": "Bearer test_token"}
