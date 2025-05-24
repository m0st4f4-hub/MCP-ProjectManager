#!/usr/bin/env python3
"""
Script to fix database schema issues
"""
import sqlite3
import sys
import os

def check_and_fix_database():
    """Check current database schema and fix missing columns"""
    db_path = "D:/mcp/task-manager/sql_app.db"
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return False
    
    print(f"Connecting to database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check current schema
        print("\n=== CHECKING CURRENT SCHEMA ===")
        
        # Check projects table
        print("\nProjects table columns:")
        cursor.execute("PRAGMA table_info(projects)")
        projects_columns = cursor.fetchall()
        project_column_names = [col[1] for col in projects_columns]
        for col in projects_columns:
            print(f"  {col[1]} ({col[2]}) - nullable: {not col[3]}")
        
        # Check tasks table
        print("\nTasks table columns:")
        cursor.execute("PRAGMA table_info(tasks)")
        tasks_columns = cursor.fetchall()
        task_column_names = [col[1] for col in tasks_columns]
        for col in tasks_columns:
            print(f"  {col[1]} ({col[2]}) - nullable: {not col[3]}")
        
        # Check for missing columns and fix them
        print("\n=== FIXING MISSING COLUMNS ===")
        changes_made = False
        
        # Fix projects table - add task_count if missing
        if 'task_count' not in project_column_names:
            print("Adding task_count column to projects table...")
            cursor.execute("ALTER TABLE projects ADD COLUMN task_count INTEGER DEFAULT 0")
            changes_made = True
            print("✓ Added task_count column")
        else:
            print("✓ task_count column already exists in projects")
        
        # Fix tasks table - add task_number if missing
        if 'task_number' not in task_column_names:
            print("Adding task_number column to tasks table...")
            
            # First, add the column as nullable
            cursor.execute("ALTER TABLE tasks ADD COLUMN task_number INTEGER")
            
            # Get all distinct project_ids
            cursor.execute("SELECT DISTINCT project_id FROM tasks ORDER BY project_id")
            project_ids = [row[0] for row in cursor.fetchall()]
            
            # Assign sequential task numbers per project
            for project_id in project_ids:
                print(f"  Assigning task numbers for project: {project_id}")
                cursor.execute("""
                    SELECT id, created_at FROM tasks 
                    WHERE project_id = ? 
                    ORDER BY created_at, id
                """, (project_id,))
                tasks = cursor.fetchall()
                
                for idx, (task_id, _) in enumerate(tasks, 1):
                    cursor.execute("""
                        UPDATE tasks SET task_number = ? WHERE id = ?
                    """, (idx, task_id))
                    print(f"    Task {task_id} -> task_number {idx}")
            
            changes_made = True
            print("✓ Added task_number column and populated values")
        else:
            print("✓ task_number column already exists in tasks")
        
        if changes_made:
            conn.commit()
            print("\n✅ Database schema updated successfully!")
        else:
            print("\n✅ Database schema is already up to date!")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def main():
    """Main function"""
    print("Database Schema Fix Tool")
    print("=" * 50)
    
    success = check_and_fix_database()
    
    if success:
        print("\n🎉 Database fix completed!")
        print("You can now restart the backend server.")
    else:
        print("\n💥 Database fix failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
