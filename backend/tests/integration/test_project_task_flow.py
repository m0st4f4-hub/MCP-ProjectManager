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
from backend.models import User, UserRole
from backend.enums import UserRoleEnum
from backend.auth import get_current_active_user, RoleChecker
import uuid
from fastapi import Depends
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker, Session
from backend.database import Base, get_db # Import Base
from backend.schemas.user import User, UserRole # Import UserRole schema
from backend.models import User as UserModel, UserRole as UserRoleModel # For type hinting current_user
import asyncio

# Add the project root to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Import the app and database components
from backend.main import app
from backend.models import User, Project, Task, Agent
from backend.enums import TaskStatusEnum

# Create a test database
TEST_SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,  # Use StaticPool for in-memory testing
)

# Use AsyncSessionLocal for tests
TestingSessionLocal = async_sessionmaker(bind=engine)

# Create a test client
# client = TestClient(app) # Removed module-level client creation


@pytest_asyncio.fixture(scope="function")
async def test_db():
    """Set up the test database environment and apply dependency overrides."""
    # Drop all tables before creating them to ensure a clean slate
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    # Create the database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Override the get_db dependency to yield an AsyncSession
    async def override_get_db(): # Make override async
        async with TestingSessionLocal() as db:
            yield db
    
    app.dependency_overrides[get_db] = override_get_db
    
    # Yield the database session for the module-scoped tests
    # Although the fixture yields, its primary role is setup/teardown
    # The actual session for tests comes from the overridden get_db
    # This yield is just to satisfy pytest fixture requirement.
    yield
    
    # Clean up
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    # Remove file cleanup as using in-memory database


@pytest_asyncio.fixture(scope="function")
async def test_client_with_db(test_db):
    """Create an asynchronous test client with a test database for integration tests."""
    # Create a mock active admin user for testing protected endpoints
    mock_admin_user_id = str(uuid.uuid4())
    mock_admin_user = User(
        id=mock_admin_user_id, # Ensure unique ID
        username="testadmin",
        hashed_password="mockhashedpassword",
        email="testadmin@example.com",
        full_name="Test Admin",
        disabled=False,
        # Use SQLAlchemy model for UserRole, not Pydantic schema
        user_roles=[UserRoleModel(role_name=UserRoleEnum.ADMIN, user_id=mock_admin_user_id)] # Assign ADMIN role and user_id
    )

    # Override get_current_active_user dependency to return the mock admin user
    async def override_get_current_active_user():
        return mock_admin_user

    # Override RoleChecker dependency to always allow access for this test client
    class MockRoleChecker:
        def __init__(self, allowed_roles): # Keep the constructor signature
            # The __init__ method still receives the arguments passed in Depends(RoleChecker(...))
            self.allowed_roles = allowed_roles

        async def __call__(self, current_user: User = Depends(get_current_active_user)):
            # This method is called when the dependency is resolved during a request.
            # Since get_current_active_user is already overridden to return the mock admin,
            # we can simply return the user, effectively passing the role check.
            print(f"[AUTH DEBUG] MockRoleChecker __call__ for user: {current_user.username}. Allowing access.")
            return current_user # Return the user to satisfy the dependency

    app.dependency_overrides[get_current_active_user] = override_get_current_active_user
    # Override the RoleChecker class itself, not an instance
    app.dependency_overrides[RoleChecker] = MockRoleChecker

    # Include routers before creating the AsyncClient
    from backend.main import include_app_routers
    include_app_routers(app)

    async with AsyncClient(app=app, base_url="http://testserver") as client:
        yield client

    # Clean up dependency overrides after the test
    app.dependency_overrides.pop(get_current_active_user, None)
    app.dependency_overrides.pop(RoleChecker, None)


@pytest_asyncio.fixture(scope="function")
async def test_user(test_db): # Make fixture async and remove event_loop dependency
    """Create a test user for integration tests."""
    # Use a direct database session instead of get_db() to avoid conflicts
    user_id_for_fixture = str(uuid.uuid4()) # Define user_id for this fixture
    unique_email = f"integrationuser_{uuid.uuid4()}@example.com" # Make email unique
    unique_username = f"integrationuser_{uuid.uuid4()}" # Make username unique
    
    async with TestingSessionLocal() as db:
        # Create a test user
        user = User(
            id=user_id_for_fixture, # Explicitly set UUID
            username=unique_username, # Use unique username
            hashed_password="hashed_password_for_integration",
            email=unique_email, # Use unique email
            full_name="Integration Test User",
            disabled=False,
            # Use SQLAlchemy model for UserRole, not Pydantic schema
            user_roles=[UserRoleModel(role_name=UserRoleEnum.ADMIN, user_id=user_id_for_fixture)] # Assign ADMIN role and user_id
        )
        db.add(user)
        await db.commit() # Use await for async commit
        await db.refresh(user) # Use await for async refresh

        yield user

    # Session is automatically closed by the context manager


@pytest_asyncio.fixture(scope="function")
async def auth_headers(test_user): # Make fixture async and remove event_loop dependency
    """Create authentication headers for integration tests."""
    # In a real integration test, we would authenticate with the API
    # For simplicity, we'll just create a mock token
    return {"Authorization": f"Bearer test-token-{test_user.id}"}


@pytest.mark.asyncio
async def test_create_and_get_project(test_client_with_db: AsyncClient, auth_headers):
    """Test creating and getting a project."""
    # Create a project
    project_data = {
        "name": "Integration Test Project",
        "description": "A project for integration testing"
    }
    
    # Create the project
    response = await test_client_with_db.post(
        "/api/v1/projects/",
        json=project_data,
        headers=auth_headers
    )
    
    # Verify the project was created
    assert response.status_code == 200
    project = response.json()["data"]
    assert project["name"] == project_data["name"]
    assert project["description"] == project_data["description"]
    
    # Get the project
    response = await test_client_with_db.get(
        f"/api/v1/projects/{project['id']}",
        headers=auth_headers
    )
    
    # Verify the project was retrieved
    assert response.status_code == 200
    retrieved_project = response.json()["data"]
    assert retrieved_project["id"] == project["id"]
    assert retrieved_project["name"] == project["name"]
    assert retrieved_project["description"] == project["description"]


@pytest.mark.asyncio
async def test_create_task_and_get_tasks(test_client_with_db: AsyncClient, auth_headers):
    """Test creating a task and getting tasks for a project."""
    # Create a project first
    project_data = {
        "name": "Task Integration Test Project",
        "description": "A project for task integration testing"
    }
    
    # Create the project
    response = await test_client_with_db.post(
        "/api/v1/projects/", # Correct path
        json=project_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    project = response.json()["data"]
    
    # Create a task
    task_data = {
        "title": "Integration Test Task",
        "description": "A task for integration testing",
        "status": "To Do"  # Use the correct enum value
    }
    
    # Create the task
    response = await test_client_with_db.post(
        f"/api/v1/{project['id']}/tasks/", # Correct path based on tasks router
        json=task_data,
        headers=auth_headers
    )
    
    # Debug output
    print(f"Project ID: {project['id']}")
    print(f"Create task response status: {response.status_code}")
    print(f"Create task response body: {response.text}")
    
    # Verify the task was created
    assert response.status_code == 200
    task = response.json()["data"]
    assert task["title"] == task_data["title"]
    assert task["description"] == task_data["description"]
    assert task["status"] == task_data["status"]
    
    # Get the tasks for the project
    response = await test_client_with_db.get(
        f"/api/v1/{project['id']}/tasks/", # Correct path based on tasks router
        headers=auth_headers
    )
    
    # Verify the tasks were retrieved
    assert response.status_code == 200
    tasks = response.json()["data"]
    assert len(tasks) == 1
    assert tasks[0]["title"] == task["title"]
    assert tasks[0]["project_id"] == project["id"]
    
    # Update the task
    update_data = {
        "title": "Updated Integration Test Task",
        "status": "In Progress"  # Use the correct enum value
    }
    
    # Update the task
    response = await test_client_with_db.put(
        f"/api/v1/{project['id']}/tasks/{task['task_number']}/", # Correct path based on tasks router
        json=update_data,
        headers=auth_headers
    )
    
    # Verify the task was updated
    assert response.status_code == 200
    updated_task = response.json()["data"]
    assert updated_task["title"] == update_data["title"]
    assert updated_task["status"] == update_data["status"]
    
    # Get the updated task
    response = await test_client_with_db.get(f"/api/v1/{project['id']}/tasks/{task['task_number']}")
    
    # Verify the updated task was retrieved
    assert response.status_code == 200
    retrieved_task = response.json()["data"]
    assert retrieved_task["title"] == update_data["title"]
    assert retrieved_task["status"] == update_data["status"]


# Use AsyncSessionLocal for tests