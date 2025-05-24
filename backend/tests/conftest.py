"""
Common test fixtures for unit tests.
"""
import os
import sys
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from httpx import AsyncClient
import pytest_asyncio
from fastapi import FastAPI
from jose import jwt
from datetime import datetime, timedelta

# Add the project root to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Import the database components
from backend.database import Base

# Explicitly import backend.models to ensure all models are registered
import backend.models

# Import specific models after the package is imported
from backend.models import User, Project, Agent, Task, Comment
from backend.models.project_template import ProjectTemplate

# Import routers
from backend.routers import mcp, projects, agents, audit_logs, memory, rules, tasks, users

# Create an in-memory SQLite database for testing
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

# Set dummy environment variables for testing security
os.environ["SECRET_KEY"] = "dummysecretkeyforenv"
os.environ["ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"

@pytest.fixture(scope="session")
def engine():
    """Create a SQLAlchemy engine for testing."""
    engine = create_engine(
        TEST_SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,  # Use StaticPool for in-memory testing
    )
    yield engine
    Base.metadata.drop_all(bind=engine, checkfirst=True)


@pytest.fixture
def db_session(engine):
    """Create a SQLAlchemy session for testing.
    
    Uses a transaction which is rolled back after each test.
    """
    # connect to the database
    connection = engine.connect()

    # begin a non-ORM transaction
    transaction = connection.begin()

    # create a Session bound to the connection.
    TestingSessionLocal = sessionmaker(bind=connection)
    session = TestingSessionLocal()

    # Drop and create all tables for a clean state before each test
    Base.metadata.drop_all(bind=engine, checkfirst=True)
    Base.metadata.create_all(bind=engine, checkfirst=True)

    try:
        yield session
    finally:
        # rollback the transaction
        transaction.rollback()
        connection.close()


@pytest.fixture
def test_user(db_session):
    """Create a test user with ADMIN role."""
    from backend.models.user import UserRole
    from backend.enums import UserRoleEnum
    user = User(
        username="testuser",
        hashed_password="hashed_password_for_test",
        email="test@example.com",
        full_name="Test User",
        disabled=False
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    # Assign ADMIN role
    admin_role = UserRole(user_id=user.id, role_name=UserRoleEnum.ADMIN)
    db_session.add(admin_role)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_project(db_session):
    """Create a test project."""
    project = Project(
        name="Test Project",
        description="A test project for unit tests",
        task_count=0,
        is_archived=False
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    return project


@pytest.fixture
def test_agent(db_session):
    """Create a test agent."""
    agent = Agent(
        name="Test Agent",
        is_archived=False
    )
    db_session.add(agent)
    db_session.commit()
    db_session.refresh(agent)
    return agent


@pytest.fixture
def test_task(db_session, test_project):
    """Create a test task."""
    from backend.enums import TaskStatusEnum
    
    task = Task(
        project_id=test_project.id,
        task_number=1,
        title="Test Task",
        description="A test task for unit tests",
        status=TaskStatusEnum.TO_DO,
        is_archived=False
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)
    return task


@pytest.fixture
def test_comment(db_session, test_task, test_user):
    """Create a test comment."""
    comment = Comment(
        task_project_id=test_task.project_id,
        task_task_number=test_task.task_number,
        author_id=test_user.id,
        content="Test comment"
    )
    db_session.add(comment)
    db_session.commit()
    db_session.refresh(comment)
    return comment


@pytest_asyncio.fixture(scope="module")
async def async_client():
    """Provides an asynchronous test client for the FastAPI application.
    
    This client can be used to make requests to the application during testing.
    """
    # Create a new FastAPI instance and include routers directly
    test_app = FastAPI()
    test_app.include_router(agents.router, prefix="/api/v1", tags=["Agents"])
    test_app.include_router(audit_logs.router, prefix="/api/v1", tags=["Audit"])
    test_app.include_router(memory.router, prefix="/api/v1", tags=["Memory"])
    test_app.include_router(mcp.router, prefix="/api/v1/mcp-tools", tags=["Mcp Tools"])
    test_app.include_router(projects.router, prefix="/api/v1", tags=["Projects"])
    test_app.include_router(rules.router, prefix="/api/v1", tags=["Rules"])
    test_app.include_router(tasks.router, prefix="/api/v1", tags=["Tasks"])
    test_app.include_router(users.router, prefix="/api/v1", tags=["Users"])

    # Add root route for test_get_root
    @test_app.get("/")
    async def root():
        return {"message": "Welcome to the Task Manager API"}

    # Generate a real JWT for username 'testuser'
    SECRET_KEY = os.getenv("SECRET_KEY", "a-very-secret-key-for-development-replace-me")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": "testuser", "exp": expire}
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    headers = {"Authorization": f"Bearer {token}"}

    async with AsyncClient(app=test_app, base_url="http://testserver", headers=headers) as client:
        yield client
