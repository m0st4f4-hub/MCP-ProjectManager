"""
FastAPI Task Manager Application
Following FastAPI best practices and documentation patterns.
"""

import logging
import logging.config
from contextlib import asynccontextmanager
from typing import Dict, Any
import importlib

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# Database and config imports
from backend.database import get_db, engine, Base
from backend.config import settings
# from backend.metrics import setup_metrics  # Skip metrics for now

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting Task Manager API...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database tables created/verified")
    print("\n" + "="*60)
    print(" " * 15 + "TASK MANAGER API")
    print("="*60)
    print(f"Environment: {'Development' if settings.debug else 'Production'}")
    print(f"Database: {settings.database_url}")
    print(f"API Version: {app.version}")
    print("="*60 + "\n")
    yield
    logger.info("🛑 Shutting down Task Manager API...")

def create_application() -> FastAPI:
    app = FastAPI(
        title="Task Manager API",
        description="""
        A comprehensive task management system for local, single-user use.
        
        ## Features
        * **Project Management**: Create, manage, and track projects
        * **Task Management**: Comprehensive task tracking with dependencies
        * **Agent System**: AI agent integration for automated assistance
        * **Memory System**: Context-aware memory for improved interactions
        * **MCP Integration**: Model Context Protocol for enhanced AI capabilities
        
        **Note:** This version is for local, single-user use only. All authentication, user, and security features have been removed.
        """,
        version="2.0.1",
        terms_of_service="https://example.com/terms/",
        contact={
            "name": "API Support",
            "url": "https://example.com/contact/",
            "email": "support@example.com",
        },
        license_info={
            "name": "MIT",
            "url": "https://opensource.org/licenses/MIT",
        },
        lifespan=lifespan,
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
    )
    # Setup metrics
    # setup_metrics(app)  # Skip metrics for now
    # Include only non-user/auth routers
    include_routers(app)
    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc):
        logger.error(f"Global exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )
    add_core_endpoints(app)
    return app

def include_routers(app: FastAPI) -> None:
    routers_config = [
        ("backend.routers.projects", "/api/v1/projects", "projects"),
        ("backend.routers.tasks", "/api/v1/tasks", "tasks"),
        ("backend.routers.mcp", "/api/v1/mcp", "mcp"),
        ("backend.routers.agents", "/api/v1/agents", "agents"),
        ("backend.routers.memory", "/api/v1/memory", "memory"),
        ("backend.routers.rules", "/api/v1/rules", "rules"),
        ("backend.routers.workflows", "/api/v1/workflows", "workflows"),
        ("backend.routers.comments", "/api/v1/comments", "comments"),
        ("backend.routers.audit_logs", "/api/v1/audit-logs", "audit-logs"),
        ("backend.routers.project_templates", "/api/v1/project-templates", "project-templates"),
    ]
    for module_path, prefix, tag in routers_config:
        try:
            module = importlib.import_module(module_path)
            router = getattr(module, "router")
            app.include_router(router, prefix=prefix, tags=[tag])
            logger.info(f"✅ Included {tag} router")
        except (ImportError, AttributeError) as e:
            logger.warning(f"⚠️  Could not import {tag} router: {e}")

def add_core_endpoints(app: FastAPI) -> None:
    @app.get("/", summary="Root endpoint", description="Welcome message and API information", response_description="API welcome message", tags=["system"])
    async def root() -> Dict[str, str]:
        return {
            "message": "Welcome to Task Manager API (Single User, Local Only)",
            "version": "2.0.1",
            "docs": "/docs",
            "status": "operational"
        }
    @app.get("/health", summary="Health check", description="Check API and database health status", response_description="Health status information", status_code=status.HTTP_200_OK, tags=["system"])
    async def health_check(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
        from datetime import datetime
        import time
        health_status = {
            "service": "task-manager-api",
            "status": "healthy",
            "timestamp": time.time(),
            "version": "2.0.1",
            "database": "unknown",
        }
        try:
            db.execute(text("SELECT 1"))
            health_status["database"] = "connected"
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            health_status["database"] = "error"
            health_status["status"] = "degraded"
        return health_status
    @app.get("/info", summary="API Information", description="Detailed API information and configuration", tags=["system"])
    async def api_info() -> Dict[str, Any]:
        return {
            "title": app.title,
            "description": "Task Management API (Single User, Local Only)",
            "version": app.version,
            "debug_mode": settings.debug,
            "features": [
                "Project Management", 
                "Task Tracking",
                "Agent System",
                "Memory Integration",
                "Rate Limiting",
                "Metrics Collection"
            ]
        }

app = create_application()

if __name__ == "__main__":
    import uvicorn
    logging.basicConfig(
        level=logging.INFO if settings.debug else logging.WARNING,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info" if settings.debug else "warning"
    )
