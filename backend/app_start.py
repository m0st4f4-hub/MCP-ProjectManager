#!/usr/bin/env python3
"""
Standalone startup script for the Task Manager Backend
This script properly handles imports and module paths.
"""

import sys
import os
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Try importing with proper path handling
try:
    from backend.database import get_db, engine, Base
    from backend.config.app_config import settings
except ImportError:
    # Fallback to relative imports
    import database
    from database import get_db, engine, Base
    try:
        from config.app_config import settings
    except ImportError:
        # Create minimal settings if config fails
        class Settings:
            database_url = "sqlite+aiosqlite:///./sql_app.db"
            debug = True
        settings = Settings()

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("🚀 Starting Task Manager API...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created/verified")
    except Exception as e:
        logger.warning(f"Database initialization failed: {e}")
    
    print("\n" + "="*60)
    print(" " * 15 + "TASK MANAGER API")
    print("="*60)
    print(f"Environment: {'Development' if settings.debug else 'Production'}")
    print(f"Database: {settings.database_url}")
    print(f"API Version: 2.0.1")
    print("="*60 + "\n")
    
    yield
    
    logger.info("🛑 Shutting down Task Manager API...")

def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    app = FastAPI(
        title="Task Manager API",
        description="A comprehensive task management system with MCP integration",
        version="2.0.1",
        lifespan=lifespan,
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Basic health check endpoint
    @app.get("/")
    async def root():
        return {"message": "Task Manager API", "version": "2.0.1", "status": "running"}
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "version": "2.0.1"}
    
    # Try to load routers if available
    try:
        from backend.routers.projects.core import router as projects_router
        app.include_router(projects_router, prefix="/api/v1/projects", tags=["projects"])
    except ImportError:
        logger.warning("Projects router not available")
    
    try:
        from backend.routers.tasks.core.core import router as tasks_router
        app.include_router(tasks_router, prefix="/api/v1/tasks", tags=["tasks"])
    except ImportError:
        logger.warning("Tasks router not available")
    
    return app

def main():
    """Main entry point"""
    app = create_app()
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    # Run the server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()