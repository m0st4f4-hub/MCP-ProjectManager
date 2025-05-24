"""
Common test fixtures for unit tests.
"""
import os
import sys
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# Add the project root to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Import the database components
from backend.database import Base
from backend.models import *

# Create an in-memory SQLite database for testing
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="session")
def engine():
    """Create a SQLAlchemy engine for testing."""
    engine = create_engine(
        TEST_SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,  # Use StaticPool for in-memory testing
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session(engine):
    """Create a SQLAlchemy session for testing."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def test_user(db_session):
    """Create a test user."""
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
