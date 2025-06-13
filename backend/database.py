"""
Database configuration and session management.
Following FastAPI SQL (Relational) Databases tutorial patterns.
"""

import os
import logging
from pathlib import Path
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
    AsyncEngine
)
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import StaticPool
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load environment variables
backend_dir = Path(__file__).resolve().parent
env_path = backend_dir / ".env"
load_dotenv(env_path)

# Database configuration
DATABASE_URL = os.environ.get(
    "DATABASE_URL", 
    f"sqlite+aiosqlite:///{backend_dir / 'sql_app.db'}"
)

# Connection configuration based on database type
if DATABASE_URL.startswith("sqlite"):
    # SQLite-specific configuration
    engine_kwargs = {
        "echo": False,
        "poolclass": StaticPool,
        "connect_args": {
            "check_same_thread": False,
        },
    }
else:
    # PostgreSQL/other database configuration
    engine_kwargs = {
        "echo": False,
        "pool_size": int(os.getenv("DB_POOL_SIZE", "5")),
        "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", "10")),
        "pool_timeout": int(os.getenv("DB_POOL_TIMEOUT", "30")),
        "pool_recycle": int(os.getenv("DB_POOL_RECYCLE", "1800")),
        "pool_pre_ping": os.getenv("DB_POOL_PRE_PING", "true").lower() == "true",
    }

# Create async engine
engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    **engine_kwargs
)

# Create async session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Create declarative base
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Database session dependency for FastAPI.
    
    Provides an async database session that automatically handles:
    - Session creation and cleanup
    - Transaction management
    - Error handling
    
    Usage:
        @app.get("/items/")
        async def read_items(db: AsyncSession = Depends(get_db)):
            # Use db session here
            pass
    """
    async with async_session_maker() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"Database session error: {e}")
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize database tables.
    
    Creates all tables defined in the Base metadata.
    Should be called during application startup.
    """
    async with engine.begin() as conn:
        # Import all models to register them with Base
        import models  # noqa: F401
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Database tables initialized")


async def close_db() -> None:
    """
    Close database connections.
    
    Should be called during application shutdown.
    """
    await engine.dispose()
    logger.info("Database connections closed")


# Test database configuration for testing
TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    f"sqlite+aiosqlite:///{backend_dir / 'test.db'}"
)

# Test engine for testing purposes
test_engine: AsyncEngine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    poolclass=StaticPool,
    connect_args={"check_same_thread": False},
)

# Test session factory
test_async_session_maker = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def get_test_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Test database session dependency.
    
    Used in testing to provide isolated database sessions.
    """
    async with test_async_session_maker() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"Test database session error: {e}")
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_test_db() -> None:
    """Initialize test database tables."""
    async with test_engine.begin() as conn:
        import models  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)


async def cleanup_test_db() -> None:
    """Clean up test database."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()