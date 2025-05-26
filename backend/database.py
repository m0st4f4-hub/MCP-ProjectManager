"""
Database configuration and session management.

This module sets up the SQLAlchemy engine and session factory.
It also provides a dependency to get a database session.
"""

import os
import uuid
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv

# Determine the database URL based on the environment
# In a real application, this would be more sophisticated (e.g., using Pydantic Settings)

# Database URL from environment variable or default
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite+aiosqlite:///./sql_app.db")

# Create an async SQLAlchemy engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Create an async sessionmaker
AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

# Dependency to get DB session
async def get_db():
    async with AsyncSessionLocal() as db:
        try:
            print("[get_db] Creating database session...")
            await db.begin()
            print("[get_db] Yielding database session...")
            yield db
        finally:
            print("[get_db] Closing database session...")
            await db.close()
