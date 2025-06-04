"""
Database configuration and session management.

This module sets up the SQLAlchemy engine and session factory.
It also provides a dependency to get a database session.
"""

import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy import create_engine

# Database URL
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite+aiosqlite:///./sql_app.db")

# For sync operations, convert the async URL to sync
SYNC_DATABASE_URL = DATABASE_URL.replace("sqlite+aiosqlite://", "sqlite:///")

# Create an async SQLAlchemy engine
engine = create_async_engine(DATABASE_URL, echo=False)

# Create a sync SQLAlchemy engine
sync_engine = create_engine(SYNC_DATABASE_URL, echo=False)

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
