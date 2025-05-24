#!/usr/bin/env python3
"""
Script to verify database schema.
"""
import os
import sys
import sqlite3

# Configuration
DB_PATH = "D:/mcp/task-manager/sql_app.db"

def verify_database():
    """Verify the database schema"""
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return False
    
    print(f"Connecting to database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Get list of tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = cursor.fetchall()
        
        print("\nDatabase Tables:")
        for table in tables:
            table_name = table[0]
            print(f"- {table_name}")
            
            # Get table schema
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            
            for col in columns:
                col_id, col_name, col_type, not_null, default_val, pk = col
                print(f"  - {col_name} ({col_type})" + 
                      f"{' NOT NULL' if not_null else ''}" +
                      f"{' DEFAULT ' + str(default_val) if default_val is not None else ''}" +
                      f"{' PRIMARY KEY' if pk else ''}")
            
            print("")
        
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    verify_database()
