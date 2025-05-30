#!/usr/bin/env python3
"""Quick database check script."""

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base
import models # Import models module to register them

async def check_database():
 """Check database connection and tables."""
 try:
 
 print("Checking database connection...")
 async with engine.begin() as conn:
 await conn.run_sync(Base.metadata.create_all)
 print(" Database tables created/verified")
 
 # List all tables
 def list_tables(connection):
 from sqlalchemy import inspect
 inspector = inspect(connection)
 return inspector.get_table_names()
 
 tables = await conn.run_sync(list_tables)
 print(f"📋 Found {len(tables)} tables:")
 for table in sorted(tables):
 print(f" - {table}")
 
 except Exception as e:
 print(f" Database check failed: {e}")
 return False
 
 return True

if __name__ == "__main__":
 success = asyncio.run(check_database())
 sys.exit(0 if success else 1)
