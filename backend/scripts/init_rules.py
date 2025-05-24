# Task ID: rules_framework_implementation
# Agent Role: ImplementationSpecialist  
# Request ID: rules_integration
# Project: task-manager
# Timestamp: 2025-05-23T15:30:00Z

"""
CLI command to initialize rules framework
"""

import sys
import os

# Add the project root directory to the Python path
project_root = os.path.join(os.path.dirname(__file__), '..', '..')
sys.path.insert(0, project_root)

from backend.database import SessionLocal, engine, Base
from backend.services.rules_service import RulesService

def initialize_rules():
    """Initialize the rules framework with default data"""
    print("Initializing Rules Framework...")
    
    # Create all tables
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created/updated.")
    except Exception as e:
        print(f"Error creating tables: {e}")
        return
    
    # Initialize rules (commented out for now due to relationship issues)
    print("Skipping default rules initialization due to model relationship conflicts.")
    print("You can manually create rules via the API endpoints.")
    
    # TODO: Fix model relationships and uncomment this
    with SessionLocal() as db:
        rules_service = RulesService(db)
        rules_service.initialize_default_rules()
        print("Default rules and agent roles created.")
    
    print("Rules framework tables initialization complete!")
    print("Use the /rules API endpoints to create agent roles and rules.")

if __name__ == "__main__":
    initialize_rules()
