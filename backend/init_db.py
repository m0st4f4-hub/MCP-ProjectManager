#!/usr/bin/env python3
"""
Database Initialization Script for Task Manager
This script initializes the database with all required tables and basic data.
"""

import asyncio
import sys
from pathlib import Path
from dotenv import load_dotenv

backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
load_dotenv(backend_dir / ".env")

from database import Base, engine

from sqlalchemy.orm import Session
from sqlalchemy import text
import logging  # Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_database():
    """Initialize the database with all tables."""
    logger.info("Starting database initialization...")

    try:  # Create all tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        logger.info("✅ Database tables created successfully")  # Verify database connection and tables
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
            tables = result.fetchall()
            logger.info(f"✅ Created {len(tables)} tables:")
            for table in tables:
                logger.info(f"   - {table[0]}")  # Create basic seed data
        await create_seed_data()

        logger.info("🎉 Database initialization completed successfully!")
        return True

    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        return False

async def create_seed_data():
    """Create basic seed data for the system."""
    logger.info("Creating seed data...")

    from sqlalchemy.ext.asyncio import async_sessionmaker  # Create async session
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:
        try:  # Check if data already exists
            result = await session.execute(text("SELECT COUNT(*) FROM users"))
            user_count = result.scalar()

            if user_count > 0:
                logger.info("Seed data already exists, skipping...")
                return  # Create default admin user
            from models import User
            admin_user = User(
                id="admin-user-001",
                username="admin",
                hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # "secret"
                email="admin@taskmanager.local",
                full_name="System Administrator",
                disabled=False
            )
            session.add(admin_user)  # Create default project
            from models import Project
            default_project = Project(
                id="default-project-001",
                name="Default Project",
                description="Default project for task management",
                task_count=0
            )
            session.add(default_project)  # Create default agent
            from models import Agent
            default_agent = Agent(
                id="default-agent-001",
                name="TaskManager Agent",
                agent_type="system",
                description="Default system agent for task management"
            )
            session.add(default_agent)  # Create sample task statuses
            from models import TaskStatus
            statuses = [
                TaskStatus(id=1, name="To Do", description="Task is pending", order=1, is_final=False),
                TaskStatus(id=2, name="In Progress", description="Task is being worked on", order=2, is_final=False),
                TaskStatus(id=3, name="Blocked", description="Task is blocked", order=3, is_final=False),
                TaskStatus(id=4, name="Completed", description="Task is completed", order=4, is_final=True),
                TaskStatus(id=5, name="Cancelled", description="Task is cancelled", order=5, is_final=True),
                TaskStatus(id=6, name="Context Acquired", description="Agent gathered context", order=6, is_final=False),
                TaskStatus(id=7, name="Planning Complete", description="Planning phase finished", order=7, is_final=False),
                TaskStatus(id=8, name="Execution In Progress", description="Agent executing task", order=8, is_final=False),
                TaskStatus(id=9, name="Pending Verification", description="Awaiting verification", order=9, is_final=False),
                TaskStatus(id=10, name="Verification Complete", description="Verification succeeded", order=10, is_final=False),
                TaskStatus(id=11, name="Verification Failed", description="Verification failed", order=11, is_final=False),
                TaskStatus(id=12, name="Completed Awaiting Project Manager", description="Waiting for PM review", order=12, is_final=True),
                TaskStatus(id=13, name="Completed Handoff", description="Completed with handoff", order=13, is_final=True),
                TaskStatus(id=14, name="Failed", description="Task failed", order=14, is_final=True),
                TaskStatus(id=15, name="In Progress Awaiting Subtask", description="Waiting for subtask", order=15, is_final=False),
                TaskStatus(id=16, name="Pending Recovery Attempt", description="Recovery in progress", order=16, is_final=False),
            ]

            for status in statuses:
                session.add(status)

            await session.commit()
            logger.info("✅ Seed data created successfully")

        except Exception as e:
            await session.rollback()
            logger.error(f"❌ Failed to create seed data: {e}")
            raise

async def verify_database():
    """Verify database integrity and basic operations."""
    logger.info("Verifying database...")

    from sqlalchemy.ext.asyncio import async_sessionmaker
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:
        try:  # Test basic queries
            result = await session.execute(text("SELECT COUNT(*) FROM users"))
            user_count = result.scalar()

            result = await session.execute(text("SELECT COUNT(*) FROM projects"))
            project_count = result.scalar()

            result = await session.execute(text("SELECT COUNT(*) FROM agents"))
            agent_count = result.scalar()

            logger.info(f"✅ Database verification successful:")
            logger.info(f"   - Users: {user_count}")
            logger.info(f"   - Projects: {project_count}")
            logger.info(f"   - Agents: {agent_count}")

            return True

        except Exception as e:
            logger.error(f"❌ Database verification failed: {e}")
            return False

async def main():
    """Main initialization function."""
    print("🔧 Task Manager Database Initialization Script")
    print("=" * 50)  # Initialize database
    success = await init_database()
    if not success:
        sys.exit(1)  # Verify database
    success = await verify_database()
    if not success:
        sys.exit(1)

    print("\n🎉 Database is ready for use!")
    print("You can now start the backend server with:")
    print("   python -m uvicorn main:app --reload")

if __name__ == "__main__":
    asyncio.run(main())
