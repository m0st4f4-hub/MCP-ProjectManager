import pytest
import pytest_asyncio
import httpx
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from fastapi import FastAPI
from httpx import ASGITransport
from typing import AsyncGenerator, Generator, Optional

# Crucial: Ensure ALL models are imported here so Base.metadata is complete
# These imports must happen before Base.metadata.create_all() is called.
# Adjust path if necessary for your project structure
from ..database import Base, get_db
from ..main import app as main_fastapi_app  # Your FastAPI app instance
# Models are imported in setup_database to ensure Base.metadata is populated before create_all
# from ..models import Project, Agent, Task, Subtask # Keep this commented or remove

# Helper functions moved from test_main_api.py
# These can be used by tests in this directory and subdirectories.
# Ensure necessary imports like crud and schemas are correct relative to THIS file (conftest.py)
# If crud and schemas are in the parent of 'tests', then 'from .. import crud, schemas' is correct.

from .. import schemas  # Import schemas
from ..services.project_service import ProjectService  # Import ProjectService
from ..services.agent_service import AgentService  # Import AgentService


def create_test_project(db: Session, name: str = "Test Project", description: str = "Test Description"):
    # from .. import crud, schemas # These are in the 'backend' directory, one level up from 'tests'
    project_schema = schemas.ProjectCreate(name=name, description=description)
    # Use ProjectService to create the project
    project_service = ProjectService(db)
    return project_service.create_project(project=project_schema)


def create_test_agent(db: Session, name: str = "Test Agent", role: str = "Test Role", project_id: Optional[str] = None):
    # from .. import crud, schemas # These are in the 'backend' directory, one level up from 'tests'
    if project_id is None:
        # Create a default project if none provided for the agent
        default_project = create_test_project(
            db, name=f"Default Project for {name}")
        project_id = str(default_project.id)
    agent_schema = schemas.AgentCreate(
        name=name, role=role, project_id=project_id)
    # Use AgentService to create the agent
    agent_service = AgentService(db)
    return agent_service.create_agent(agent=agent_schema)


# Define a single source of truth for the test database URL and engine
SQLALCHEMY_DATABASE_URL_TEST = "sqlite:///:memory:"


@pytest.fixture(scope="session")
def test_engine():
    return create_engine(
        SQLALCHEMY_DATABASE_URL_TEST,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )


@pytest.fixture(scope="session")
def TestingSessionLocal(test_engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function", autouse=True)
def setup_database(test_engine):
    from .. import models  # Ensure all models are imported
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)  # Clean up after session


@pytest.fixture(scope="session")
def fastapi_app() -> FastAPI:
    return main_fastapi_app

# This fixture provides the session for tests to interact with the DB directly


@pytest.fixture(scope="function")
def db_session(test_engine, TestingSessionLocal, setup_database) -> Generator[Session, None, None]:
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()

# This is the dependency that will be injected into the app routes


def override_get_db_for_app(TestingSessionLocal_for_override: sessionmaker) -> Generator[Session, None, None]:
    db = TestingSessionLocal_for_override()  # Create a new session
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def apply_db_override(fastapi_app: FastAPI, TestingSessionLocal):
    # Curry the TestingSessionLocal into the override function
    # Note: This makes override_get_db_for_app effectively use the session-scoped TestingSessionLocal
    # which means all requests within the app during the test session will share this factory,
    # but each request will get its own session from it due to how FastAPI Depends works.
    def get_db_override_with_session_factory():
        # Pass the factory
        yield from override_get_db_for_app(TestingSessionLocal)

    fastapi_app.dependency_overrides[get_db] = get_db_override_with_session_factory
    yield
    fastapi_app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="session")
async def async_client(fastapi_app: FastAPI, apply_db_override) -> AsyncGenerator[httpx.AsyncClient, None]:
    async with httpx.AsyncClient(transport=ASGITransport(app=fastapi_app), base_url="http://test") as client:
        yield client

# Synchronous client fixture (if still needed for any non-async tests, though likely not for this project)
# @pytest.fixture(scope="session")
# def client(fastapi_app: FastAPI, override_get_db_dependency):
#     with TestClient(fastapi_app) as c:
#         yield c
