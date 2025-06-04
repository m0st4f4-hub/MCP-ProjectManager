#!/usr/bin/env python3
"""
Debug script to check what tables are being created in the test database.
"""
import asyncio
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine
from backend.database import Base
from backend import models  # Import all models

async def debug_tables():
    """Check what tables would be created."""
    print("=== Model Metadata Inspection ===")
    print(f"Base metadata tables: {list(Base.metadata.tables.keys())}")
    
    print("\n=== Creating Test Database ===")
    TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
    test_engine = create_async_engine(TEST_DATABASE_URL, echo=True)
    
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # Check what tables were actually created
        tables_result = await conn.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in tables_result.fetchall()]
        print(f"\nActual tables created: {tables}")
    
    await test_engine.dispose()

if __name__ == "__main__":
    asyncio.run(debug_tables())
