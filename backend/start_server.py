"""
Simplified startup script for Task Manager Backend.
"""

import os
import sys
import uvicorn

# Add backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

def main():
    """Main startup function."""
    print("Starting Task Manager Backend v2.0")
    print(f"Backend directory: {backend_dir}")
    
    try:
        # Start server directly without importing
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8080,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        print(f"Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
