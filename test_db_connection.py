#!/usr/bin/env python3
"""
Script to test database connection from the backend.
"""
import os
import sys

# Add backend directory to path
backend_dir = "D:/mcp/task-manager/backend"
sys.path.insert(0, os.path.abspath(backend_dir))
sys.path.insert(0, os.path.abspath(os.path.join(backend_dir, '..')))

def test_database_connection():
    """Test the database connection from the backend"""
    try:
        # Import the database module
        from backend.database import get_db, Base, engine
        from sqlalchemy import text
        
        # Create generator
        db_gen = get_db()
        
        # Get the next item from the generator (the database session)
        db = next(db_gen)
        
        # Test a simple query using SQLAlchemy's text()
        result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        tables = [row[0] for row in result]
        
        print("Connected to database successfully!")
        print(f"Tables found: {', '.join(tables)}")
        
        # Close the database session
        try:
            db_gen.close()
        except:
            pass
        
        return True
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return False

if __name__ == "__main__":
    test_database_connection()
