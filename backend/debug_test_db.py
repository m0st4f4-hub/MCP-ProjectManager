#!/usr/bin/env python3
"""
Debug script to replicate test database creation exactly like conftest.py
"""
import asyncio
import sys
import os

# Add backend to path exactly like in conftest.py
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from backend.database import Base
from backend import models  # Import all models

async def debug_test_db():
    """Replicate test database creation from conftest.py exactly."""
    print("=== Test Database Creation Debug ===")
    
    # Same URL as conftest.py
    TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
    
    # Same engine creation as conftest.py
    test_engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=True,  # Enable echo to see SQL
        future=True,
        pool_pre_ping=True
    )
    
    print(f"Available tables in metadata: {list(Base.metadata.tables.keys())}")
    
    # Same table creation as conftest.py
    async with test_engine.begin() as conn:
        print("\n=== Creating tables ===")
        await conn.run_sync(Base.metadata.create_all)
        
        print("\n=== Checking created tables ===")
        # Check what tables were actually created
        tables_result = await conn.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in tables_result.fetchall()]
        print(f"Actual tables created: {tables}")
        
        if 'tasks' in tables:
            print("\n✅ Tasks table was created successfully!")
            # Check the schema
            schema_result = await conn.execute("PRAGMA table_info(tasks);")
            schema = schema_result.fetchall()
            print("Tasks table schema:")
            for column in schema:
                print(f"  {column}")
        else:
            print("\n❌ Tasks table was NOT created!")
    
    await test_engine.dispose()

if __name__ == "__main__":
    asyncio.run(debug_test_db())
