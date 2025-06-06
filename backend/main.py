import sys
import os
import logging
import logging.config
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, Request, Response, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

# Add the project root to the Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.database import get_db, Base, engine
from backend.middleware import init_middleware
from backend.config import settings
from backend.schemas import _schema_init  # noqa: F401
from backend.metrics import setup_metrics

try:
    from fastapi_mcp import FastApiMCP
except ImportError:
    FastApiMCP = None

# Logging configuration
log_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "uvicorn_standard": {"fmt": "%(asctime)s - %(levelname)s - %(message)s"}
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "uvicorn_standard",
            "stream": "ext://sys.stderr",
        }
    },
    "loggers": {
        "uvicorn": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "uvicorn.error": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "uvicorn.access": {"handlers": ["console"], "level": "INFO", "propagate": False},
    },
}
logging.config.dictConfig(log_config)
logger = logging.getLogger(__name__)


def include_app_routers(app: FastAPI):
    """Include all application routers."""
    logger.info("Including all application routers...")
    
    # Import only the routers that actually exist
    try:
        from backend.routers import users
        app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
        logger.info("Successfully included users router")
    except ImportError as e:
        logger.warning(f"Could not import users router: {e}")
    
    try:
        from backend.routers import projects
        app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
        logger.info("Successfully included projects router")
    except ImportError as e:
        logger.warning(f"Could not import projects router: {e}")
    
    try:
        from backend.routers import tasks
        app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
        logger.info("Successfully included tasks router")
    except ImportError as e:
        logger.warning(f"Could not import tasks router: {e}")
    
    # Add other routers one by one as they become available
    logger.info("Router inclusion complete.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting Task Manager Backend...")
    
    # Startup Dashboard
    print("\n" + "="*80)
    print(" " * 25 + ">> STARTUP DASHBOARD <<")
    print("="*80 + "\n")
    
    # API Routes
    print("--- Registered API Routes ---")
    if app.router.routes:
        for route in app.router.routes:
            if hasattr(route, "path") and hasattr(route, "methods"):
                print(f"  - Path: {route.path}, Methods: {list(route.methods)}, Name: {getattr(route, 'name', 'N/A')}")
            else:
                print(f"  - Other Route/Mount: {route}")
    else:
        print("  No API routes found.")
    print("\n" + "-"*80 + "\n")

    # MCP Tools
    print("--- MCP Tools ---")
    mcp_instance = getattr(app.state, "mcp_instance", None)
    if mcp_instance and hasattr(mcp_instance, "tools"):
        tools = mcp_instance.tools
        print(f"MCP Tools found: {len(tools) if tools else 0}")
        if tools:
            print(str(tools)[:500] + "..." if len(str(tools)) > 500 else str(tools))
    else:
        print("  No MCP tools found.")
    
    print("\n" + "="*80)
    print(" " * 20 + ">> END OF STARTUP DASHBOARD <<")
    print("="*80 + "\n")
    
    yield
    logger.info("Shutting down Task Manager Backend...")


def create_app() -> FastAPI:
    """Creates and configures the FastAPI application."""
    app = FastAPI(
        title="Task Manager API",
        version="2.0.1",
        description="Task Manager with MCP integration",
        lifespan=lifespan,
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    init_middleware(app)
    setup_metrics(app)
    include_app_routers(app)
    
    # Basic routes
    @app.get("/")
    async def root():
        return {"message": "Welcome to the Task Manager API"}

    @app.get("/health", status_code=status.HTTP_200_OK)
    async def health_check(db: Session = Depends(get_db)) -> Dict[str, str]:
        try:
            await db.execute(text("SELECT 1"))
            return {"status": "healthy", "database": "connected"}
        except Exception as e:
            logger.error(f"Health check DB error: {e}")
            return {"status": "healthy", "database": "error"}
    
    # MCP setup
    if FastApiMCP:
        try:
            mcp_instance = FastApiMCP(app, name="Task Manager MCP")
            mcp_instance.mount()
            app.state.mcp_instance = mcp_instance
            logger.info("MCP instance created and mounted")
        except Exception as e:
            logger.error(f"Failed to create MCP instance: {e}")
            app.state.mcp_instance = None
    else:
        app.state.mcp_instance = None
        logger.info("FastApiMCP not available, continuing without MCP")

    return app

app = create_app()
