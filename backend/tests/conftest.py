# Task ID: 211
# Agent Role: BuilderAgent
# Request ID: (Inherited from Overmind)
# Project: project-manager
# Timestamp: 2025-05-09T20:35:00Z

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient # Older way, httpx.AsyncClient is preferred for async
import httpx # For async testing
import asyncio

# Adjust imports to match the project structure
# Assuming 'backend.database', 'backend.models', 'backend.main' are correct relative to project root
# If running pytest from the 'backend' directory, direct imports might work,
# but for robustness if running from root, explicit relative from project might be better.
# For now, assuming pytest runs from 'backend' or paths are adjusted.
from ..database import Base, get_db # Relative import from parent directory
from ..main import app # Relative import for the FastAPI app
from ..models import Project, Agent, Task # Import models to ensure they are known to Base

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db_engine():
    # Create tables for the in-memory database
    Base.metadata.create_all(bind=engine)
    yield engine
    # Optional: Drop tables after tests if needed, though in-memory db is ephemeral
    # Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db_engine):
    """Create a new database session for a test."""
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session  # use the session in tests: `db_session.add(...)`

    session.close()
    transaction.rollback() # Rollback to ensure test isolation
    connection.close()

# Override the get_db dependency for testing
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Asynchronous client fixture
@pytest.fixture(scope="module")
async def async_client():
    # Reset dependency overrides for each module if necessary, or ensure it's set once
    app.dependency_overrides[get_db] = override_get_db
    async with httpx.AsyncClient(app=app, base_url="http://test") as client:
        yield client

# If you still need TestClient for some synchronous tests (though httpx.AsyncClient is preferred for FastAPI)
@pytest.fixture(scope="module")
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c 