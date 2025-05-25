"""
Common test fixtures for unit tests.
"""
import os
import sys
import pytest
# from sqlalchemy import create_engine # Remove synchronous engine import
# from sqlalchemy.orm import sessionmaker, Session # Remove synchronous session imports
from sqlalchemy.pool import StaticPool
from httpx import AsyncClient
import pytest_asyncio
from fastapi import FastAPI, Depends
from jose import jwt
from datetime import datetime, timedelta
from backend.database import get_db
from backend.auth import get_current_active_user
from backend.models import User as UserModel
from backend.schemas.user import User

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

# Import async database components
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession # Import async components

# Import sessionmaker
from sqlalchemy.orm import sessionmaker # Import sessionmaker

# Create an in-memory SQLite database for testing
TEST_SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:" # Use aiosqlite for async

# Set dummy environment variables for testing security
os.environ["SECRET_KEY"] = "dummysecretkeyforenv"
os.environ["ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"

# Remove synchronous engine fixture
# @pytest.fixture(scope="session")
# def engine():
#     """Create a SQLAlchemy engine for testing."""
#     engine = create_engine(
#         TEST_SQLALCHEMY_DATABASE_URL,
#         connect_args={"check_same_thread": False},
#         poolclass=StaticPool,  # Use StaticPool for in-memory testing
#     )
#     yield engine
#     Base.metadata.drop_all(bind=engine, checkfirst=True)

# Remove synchronous db_session fixture
# @pytest.fixture
# def db_session(engine):
#     """Create a SQLAlchemy session for testing.
# 
#     Uses a transaction which is rolled back after each test.
#     """
#     # connect to the database
#     connection = engine.connect()
#
#     # begin a non-ORM transaction
#     transaction = connection.begin()
#
#     # create a Session bound to the connection.
#     TestingSessionLocal = sessionmaker(bind=connection)
#     session = TestingSessionLocal()
#
#     # Drop and create all tables for a clean state before each test
#     Base.metadata.drop_all(bind=engine, checkfirst=True)
#     Base.metadata.create_all(bind=engine, checkfirst=True)
#
#     try:
#         yield session
#     finally:
#         # rollback the transaction
#         transaction.rollback()
#         connection.close()


@pytest_asyncio.fixture(scope="module")
async def async_db_session():
    """Create an asynchronous SQLAlchemy session for testing."""
    # from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession # Import async components - already imported above
    
    async_engine = create_async_engine(
        TEST_SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Create tables before the session starts
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Create an async session bound to the connection
    AsyncTestingSessionLocal = sessionmaker(
        bind=async_engine, class_=AsyncSession, expire_on_commit=False
    )
    
    # Use a single async with block for the session lifespan
    async with AsyncTestingSessionLocal() as session:
        try:
            yield session
        finally:
            # Teardown: drop tables and dispose engine
            # Ensure session is closed before dropping tables/disposing engine
            await session.close()
            async with async_engine.begin() as conn:
                 await conn.run_sync(Base.metadata.drop_all)
            await async_engine.dispose() # Dispose the engine to release resources


@pytest_asyncio.fixture(scope="module")
async def async_client(async_db_session: AsyncSession): # Add type hint
    """Provides an asynchronous test client for the FastAPI application.
    
    This client can be used to make requests to the application during testing.
    """
    print("[ASYNC CLIENT DEBUG] Creating async client...") # Debug print
    # Create a new FastAPI instance and include routers directly
    test_app = FastAPI()

    # Override get_db dependency to use the test session
    async def override_get_db():
        print("[ASYNC CLIENT DEBUG] Overriding get_db dependency.") # Debug print
        yield async_db_session

    test_app.dependency_overrides[get_db] = override_get_db

    # Explicitly include all routers
    from backend.routers import ( # Import routers
        mcp,
        projects,
        agents,
        audit_logs,
        memory,
        rules,
        tasks,
        users,
    )
    
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

    # Add temporary auth test endpoint
    from fastapi import Depends # Import Depends
    from backend.auth import get_current_active_user # Import dependency
    from backend.schemas.user import User as UserSchema # Import schema

    @test_app.get("/test-auth", response_model=UserSchema)
    async def test_auth_endpoint(current_user: UserSchema = Depends(get_current_active_user)):
        return current_user

    # Generate a real JWT for username 'testuser'
    from backend.config import SECRET_KEY, ALGORITHM # Import from config
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": "testuser", "exp": expire}
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    headers = {"Authorization": f"Bearer {token}"}

    async with AsyncClient(app=test_app, base_url="http://testserver", headers=headers) as client:
        yield client


@pytest_asyncio.fixture(scope="module")
async def test_user(async_db_session: AsyncSession): # Add type hint
    """Create a test user with ADMIN role in the async db session."""
    print("[TEST USER DEBUG] Creating test user...") # Debug print
    from backend.models.user import UserRole
    from backend.enums import UserRoleEnum
    user = User(
        username="testuser",
        hashed_password="hashed_password_for_test",
        email="test@example.com",
        full_name="Test User",
        disabled=False
    )
    async_db_session.add(user)
    await async_db_session.commit()
    await async_db_session.refresh(user)
    print(f"[TEST USER DEBUG] Created user with ID: {user.id}") # Debug print
    # Assign ADMIN role
    admin_role = UserRole(user_id=user.id, role_name=UserRoleEnum.ADMIN)
    async_db_session.add(admin_role)
    await async_db_session.commit()
    # No need to refresh user again here as we only modified user_roles
    print(f"[TEST USER DEBUG] Assigned ADMIN role to user {user.username}") # Debug print
    return user

# Convert synchronous helper fixtures to async
@pytest_asyncio.fixture
async def test_project(async_db_session: AsyncSession, test_user: UserModel): # Make async, use async_db_session
    """Create a test project."""
    print("[TEST PROJECT DEBUG] Creating test project...") # Debug print
    project = Project(
        name="Test Project",
        description="A test project for unit tests",
        task_count=0,
        is_archived=False,
        created_by_id=test_user.id # Assign created_by_id
    )
    async_db_session.add(project)
    await async_db_session.commit()
    await async_db_session.refresh(project)
    print(f"[TEST PROJECT DEBUG] Created project with ID: {project.id}") # Debug print
    return project

@pytest_asyncio.fixture
async def test_agent(async_db_session: AsyncSession): # Make async, use async_db_session
    """Create a test agent."""
    print("[TEST AGENT DEBUG] Creating test agent...") # Debug print
    agent = Agent(
        name="Test Agent",
        is_archived=False
    )
    async_db_session.add(agent)
    await async_db_session.commit()
    await async_db_session.refresh(agent)
    print(f"[TEST AGENT DEBUG] Created agent with ID: {agent.id}") # Debug print
    return agent

@pytest_asyncio.fixture
async def test_task(async_db_session: AsyncSession, test_project: Project): # Make async, use async_db_session
    """Create a test task."""
    print("[TEST TASK DEBUG] Creating test task...") # Debug print
    from backend.enums import TaskStatusEnum
    
    task = Task(
        project_id=test_project.id,
        task_number=1,
        title="Test Task",
        description="A test task for unit tests",
        status=TaskStatusEnum.TO_DO,
        is_archived=False
    )
    async_db_session.add(task)
    await async_db_session.commit()
    await async_db_session.refresh(task)
    print(f"[TEST TASK DEBUG] Created task with ID: {task.id} and number {task.task_number}") # Debug print
    return task

@pytest_asyncio.fixture
async def test_comment(async_db_session: AsyncSession, test_task: Task, test_user: UserModel): # Make async, use async_db_session
    """Create a test comment."""
    print("[TEST COMMENT DEBUG] Creating test comment...") # Debug print
    comment = Comment(
        task_project_id=test_task.project_id,
        task_task_number=test_task.task_number,
        user_id=test_user.id, # Assign user_id
        content="This is a test comment."
    )
    async_db_session.add(comment)
    await async_db_session.commit()
    await async_db_session.refresh(comment)
    print(f"[TEST COMMENT DEBUG] Created comment with ID: {comment.id}") # Debug print
    return comment

# Convert synchronous helper functions to async
async def create_test_project(db: AsyncSession, name: str, description: str, created_by_id: str): # Make async
    project = Project(
        name=name,
        description=description,
        task_count=0,
        is_archived=False,
        created_by_id=created_by_id
    )
    db.add(project)
    await db.commit() # Use await db.commit()
    await db.refresh(project) # Use await db.refresh()
    return project

async def create_test_task(db: AsyncSession, project_id: str, task_number: int, title: str, description: str): # Make async
     from backend.enums import TaskStatusEnum

     task = Task(
        project_id=project_id,
        task_number=task_number,
        title=title,
        description=description,
        status=TaskStatusEnum.TO_DO,
        is_archived=False
    )
     db.add(task)
     await db.commit() # Use await db.commit()
     await db.refresh(task) # Use await db.refresh()
     return task

# Remove or convert synchronous CRUD test files
# Convert test_project_file_associations_crud.py to async
@pytest_asyncio.fixture
async def test_project_file_association(async_db_session: AsyncSession, test_project: Project): # Make async
    print("[TEST PROJECT FILE ASSOC DEBUG] Creating test project file association...")
    from backend.models import ProjectFileAssociation
    assoc = ProjectFileAssociation(
        project_id=test_project.id,
        file_path="/test/path/to/file.txt",
        description="Test file association",
    )
    async_db_session.add(assoc)
    await async_db_session.commit()
    await async_db_session.refresh(assoc)
    print(f"[TEST PROJECT FILE ASSOC DEBUG] Created association with ID: {assoc.id}")
    return assoc


# Convert test_task_file_associations_crud.py to async
@pytest_asyncio.fixture
async def test_task_file_association(async_db_session: AsyncSession, test_task: Task): # Make async
    print("[TEST TASK FILE ASSOC DEBUG] Creating test task file association...")
    from backend.models import TaskFileAssociation
    assoc = TaskFileAssociation(
        task_project_id=test_task.project_id,
        task_task_number=test_task.task_number,
        file_path="/test/path/to/task_file.txt",
        description="Test task file association",
    )
    async_db_session.add(assoc)
    await async_db_session.commit()
    await async_db_session.refresh(assoc)
    print(f"[TEST TASK FILE ASSOC DEBUG] Created association with ID: {assoc.id}")
    return assoc


# Convert test_task_dependencies_crud.py to async
@pytest_asyncio.fixture
async def test_task_dependency(async_db_session: AsyncSession, test_task: Task): # Make async
    print("[TEST TASK DEPENDENCY DEBUG] Creating test task dependency...")
    from backend.models import TaskDependency
    # Need two tasks to create a dependency
    # Assuming test_task is task 1
    # Create task 2
    from backend.crud.tasks import create_task # Import async create_task
    from backend.schemas.task import TaskCreate # Import schema
    task2 = await create_task(
        db=async_db_session,
        task=TaskCreate(
            project_id=test_task.project_id,
            title="Task 2 for Dependency",
            description="...",
            status="To Do" # Use a valid status
        )
    )
    # db.commit and refresh are done inside create_task

    dependency = TaskDependency(
        project_id=test_task.project_id,
        dependent_task_number=test_task.task_number,
        dependency_task_number=task2.task_number,
    )
    async_db_session.add(dependency)
    await async_db_session.commit()
    await async_db_session.refresh(dependency)
    print(f"[TEST TASK DEPENDENCY DEBUG] Created dependency with ID: {dependency.id}")
    return dependency


# Convert test_audit_logs_crud.py to async
@pytest_asyncio.fixture
async def test_audit_log_entry(async_db_session: AsyncSession, test_user: UserModel): # Make async
    print("[TEST AUDIT LOG DEBUG] Creating test audit log entry...")
    from backend.models import AuditLog
    from backend.enums import AuditLogAction
    entry = AuditLog(
        action=AuditLogAction.USER_LOGIN,
        user_id=test_user.id,
        details={"ip": "127.0.0.1"},
        entity_type="user", # Assuming these are required
        entity_id=str(test_user.id), # Assuming these are required
    )
    async_db_session.add(entry)
    await async_db_session.commit()
    await async_db_session.refresh(entry)
    print(f"[TEST AUDIT LOG DEBUG] Created entry with ID: {entry.id}")
    return entry


# Convert test_comments_crud.py to async
@pytest_asyncio.fixture
async def test_comment_entry(async_db_session: AsyncSession, test_task: Task, test_user: UserModel): # Make async
    print("[TEST COMMENT DEBUG] Creating test comment entry...")
    from backend.models import Comment
    entry = Comment(
        task_project_id=test_task.project_id,
        task_task_number=test_task.task_number,
        user_id=test_user.id,
        content="Test comment content."
    )
    async_db_session.add(entry)
    await async_db_session.commit()
    await async_db_session.refresh(entry)
    print(f"[TEST COMMENT DEBUG] Created comment entry with ID: {entry.id}")
    return entry


# Convert test_agents_crud.py to async
@pytest_asyncio.fixture
async def test_agent_crud(async_db_session: AsyncSession): # Make async
     print("[TEST AGENT CRUD DEBUG] Creating test agent for CRUD...")
     from backend.models import Agent
     agent = Agent(
         name="CRUD Test Agent",
         is_archived=False
     )
     async_db_session.add(agent)
     await async_db_session.commit()
     await async_db_session.refresh(agent)
     print(f"[TEST AGENT CRUD DEBUG] Created agent with ID: {agent.id}")
     return agent

# No need to convert test_diagnostic.py or test_task_dependency_validation.py here,
# they will be addressed separately if needed. This file is for conftest fixtures.

# @pytest_asyncio.fixture # Removed synchronous fixture
# def fastapi_app(db_session: Session): # Removed synchronous dependency
#     """Create a FastAPI app instance for testing with a synchronous session."""
#     # This synchronous fixture is being replaced by async_client
#     pass


# async def create_test_user(db: AsyncSession): # Make async
#     """Helper function to create a test user."""
#     print("[HELPER DEBUG] Creating test user...") # Debug print
#     from backend.models.user import UserRole
#     from backend.enums import UserRoleEnum
#     user = User(
#         username="testuser_helper",
#         hashed_password="hashed_password_for_test_helper",
#         email="test_helper@example.com",
#         full_name="Test User Helper",
#         disabled=False
#     )
#     db.add(user)
#     await db.commit()
#     await db.refresh(user)
#     print(f"[HELPER DEBUG] Created user with ID: {user.id}") # Debug print
#     # Assign ADMIN role
#     admin_role = UserRole(user_id=user.id, role_name=UserRoleEnum.ADMIN)
#     db.add(admin_role)
#     await db.commit()
#     print(f"[HELPER DEBUG] Assigned ADMIN role to user {user.username}") # Debug print
#     return user


# async def create_test_project(db: AsyncSession, name: str, description: str, created_by_id: str): # Make async
#     """Helper function to create a test project."""
#     print("[HELPER DEBUG] Creating test project...") # Debug print
#     project = Project(
#         name=name,
#         description=description,
#         task_count=0,
#         is_archived=False,
#         created_by_id=created_by_id
#     )
#     db.add(project)
#     await db.commit()
#     await db.refresh(project)
#     print(f"[HELPER DEBUG] Created project with ID: {project.id}") # Debug print
#     return project


# async def create_test_agent(db: AsyncSession, name: str): # Make async
#      print("[HELPER DEBUG] Creating test agent...") # Debug print
#      agent = Agent(
#          name=name,
#          is_archived=False
#      )
#      db.add(agent)
#      await db.commit()
#      await db.refresh(agent)
#      print(f"[HELPER DEBUG] Created agent with ID: {agent.id}") # Debug print
#      return agent


# async def create_test_task(db: AsyncSession, project_id: str, title: str, description: str, status: str = "To Do", is_archived: bool = False, agent_id: Optional[str] = None): # Make async
#     """Helper function to create a test task."""
#     print("[HELPER DEBUG] Creating test task...") # Debug print
#     from backend.enums import TaskStatusEnum
#     task = Task(
#         project_id=project_id,
#         task_number=1, # Assuming task_number generation is handled elsewhere or is simple for tests
#         title=title,
#         description=description,
#         status=TaskStatusEnum(status), # Use enum
#         is_archived=is_archived,
#         agent_id=agent_id
#     )
#     db.add(task)
#     await db.commit()
#     await db.refresh(task)
#     print(f"[HELPER DEBUG] Created task with ID: {task.id} and number {task.task_number}") # Debug print
#     return task

# Removed synchronous test files from conftest as they are being converted or are not fixtures
# from .test_project_file_associations_crud import *
# from .test_task_file_associations_crud import *
# from .test_task_dependencies_crud import *
# from .test_audit_logs_crud import *
# from .test_comments_crud import *
# from .test_agents_crud import *
