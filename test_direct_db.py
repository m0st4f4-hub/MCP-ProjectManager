#!/usr/bin/env python3
"""
Simplified script to test database connection.
"""
import os
import sys
import sqlite3

# Database path
DB_PATH = "D:/mcp/task-manager/sql_app.db"

def test_direct_connection():
    """Test direct connection to SQLite"""
    try:
        print(f"Connecting to database at: {DB_PATH}")
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Test a simple query
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        print("Connected to database successfully!")
        print(f"Tables found: {', '.join(tables)}")
        
        conn.close()
        return True
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return False

if __name__ == "__main__":
    test_direct_connection()
