"""
FastAPI Task Manager Application
Following FastAPI best practices and documentation patterns.
"""

import logging
import logging.config
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# Database and config imports
from database import get_db, engine, Base
from config import settings
from app_middleware import init_middleware
from metrics import setup_metrics

# Router imports with error handling
logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown logic.
    """
    # Startup
    logger.info("🚀 Starting Task Manager API...")
    
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("✅ Database tables created/verified")
    
    # Display startup info
    print("\n" + "="*60)
    print(" " * 15 + "TASK MANAGER API")
    print("="*60)
    print(f"Environment: {'Development' if settings.DEBUG else 'Production'}")
    print(f"Database: {settings.DATABASE_URL}")
    print(f"API Version: {app.version}")
    print("="*60 + "\n")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Task Manager API...")


def create_application() -> FastAPI:
    """
    Create and configure the FastAPI application.
    Follows FastAPI best practices for application factory pattern.
    """
    
    # Create FastAPI instance with comprehensive configuration
    app = FastAPI(
        title="Task Manager API",
        description="""
        A comprehensive task management system with user authentication,
        project management, and MCP (Model Context Protocol) integration.
        
        ## Features
        
        * **User Management**: Registration, authentication, role-based access
        * **Project Management**: Create, manage, and collaborate on projects
        * **Task Management**: Comprehensive task tracking with dependencies
        * **Agent System**: AI agent integration for automated assistance
        * **Memory System**: Context-aware memory for improved interactions
        * **MCP Integration**: Model Context Protocol for enhanced AI capabilities
        
        ## Authentication
        
        This API uses Bearer token authentication. Include your token in the
        Authorization header as: `Bearer your_token_here`
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
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=settings.cors_allow_credentials,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
    )
    
    # Initialize middleware
    init_middleware(app, debug=settings.debug)
    
    # Add trusted host middleware for production
    if not settings.debug:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=["localhost", "127.0.0.1", "*.example.com"]
        )
    
    # Setup metrics
    setup_metrics(app)
    
    # Include routers
    include_routers(app)
    
    # Global exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc):
        logger.error(f"Global exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )
    
    # Add health check and root endpoints
    add_core_endpoints(app)
    
    return app


def include_routers(app: FastAPI) -> None:
    """
    Include all application routers with proper error handling.
    Follows FastAPI best practices for router organization.
    """
    routers_config = [
        ("routers.auth", "", "authentication"),  # Auth router already has prefix
        ("routers.users", "/api/v1/users", "users"),
        ("routers.projects", "/api/v1/projects", "projects"),
        ("routers.tasks", "/api/v1/tasks", "tasks"),
        # ("routers.agents", "/api/v1/agents", "agents"),  # TODO: Implement agents router
        # ("routers.memory", "/api/v1/memory", "memory"),  # TODO: Fix memory router imports
        # ("routers.audit_logs", "/api/v1/audit", "audit"),  # TODO: Implement audit router
    ]
    
    for module_path, prefix, tag in routers_config:
        try:
            module = __import__(module_path, fromlist=["router"])
            router = getattr(module, "router")
            app.include_router(
                router,
                prefix=prefix,
                tags=[tag]
            )
            logger.info(f"✅ Included {tag} router")
        except (ImportError, AttributeError) as e:
            logger.warning(f"⚠️  Could not import {tag} router: {e}")
            # Continue loading other routers even if one fails


def add_core_endpoints(app: FastAPI) -> None:
    """
    Add core application endpoints following FastAPI patterns.
    """
    
    @app.get(
        "/",
        summary="Root endpoint",
        description="Welcome message and API information",
        response_description="API welcome message",
        tags=["system"]
    )
    async def root() -> Dict[str, str]:
        """Root endpoint returning API information."""
        return {
            "message": "Welcome to Task Manager API",
            "version": "2.0.1",
            "docs": "/docs",
            "status": "operational"
        }
    
    @app.get(
        "/health",
        summary="Health check",
        description="Check API and database health status",
        response_description="Health status information",
        status_code=status.HTTP_200_OK,
        tags=["system"]
    )
    async def health_check(
        db: AsyncSession = Depends(get_db)
    ) -> Dict[str, Any]:
        """
        Health check endpoint that verifies:
        - API is running
        - Database connectivity
        - Current timestamp
        """
        from datetime import datetime
        
        health_status = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "2.0.1",
            "environment": "development" if settings.debug else "production"
        }
        
        # Test database connection
        try:
            await db.execute(text("SELECT 1"))
            health_status["database"] = "connected"
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            health_status["database"] = "error"
            health_status["status"] = "degraded"
        
        return health_status
    
    @app.get(
        "/info",
        summary="API Information",
        description="Detailed API information and configuration",
        tags=["system"]
    )
    async def api_info() -> Dict[str, Any]:
        """Get detailed API information."""
        return {
            "title": app.title,
            "description": "Task Management API with advanced features",
            "version": app.version,
            "debug_mode": settings.debug,
            "features": [
                "User Authentication",
                "Project Management", 
                "Task Tracking",
                "Agent System",
                "Memory Integration",
                "Rate Limiting",
                "Metrics Collection"
            ]
        }


# Create the application instance
app = create_application()


if __name__ == "__main__":
    import uvicorn
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO if settings.debug else logging.WARNING,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    # Run the application
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info" if settings.debug else "warning"
    )