"""
Database configuration and session management.

This module sets up the SQLAlchemy engine and session factory.
It also provides a dependency to get a database session.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from backend.config.app_config import settings # Import settings

# --- SQLite Configuration (Default) ---
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///../sql_app.db") # Use os.getenv or default
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={
        "check_same_thread": False}  # Needed only for SQLite
)
# --- End SQLite Configuration ---


# --- PostgreSQL Configuration (Optional - Uncomment to use) ---
# DATABASE_USER = os.getenv("DATABASE_USER", "user")
# DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD", "password")
# DATABASE_HOST = os.getenv("DATABASE_HOST", "localhost")
# DATABASE_PORT = os.getenv("DATABASE_PORT", "5432")
# DATABASE_NAME = os.getenv("DATABASE_NAME", "taskdb")
# SQLALCHEMY_DATABASE_URL = f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"
# engine = create_engine(SQLALCHEMY_DATABASE_URL)
# --- End PostgreSQL Configuration ---


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session


def get_db():
    print("[get_db] Creating database session...")
    db = SessionLocal()
    try:
        print("[get_db] Yielding database session...")
        yield db
    finally:
        print("[get_db] Closing database session...")
        db.close()
