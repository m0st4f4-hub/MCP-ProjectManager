#!/usr/bin/env python3
"""
Simplified script to reset Alembic migrations and create a fresh initial migration.
"""
import os
import sys
import shutil
import sqlite3
from datetime import datetime

# Configuration
BACKEND_DIR = "D:/mcp/task-manager/backend"
ALEMBIC_DIR = os.path.join(BACKEND_DIR, "alembic")
VERSIONS_DIR = os.path.join(ALEMBIC_DIR, "versions")
DB_PATH = "D:/mcp/task-manager/sql_app.db"

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
def reset_database():
    """Delete the database file if it exists"""
    if os.path.exists(DB_PATH):
        print(f"Removing existing database: {DB_PATH}")
        os.remove(DB_PATH)
        return True
    return False

def create_new_migration_file(message="initial_schema"):
    """Create a new Alembic migration file template"""
    timestamp = datetime.now().strftime("%Y_%m_%d_%H%M%S")
    migration_name = f"{timestamp}_{message}.py"
    migration_path = os.path.join(VERSIONS_DIR, migration_name)
    
    print(f"Creating migration file: {migration_path}")
    
    # Read the template from script.py.mako
    mako_template = os.path.join(ALEMBIC_DIR, "script.py.mako")
    with open(mako_template, 'r') as f:
        template_content = f.read()
    
    # Replace revision/down_revision placeholders
    import uuid
    revision_id = str(uuid.uuid4())[:12]
    
    template_content = template_content.replace("${message}", message)
    template_content = template_content.replace("${up_revision}", revision_id)
    template_content = template_content.replace("${down_revision}", "None")
    
    # Write the migration file
    with open(migration_path, 'w') as f:
        f.write(template_content)
    
    return migration_path

def main():
    """Main function to reset migrations and database"""
    print("=" * 60)
    print("Migration Reset Tool (Simple)")
    print("=" * 60)
    
    # Backup existing database and migrations
    db_backup = backup_database()
    migrations_backup = backup_migrations()
    
    # Reset database
    reset_database()
    
    # Clear existing migrations
    clear_migrations()
    
    # Create new migration file template
    migration_file = create_new_migration_file("initial_schema")
    
    print("\nDone!")
    print(f"Created migration file: {migration_file}")
    print("\nNext steps:")
    print("1. Edit the migration file to add your schema")
    print("2. Run 'alembic upgrade head' to apply the migration")

if __name__ == "__main__":
    main()
