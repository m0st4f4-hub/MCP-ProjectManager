"""
Integration tests for the task manager backend.
These tests verify that all layers (database, CRUD, service, routes) work together.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys
from sqlalchemy.pool import StaticPool
import pytest_asyncio
from httpx import AsyncClient

# Add the project root to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Import the app and database components
from backend.main import app
from backend.database import Base, get_db
from backend.models import User, Project, Task, Agent
from backend.enums import TaskStatusEnum

# Create a test database
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,  # Use StaticPool for in-memory testing
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a test client
# client = TestClient(app) # Removed module-level client creation


@pytest.fixture(scope="module")
def test_db():
    """Set up the test database environment and apply dependency overrides."""
    # Drop all tables before creating them to ensure a clean slate
    Base.metadata.drop_all(bind=engine)
    
    # Create the database tables
    Base.metadata.create_all(bind=engine)
    
    # Override the get_db dependency
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    yield
    
    # Clean up
    Base.metadata.drop_all(bind=engine)
    # Remove file cleanup as using in-memory database


@pytest_asyncio.fixture(scope="module")
async def test_client_with_db(test_db):
    """Create an asynchronous test client with a test database for integration tests."""
    # AsyncClient with app will automatically handle the lifespan context
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        yield client


@pytest.fixture(scope="module")
def test_user(test_db):
    """Create a test user for integration tests."""
    db = TestingSessionLocal()
    
    # Create a test user
    user = User(
        username="integrationuser",
        hashed_password="hashed_password_for_integration",
        email="integration@example.com",
        full_name="Integration Test User",
        disabled=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    yield user
    
    db.close()


@pytest.fixture(scope="module")
def auth_headers(test_user):
    """Create authentication headers for integration tests."""
    # In a real integration test, we would authenticate with the API
    # For simplicity, we'll just create a mock token
    return {"Authorization": f"Bearer test-token-{test_user.id}"}


async def test_create_and_get_project(test_client_with_db: AsyncClient, auth_headers):
    """Test creating and getting a project."""
    # Create a project
    project_data = {
        "name": "Integration Test Project",
        "description": "A project for integration testing"
    }
    
    # Create the project
    response = await test_client_with_db.post(
        "/projects/",
        json=project_data,
        headers=auth_headers
    )
    
    # Verify the project was created
    assert response.status_code == 200
    project = response.json()["data"]
    assert project["name"] == project_data["name"]
    assert project["description"] == project_data["description"]
    
    # Get the project
    response = await test_client_with_db.get(f"/projects/{project['id']}")
    
    # Verify the project was retrieved
    assert response.status_code == 200
    retrieved_project = response.json()["data"]
    assert retrieved_project["id"] == project["id"]
    assert retrieved_project["name"] == project["name"]
    assert retrieved_project["description"] == project["description"]


async def test_create_task_and_get_tasks(test_client_with_db: AsyncClient, auth_headers):
    """Test creating a task and getting tasks for a project."""
    # Create a project first
    project_data = {
        "name": "Task Integration Test Project",
        "description": "A project for task integration testing"
    }
    
    # Create the project
    response = await test_client_with_db.post(
        "/projects/",
        json=project_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    project = response.json()["data"]
    
    # Create a task
    task_data = {
        "title": "Integration Test Task",
        "description": "A task for integration testing",
        "status": "TO_DO"
    }
    
    # Create the task
    response = await test_client_with_db.post(
        f"/{project['id']}/tasks/",
        json=task_data,
        headers=auth_headers
    )
    
    # Verify the task was created
    assert response.status_code == 200
    task = response.json()["data"]
    assert task["title"] == task_data["title"]
    assert task["description"] == task_data["description"]
    assert task["status"] == task_data["status"]
    
    # Get the tasks for the project
    response = await test_client_with_db.get(f"/{project['id']}/tasks/")
    
    # Verify the tasks were retrieved
    assert response.status_code == 200
    tasks = response.json()["data"]
    assert len(tasks) == 1
    assert tasks[0]["title"] == task["title"]
    assert tasks[0]["project_id"] == project["id"]
    
    # Update the task
    update_data = {
        "title": "Updated Integration Test Task",
        "status": "IN_PROGRESS"
    }
    
    # Update the task
    response = await test_client_with_db.put(
        f"/{project['id']}/tasks/{task['task_number']}",
        json=update_data,
        headers=auth_headers
    )
    
    # Verify the task was updated
    assert response.status_code == 200
    updated_task = response.json()["data"]
    assert updated_task["title"] == update_data["title"]
    assert updated_task["status"] == update_data["status"]
    
    # Get the updated task
    response = await test_client_with_db.get(f"/{project['id']}/tasks/{task['task_number']}")
    
    # Verify the updated task was retrieved
    assert response.status_code == 200
    retrieved_task = response.json()["data"]
    assert retrieved_task["title"] == update_data["title"]
    assert retrieved_task["status"] == update_data["status"]
