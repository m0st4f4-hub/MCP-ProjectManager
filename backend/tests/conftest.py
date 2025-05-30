"""
Common test fixtures for unit tests.
"""
import os
import sys
import pytest
# from sqlalchemy import create_engine # Remove synchronous engine import
# from sqlalchemy.orm import sessionmaker, Session # Remove synchronous session imports
from sqlalchemy.pool import StaticPool
from httpx import AsyncClient, ASGITransport
import pytest_asyncio
from fastapi import FastAPI, Depends
from jose import jwt
from datetime import datetime, timedelta, timezone
from .database import get_db
from .auth import get_current_active_user
from .schemas.user import User
from .models.user import User as UserModel
from unittest.mock import MagicMock, patch, AsyncMock
from backend.crud.users import create_user # Moved import here

# Add the project root to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Import the database components
from .database import Base

# Explicitly import backend.models to ensure all models are registered
import backend.models

# Import specific models required for type hints and fixtures
from .models import (\
 User,\
 Project,\
 Agent,\
 Task,\
 Comment,\
 ProjectTemplate,\
 UserRole,\
 ProjectMember,\
 ProjectFileAssociation,\
 TaskDependency,\
 AuditLog,\
 TaskFileAssociation\
)

# Import DataResponse and Task schema for model_rebuild
from .schemas.api_responses import DataResponse
from .schemas.task import Task as TaskSchema # Import with alias to avoid conflict with model.Task

# Import specific schemas
from .schemas.user import UserCreate # Import UserCreate schema

# Import specific model for type hinting BEFORE its usage
# from .models.user import User as UserModel # Moved import here

# REMOVED: Import routers at the module level to avoid circular dependency during conftest loading
# from backend.routers import mcp, projects, agents, audit_logs, memory, rules, rules, tasks, users

# Import async database components
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession # Import async components

# Import sessionmaker
from sqlalchemy.orm import sessionmaker # Import sessionmaker

# Import greenlet_spawn for manual greenlet context management
from sqlalchemy.util import greenlet_spawn # Import greenlet_spawn

# Import project CRUD for cleanup - Keep this import as it's directly used in cleanup logic
from backend.crud import projects as crud_projects # Import project CRUD
import logging # Import logging for debug prints

import asyncio # Import asyncio
import uuid # Import uuid

# REMOVED: Import models module explicitly (already done above)
# REMOVED: from backend import models

# Import UserRoleEnum
from .enums import UserRoleEnum

logger = logging.getLogger(__name__)

# Create an in-memory SQLite database for testing
TEST_SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:" # Use aiosqlite for async

# Set dummy environment variables for testing security
os.environ["SECRET_KEY"] = "dummysecretkeyforenv"
os.environ["ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"

# Define a session-scoped async engine fixture
@pytest_asyncio.fixture(scope="function")
async def async_engine():
 """Create a session-scoped asynchronous SQLAlchemy engine for testing."""
 engine = create_async_engine(
 TEST_SQLALCHEMY_DATABASE_URL,
 connect_args={"check_same_thread": False},
 poolclass=StaticPool,
 )
 # No table creation here, it will be handled in async_db_session fixture
 yield engine
 # Dispose the engine at the end of the session
 await engine.dispose()

# Add a session-scoped event_loop fixture


# Modify async_db_session fixture to use the session-scoped engine
@pytest_asyncio.fixture(scope="function")
async def async_db_session(async_engine): # Use the session-scoped engine
 """Create a function-scoped asynchronous SQLAlchemy session for testing."""
 # Drop and create tables before each test function
 async with async_engine.begin() as conn:
 await conn.run_sync(Base.metadata.drop_all)
 await conn.run_sync(Base.metadata.create_all)

 # Create an async session bound to the engine
 AsyncTestingSessionLocal = sessionmaker(
 bind=async_engine, class_=AsyncSession, expire_on_commit=False
 )
 
 # Use a single async with block for the session lifespan
 async with AsyncTestingSessionLocal() as session:
 try:
 yield session
 finally:
 # No drop_all here, handled by the next function scope or session teardown
 await session.close()
 # Engine disposal handled by async_engine fixture teardown


# Modify async_client fixture to use the session-scoped engine
@pytest_asyncio.fixture(scope="function")
async def async_client(async_engine): # Use the session-scoped engine
 """
 Provides an asynchronous test client for the FastAPI application.
 
 This client can be used to make requests to the application during testing.
 Routers are imported individually within the fixture to isolate import errors.
 """
 logger.info("[ASYNC CLIENT DEBUG] Creating async client...")
 test_app = FastAPI()

 async def override_get_db():
 logger.debug("[ASYNC CLIENT DEBUG] Overriding get_db dependency.")
 # Use the session-scoped engine to create a new session for each request
 AsyncTestingSessionLocal = sessionmaker(
 bind=async_engine, class_=AsyncSession, expire_on_commit=False
 )
 
 async with AsyncTestingSessionLocal() as session:
 yield session
 
 # Engine disposal handled by async_engine fixture teardown

 test_app.dependency_overrides[get_db] = override_get_db

 # Import and include routers individually to identify the problematic import
 try:
 from backend.routers import agents
 test_app.include_router(agents.router, prefix="/api/v1", tags=["Agents"])
 logger.info("[ASYNC CLIENT DEBUG] Successfully loaded agents router.")
 except ImportError as e:
 logger.error(f"[ASYNC CLIENT DEBUG] Failed to load agents router: {e}")
 raise # Re-raise to stop test collection if this fails

 try:
 from backend.routers import audit_logs
 test_app.include_router(audit_logs.router, prefix="/api/v1", tags=["Audit"])
 logger.info("[ASYNC CLIENT DEBUG] Successfully loaded audit_logs router.")
 except ImportError as e:
 logger.error(f"[ASYNC CLIENT DEBUG] Failed to load audit_logs router: {e}")
 raise

 try:
 from backend.routers import memory
 test_app.include_router(memory.router, prefix="/api/v1", tags=["Memory"])
 logger.info("[ASYNC CLIENT DEBUG] Successfully loaded memory router.")
 except ImportError as e:
 logger.error(f"[ASYNC CLIENT DEBUG] Failed to load memory router: {e}")
 raise

 try:
 from backend.routers import mcp
 test_app.include_router(mcp.router, prefix="/api/v1/mcp-tools", tags=["Mcp Tools"])
 logger.info("[ASYNC CLIENT DEBUG] Successfully loaded mcp router.")
 except ImportError as e:
 logger.error(f"[ASYNC CLIENT DEBUG] Failed to load mcp router: {e}")
 raise

 try:
 from backend.routers import projects
 test_app.include_router(projects.router, prefix="/api/v1", tags=["Projects"])
 logger.info("[ASYNC CLIENT DEBUG] Successfully loaded projects router.")
 except ImportError as e:
 logger.error(f"[ASYNC CLIENT DEBUG] Failed to load projects router: {e}")
 raise

 try:
 from backend.routers import rules
 test_app.include_router(rules.router, prefix="/api/v1", tags=["Rules"])
 logger.info("[ASYNC CLIENT DEBUG] Successfully loaded rules router.")
 except ImportError as e:
 logger.error(f"[ASYNC CLIENT DEBUG] Failed to load rules router: {e}")
 raise

 try:
 from backend.routers import tasks
 test_app.include_router(tasks.router, prefix="/api/v1", tags=["Tasks"])
 logger.info("[ASYNC CLIENT DEBUG] Successfully loaded tasks router.")
 except ImportError as e:
 logger.error(f"[ASYNC CLIENT DEBUG] Failed to load tasks router: {e}")
 raise

 try:
 from backend.routers import users
 test_app.include_router(users.router, prefix="/api/v1", tags=["Users"])
 logger.info("[ASYNC CLIENT DEBUG] Successfully loaded users router.")
 except ImportError as e:
 logger.error(f"[ASYNC CLIENT DEBUG] Failed to load users router: {e}")
 raise

 # Add root route for test_get_root
 @test_app.get("/")
 async def root():
 return {"message": "Welcome to the Task Manager API"}

 # Add temporary auth test endpoint
 from fastapi import Depends
 from .auth import get_current_active_user
 from .schemas.user import User as UserSchema

 @test_app.get("/test-auth", response_model=UserSchema)
 async def test_auth_endpoint(current_user: UserSchema = Depends(get_current_active_user)):
 return current_user

 # Generate a real JWT for username 'testuser'
 # Need to override get_user_by_username dependency for this to work without a real DB query
 from backend.crud.users import get_user_by_username as get_user_by_username_crud
 from .auth import create_access_token
 from .auth import ALGORITHM, SECRET_KEY
 from .auth import ACCESS_TOKEN_EXPIRE_MINUTES
 
 # Create a mock user model for token generation
 mock_user_model = MagicMock(spec=UserModel)
 mock_user_model.username = "testuser"
 mock_user_model.id = "test-user-id" # Ensure ID is set for token claims
 mock_user_model.email = "test@example.com"
 mock_user_model.full_name = "Test User"
 mock_user_model.disabled = False
 mock_user_model.is_superuser = False
 
 # Create a mock UserRole model instance for the admin role
 mock_admin_role = MagicMock(spec=UserRole)
 mock_admin_role.role = UserRoleEnum.ADMIN
 
 # Assign the admin role to the mock user
 mock_user_model.roles = [mock_admin_role]
 
 # Create a mock UserRole model instance for the user role (if needed for other tests)

 # Override get_user_by_username CRUD function to return the mock user
 # This is needed by the get_current_user_from_token dependency in backend.auth
 # The path to patch is where it's *used*, which is in backend.auth
 # Need to find the exact path to patch get_user_by_username_crud
 # It's likely imported and used directly in the get_current_user_from_token dependency function

 # Temporarily override get_user_by_username in backend.auth
 # This patch is specifically for the token generation part within this fixture.
 # Other tests might have their own patches for CRUD operations.
 with patch('backend.auth.get_user_by_username', new_callable=AsyncMock) as mock_get_user_crud:
 mock_get_user_crud.return_value = mock_user_model

 # Generate a token using the patched get_user_by_username
 access_token_expires = timedelta(minutes=float(ACCESS_TOKEN_EXPIRE_MINUTES))
 access_token = await create_access_token(
 data={"sub": mock_user_model.username, "user_id": str(mock_user_model.id)}, # Include user_id in token
 expires_delta=access_token_expires
 )

 print(f" [conftest.py > async_client] SECRET_KEY: {SECRET_KEY}")
 print(f" [conftest.py > async_client] ALGORITHM: {ALGORITHM}")
 print(f" [conftest.py > async_client] Generated access_token: {access_token}")

 # Call model_rebuild for DataResponse[Task] after all routers are loaded
 # This is needed because Task schema has forward references that might depend on backend being fully loaded.
 try:
 DataResponse[TaskSchema].model_rebuild()
 logger.info("[ASYNC CLIENT DEBUG] Successfully called DataResponse[Task].model_rebuild().")
 except Exception as e:
 logger.error(f"[ASYNC CLIENT DEBUG] Failed to call DataResponse[Task].model_rebuild(): {e}")
 # Continue without re-raising, the test run will show if this was critical.
 pass

 # Now, override get_current_active_user dependency in the test_app itself
 # This override will be active for all requests made through this async_client fixture.
 async def override_get_current_active_user():
 # In a real scenario, this would use the token to get the user.
 # Here, we retrieve the test user from the database by username.
 from backend.crud.users import get_user_by_username as get_user_by_username_crud
 from .database import AsyncSessionLocal # Import AsyncSessionLocal if needed
 
 # Need to get a db session here to query the user.
 # This override is within the async_client fixture, which has access to the async_engine.
 # Use a new session for this dependency override.
 AsyncTestingSessionLocal = sessionmaker(
 bind=async_engine, class_=AsyncSession, expire_on_commit=False
 )

 async with AsyncTestingSessionLocal() as session:
 # Assuming the token contains the username or user ID
 # In this test context, we know the username is 'testuser' from the mock token.
 user = await get_user_by_username_crud(session, username="testuser")
 if user:
 return user
 # If user not found (shouldn't happen in this test setup), raise HTTPException
 raise HTTPException(status_code=401, detail="User not found for authentication")

 # Create a mock user with admin role for the dependency override
 mock_user_with_admin_role = MagicMock()
 mock_user_with_admin_role.id = str(uuid.uuid4())
 mock_user_with_admin_role.username = "mockadmin"
 mock_user_with_admin_role.email = "mockadmin@example.com"
 mock_user_with_admin_role.full_name = "Mock Admin User"
 mock_user_with_admin_role.disabled = False
 mock_user_with_admin_role.is_superuser = True # Add is_superuser attribute for completeness if needed elsewhere

 # Create a mock UserRole object with the 'role' attribute set to 'admin'
 mock_admin_role = MagicMock()
 mock_admin_role.role_name = UserRoleEnum.ADMIN # Use the enum value and corrected attribute name

 # Assign a list containing the mock admin role to the mock user's user_roles attribute
 mock_user_with_admin_role.user_roles = [mock_admin_role]

 # Apply the patch as a context manager within the fixture. Patching get_current_user
 # bypasses the need for a valid JWT for tests using this client.
 with patch("backend.auth.get_current_user", return_value=mock_user_with_admin_role) as mock_dependency:

 # Add the test token as a global header for this client
 # This ensures the test client sends the token with every request
 # The token generation still uses the mock user logic above this patch
 # Comment out or remove the original AsyncClient instantiation
 # async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://testserver", headers={'Authorization': f'Bearer {access_token}'}) as client:
 # yield client

 # Add a new AsyncClient instantiation with the Authorization header
 async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://testserver", headers={'Authorization': f'Bearer {access_token}'}) as client:
 yield client


# Ensure the test_user fixture uses the async_db_session
@pytest_asyncio.fixture(scope="function")
async def test_user(async_db_session: AsyncSession): # Add type hint
 """Creates a test user with admin role."""
 # Debug logging
 logger.debug(" [conftest.py > test_user] Creating test user...")

 # Imports needed within the fixture scope
 from backend.crud.users import create_user, get_password_hash
 from .schemas.user import UserCreate
 from .models.user import User as UserModel, UserRole
 from .enums import UserRoleEnum
 from sqlalchemy.future import select
 from sqlalchemy.orm import selectinload

 # Define user data using the UserCreate schema
 user_data = UserCreate(
 username="testuser",
 password="testpassword",
 email="test@example.com",
 full_name="Test User",
 roles=["admin"] # Assign admin role during creation
 )

 # Debugging: Check if user_data has the roles attribute and its type
 print(f" [conftest.py > test_user] user_data has roles attribute: {'roles' in user_data.model_dump()}")
 print(f" [conftest.py > test_user] Type of user_data.roles: {type(user_data.roles)}")
 print(f" [conftest.py > test_user] Value of user_data.roles: {user_data.roles}")

 db_user = await create_user(db=async_db_session, user=user_data)

 # Assign the 'admin' role to the test user for tests that require it
 from .models.user import User as UserModel # Import here for get
 user_with_roles = await async_db_session.get(
 UserModel, db_user.id, options=[selectinload(UserModel.user_roles)]
 )

 yield user_with_roles

 # Teardown: No explicit deletion needed; the database is dropped and recreated for each function-scoped session


# Update existing fixtures to use async and async_db_session
@pytest_asyncio.fixture
async def test_project(async_db_session: AsyncSession, test_user: UserModel): # Make async, use async_db_session
 """Fixture to create and return a test project."""
 from .models.project import Project as ProjectModel
 from backend.crud.projects import create_project # Import CRUD function
 from .schemas.project import ProjectCreate # Import schema

 project_data = ProjectCreate(name="Test Project", description="A test project")
 
 # Create the project using the async CRUD function
 db_project = await create_project(db=async_db_session, project=project_data)
 
 # Return the created project model instance
 return db_project


@pytest_asyncio.fixture
async def test_agent(async_db_session: AsyncSession): # Make async, use async_db_session
 """Fixture to create and return a test agent."""
 from .models.agent import Agent as AgentModel
 from backend.crud.agents import create_agent # Import CRUD function
 from .schemas.agent import AgentCreate # Import schema

 agent_data = AgentCreate(name="Test Agent", description="A test agent")
 
 db_agent = await create_agent(db=async_db_session, agent=agent_data)

 return db_agent


@pytest_asyncio.fixture
async def test_task(async_db_session: AsyncSession, test_project: Project): # Make async, use async_db_session
 """Fixture to create and return a test task."""
 from .models.task import Task as TaskModel
 from backend.crud.tasks import create_task # Import CRUD function
 from .schemas.task import TaskCreate # Import schema

 task_data = TaskCreate(
 project_id=test_project.id,
 task_number=1,
 title="Test Task",
 description="A test task"
 )

 db_task = await create_task(db=async_db_session, project_id=test_project.id, task=task_data)
 
 return db_task


@pytest_asyncio.fixture
async def test_comment(async_db_session: AsyncSession, test_task: Task, test_user: UserModel): # Make async, use async_db_session
 """Fixture to create and return a test comment."""
 from .models.comment import Comment as CommentModel
 from backend.crud.comments import create_comment # Import CRUD function
 from .schemas.comment import CommentCreate # Import schema

 comment_data = CommentCreate(
 task_id=test_task.id,
 user_id=test_user.id,
 content="Test comment content"
 )

 db_comment = await create_comment(db=async_db_session, comment=comment_data)

 return db_comment


@pytest_asyncio.fixture
async def test_project_file_association(async_db_session: AsyncSession, test_project: Project): # Make async
 """Fixture to create a project file association."""
 from .models.project_file_association import ProjectFileAssociation as ProjectFileAssociationModel
 from backend.crud.project_file_associations import create_project_file_association # Import CRUD

 # Assuming file_memory_entity_id can be a dummy integer for this fixture
 association = await create_project_file_association(
 db=async_db_session,
 project_id=test_project.id,
 file_memory_entity_id=999 # Dummy ID
 )
 return association


@pytest_asyncio.fixture
async def test_task_file_association(async_db_session: AsyncSession, test_task: Task): # Make async
 """Fixture to create a task file association."""
 from .models.task_file_association import TaskFileAssociation as TaskFileAssociationModel
 from backend.crud.task_file_associations import create_task_file_association # Import CRUD

 # Assuming file_memory_entity_id can be a dummy integer for this fixture
 association = await create_task_file_association(
 db=async_db_session,
 task_id=test_task.id,
 file_memory_entity_id=888 # Dummy ID
 )
 return association


@pytest_asyncio.fixture
async def test_task_dependency(async_db_session: AsyncSession, test_task: Task): # Make async
 """Fixture to create a task dependency."""
 from .models.task_dependency import TaskDependency as TaskDependencyModel
 from backend.crud.task_dependencies import create_task_dependency # Import CRUD
 
 # Assuming a dependency on the same task or another dummy task ID
 dependency = await create_task_dependency(
 db=async_db_session,
 dependent_task_id=test_task.id,
 dependency_task_id=test_task.id # Dependency on itself for simplicity, or create another task fixture
 )
 return dependency


@pytest_asyncio.fixture
async def test_audit_log_entry(async_db_session: AsyncSession, test_user: UserModel): # Make async
 """Fixture to create an audit log entry."""
 from .models.audit import AuditLog as AuditLogModel
 from backend.crud.audit_logs import create_log # Import CRUD
 
 log_entry = await create_log(
 db=async_db_session,
 action="test_action",
 user_id=test_user.id,
 details={"key": "value"}
 )
 return log_entry


@pytest_asyncio.fixture
async def test_comment_entry(async_db_session: AsyncSession, test_task: Task, test_user: UserModel): # Make async
 """Fixture to create a comment entry."""
 from .models.comment import Comment as CommentModel
 from backend.crud.comments import create_comment # Import CRUD

 comment_data = CommentCreate(
 task_id=test_task.id,
 user_id=test_user.id,
 content="Test comment content"
 )

 db_comment = await create_comment(db=async_db_session, comment=comment_data)
 return db_comment


@pytest_asyncio.fixture
async def test_agent_crud(async_db_session: AsyncSession): # Make async
 """Fixture providing agent CRUD instance with async session."""
 from backend.crud.agents import AgentCRUD # Import CRUD class
 return AgentCRUD(async_db_session)




 from backend.crud.agents import AgentCRUD # Import CRUD class
 return AgentCRUD(async_db_session)







