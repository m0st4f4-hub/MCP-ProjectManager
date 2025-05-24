"""
Optimized startup script for Task Manager Backend.
Handles path configuration and server startup.
"""

import os
import sys
import uvicorn
import logging

# Add backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(backend_dir)
sys.path.insert(0, backend_dir)
sys.path.insert(0, parent_dir)

logger = logging.getLogger(__name__)


def main():
    """Main startup function."""
    print("🚀 Starting Task Manager Backend v2.0")
    print(f"📁 Backend directory: {backend_dir}")
    print(f"🐍 Python path configured")
    
    try:
        # Import and validate main app
        from main import app
        print("✅ FastAPI application loaded successfully")
        
        # Start server
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8080,
            reload=True,
            log_level="info",
            access_log=True
        )
    except ImportError as e:
        print(f"❌ Failed to import application: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
