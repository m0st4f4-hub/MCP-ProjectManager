#!/usr/bin/env python3
"""
Startup script for the backend server.
This handles the module import issues.
"""

import sys
import os
from pathlib import Path

# Add the project root to Python path
backend_dir = Path(__file__).parent
project_root = backend_dir.parent
sys.path.insert(0, str(project_root))

# Change to backend directory for relative file access
os.chdir(backend_dir)

if __name__ == "__main__":
 import uvicorn
 from backend.main import app
 
 # Run the server
 uvicorn.run(
 app,
 host="0.0.0.0",
 port=8002, # Use another different port
 reload=False # Disable reload for now
 )
