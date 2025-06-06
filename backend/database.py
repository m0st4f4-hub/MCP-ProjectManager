"""
Database configuration and session management.

This module sets up the SQLAlchemy engine and session factory.
It also provides a dependency to get a database session.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine

# Load environment variables from backend/.env if present
backend_dir = Path(__file__).resolve().parent
env_path = backend_dir / ".env"
load_dotenv(env_path)

# Database URL
DATABASE_URL = os.environ.get(
    "DATABASE_URL", f"sqlite+aiosqlite:///{backend_dir / 'sql_app.db'}"
)

# For sync operations, convert the async URL to sync
SYNC_DATABASE_URL = DATABASE_URL.replace("sqlite+aiosqlite://", "sqlite:///")

# Connection pool settings
POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "5"))
MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "10"))
POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30"))
POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "1800"))
PRE_PING = os.getenv("DB_POOL_PRE_PING", "true").lower() in {"1", "true", "yes"}

# Create SQLAlchemy engines with pooling for non-SQLite databases
if DATABASE_URL.startswith("sqlite"):
    engine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=PRE_PING)
    sync_engine = create_engine(SYNC_DATABASE_URL, echo=False, pool_pre_ping=PRE_PING)
else:
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        pool_size=POOL_SIZE,
        max_overflow=MAX_OVERFLOW,
        pool_timeout=POOL_TIMEOUT,
        pool_recycle=POOL_RECYCLE,
        pool_pre_ping=PRE_PING,
    )
    sync_engine = create_engine(
        SYNC_DATABASE_URL,
        echo=False,
        pool_size=POOL_SIZE,
        max_overflow=MAX_OVERFLOW,
        pool_timeout=POOL_TIMEOUT,
        pool_recycle=POOL_RECYCLE,
        pool_pre_ping=PRE_PING,
    )

# Create an async sessionmaker
AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Create a sync sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

Base = declarative_base()

# Async dependency to get DB session


async def get_db():
    async with AsyncSessionLocal() as db:
        try:
            await db.begin()
            yield db
        finally:
            await db.close()

# Sync dependency to get DB session


def get_sync_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
