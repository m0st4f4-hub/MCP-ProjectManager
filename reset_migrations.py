#!/usr/bin/env python3
"""
Script to reset Alembic migrations and create a fresh initial migration.
This will:
1. Remove existing migration files
2. Create a new initial migration
3. Apply the migration to the database
"""
import os
import sys
import shutil
import subprocess
import sqlite3
from datetime import datetime

# Configuration
BACKEND_DIR = "D:/mcp/task-manager/backend"
ALEMBIC_DIR = os.path.join(BACKEND_DIR, "alembic")
VERSIONS_DIR = os.path.join(ALEMBIC_DIR, "versions")
DB_PATH = "D:/mcp/task-manager/sql_app.db"
VENV_PYTHON = os.path.join(BACKEND_DIR, ".venv", "Scripts", "python")
VENV_ALEMBIC = os.path.join(BACKEND_DIR, ".venv", "Scripts", "alembic")

# Check if venv exists
if not os.path.exists(VENV_PYTHON):
    print(f"Python virtual environment not found at: {VENV_PYTHON}")
    VENV_PYTHON = "python"
    VENV_ALEMBIC = "alembic"
    print(f"Using system Python: {VENV_PYTHON}")
else:
    print(f"Using Python from venv: {VENV_PYTHON}")

def backup_database():
    """Create a backup of the database if it exists"""
    if os.path.exists(DB_PATH):
        backup_path = f"{DB_PATH}.bak-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        print(f"Creating database backup: {backup_path}")
        shutil.copy2(DB_PATH, backup_path)
        return backup_path
    return None

def backup_migrations():
    """Create a backup of the existing migrations"""
    if os.path.exists(VERSIONS_DIR):
        backup_dir = f"{VERSIONS_DIR}.bak-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        print(f"Backing up existing migrations to: {backup_dir}")
        shutil.copytree(VERSIONS_DIR, backup_dir)
        return backup_dir
    return None

def clear_migrations():
    """Remove existing migration files"""
    if os.path.exists(VERSIONS_DIR):
        print(f"Clearing migrations from: {VERSIONS_DIR}")
        for file in os.listdir(VERSIONS_DIR):
            if file.endswith('.py') and file != '__init__.py':
                file_path = os.path.join(VERSIONS_DIR, file)
                print(f"  Removing: {file}")
                os.remove(file_path)
    else:
        print("Versions directory not found, creating it")
        os.makedirs(VERSIONS_DIR)
        
    # Create __init__.py if it doesn't exist
    init_file = os.path.join(VERSIONS_DIR, "__init__.py")
    if not os.path.exists(init_file):
        with open(init_file, 'w') as f:
            f.write("# This file is needed for Python package recognition")

def create_new_migration():
    """Create a new initial migration"""
    # Change to backend directory
    os.chdir(BACKEND_DIR)
    
    # Run alembic revision with --autogenerate
    print("\nCreating new initial migration...")
    cmd = [VENV_ALEMBIC, "revision", "--autogenerate", "-m", "initial_schema"]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(result.stdout)
        if result.stderr:
            print(f"Warnings/Errors:\n{result.stderr}")
            
        # Find the newly created migration file
        migration_file = None
        for file in os.listdir(VERSIONS_DIR):
            if file.endswith('.py') and file != '__init__.py':
                migration_file = os.path.join(VERSIONS_DIR, file)
                print(f"Created migration file: {migration_file}")
                break
                
        return migration_file
    except subprocess.CalledProcessError as e:
        print(f"Error creating migration: {e}")
        print(f"Stdout: {e.stdout}")
        print(f"Stderr: {e.stderr}")
        return None

def apply_migration():
    """Apply the migration to the database"""
    os.chdir(BACKEND_DIR)
    
    print("\nApplying migration to database...")
    cmd = [VENV_ALEMBIC, "upgrade", "head"]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(result.stdout)
        if result.stderr:
            print(f"Warnings/Errors:\n{result.stderr}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error applying migration: {e}")
        print(f"Stdout: {e.stdout}")
        print(f"Stderr: {e.stderr}")
        return False

def reset_database():
    """Delete the database file if it exists"""
    if os.path.exists(DB_PATH):
        print(f"Removing existing database: {DB_PATH}")
        os.remove(DB_PATH)
        return True
    return False

def main():
    """Main function to reset migrations and database"""
    print("=" * 60)
    print("Migration Reset Tool")
    print("=" * 60)
    
    # Backup existing database and migrations
    db_backup = backup_database()
    migrations_backup = backup_migrations()
    
    # Reset database
    reset_database()
    
    # Clear existing migrations
    clear_migrations()
    
    # Create new migration
    migration_file = create_new_migration()
    
    if migration_file:
        # Apply migration
        success = apply_migration()
        
        if success:
            print("\n✅ Migrations reset and applied successfully!")
            print(f"Database: {DB_PATH}")
            if db_backup:
                print(f"Database backup: {db_backup}")
            if migrations_backup:
                print(f"Migrations backup: {migrations_backup}")
        else:
            print("\n❌ Failed to apply migration!")
    else:
        print("\n❌ Failed to create migration!")
    
    print("\nDone!")

if __name__ == "__main__":
    main()
