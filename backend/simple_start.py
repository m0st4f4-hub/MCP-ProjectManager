#!/usr/bin/env python3
"""
Simple startup script that sets proper encoding.
"""

import sys
import os
from pathlib import Path

# Set console encoding to UTF-8 for Windows
if sys.platform == "win32":
    import locale
    locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')

# Add the project root to Python path  
backend_dir = Path(__file__).parent
project_root = backend_dir.parent
sys.path.insert(0, str(project_root))

# Change to backend directory
os.chdir(backend_dir)

if __name__ == "__main__":
    # Try to run the server with simple imports
    try:
        os.environ['PYTHONIOENCODING'] = 'utf-8'
        os.system(f"{sys.executable} -c \"import uvicorn; import sys; sys.path.insert(0, '{project_root}'); from backend.main import app; uvicorn.run(app, host='0.0.0.0', port=8003, reload=False)\"")
    except Exception as e:
        print(f"Error: {e}")
        print("Trying alternative approach...")
        # Fallback: try to run with a different encoding approach
        os.system(f"set PYTHONIOENCODING=utf-8 && {sys.executable} -m backend.main")
