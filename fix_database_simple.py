#!/usr/bin/env python3
"""
Script to fix database schema issues - Simple version
"""
import sqlite3
import sys
import os

def fix_database():
    """Fix database schema by adding missing columns"""
    db_path = "D:/mcp/task-manager/sql_app.db"
    
    print(f"Connecting to database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Fixing database schema...")
        
        # Add task_count to projects if missing
        try:
            cursor.execute("ALTER TABLE projects ADD COLUMN task_count INTEGER DEFAULT 0")
            print("Added task_count column to projects table")
        except sqlite3.OperationalError as e:
            if "duplicate column" in str(e).lower():
                print("task_count column already exists in projects")
            else:
                raise
        
        # Add task_number to tasks if missing
        try:
            cursor.execute("ALTER TABLE tasks ADD COLUMN task_number INTEGER")
            print("Added task_number column to tasks table")
            
            # Assign sequential task numbers per project
            print("Assigning task numbers...")
            cursor.execute("SELECT DISTINCT project_id FROM tasks ORDER BY project_id")
            project_ids = [row[0] for row in cursor.fetchall()]
            
            for project_id in project_ids:
                print(f"Processing project: {project_id}")
                cursor.execute("""
                    SELECT id FROM tasks 
                    WHERE project_id = ? 
                    ORDER BY created_at, id
                """, (project_id,))
                tasks = cursor.fetchall()
                
                for idx, (task_id,) in enumerate(tasks, 1):
                    cursor.execute("UPDATE tasks SET task_number = ? WHERE id = ?", (idx, task_id))
            
            print("Task numbers assigned")
            
        except sqlite3.OperationalError as e:
            if "duplicate column" in str(e).lower():
                print("task_number column already exists in tasks")
            else:
                raise
        
        conn.commit()
        print("Database schema updated successfully!")
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    print("Database Schema Fix Tool")
    print("=" * 40)
    
    if fix_database():
        print("Database fix completed!")
    else:
        print("Database fix failed!")
        sys.exit(1)
