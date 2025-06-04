"""
Task Manager Backend - Simplified Main Application
"""
import logging
import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any
import json

# Explicitly import schema models to ensure they are loaded early for Pydantic to resolve forward references
from .schemas import (
    task, project, api_responses, task_status, 
    agent, task_dependency, comment, file_association,
    memory, user # Assuming these are the main schema modules with interdependencies
)

# Local imports
from .database import get_db, Base, engine
# Import middleware initialization
from .middleware import RateLimitMiddleware, SecurityHeadersMiddleware, init_middleware

# Explicitly import models to ensure they are loaded early
from . import models

# Add import for FastAPI-MCP (mock if not available)
try:
    from fastapi_mcp import FastApiMCP
except ImportError:
    FastApiMCP = None

# Configure logging format with timestamp
log_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "fmt": "%(asctime)s - %(levelname)s - %(name)s - %(message)s"
        },
        "uvicorn_standard": {
            "fmt": "%(asctime)s - %(levelname)s - %(message)s"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "uvicorn_standard", # Use the new uvicorn_standard formatter
            "stream": "ext://sys.stderr"
        }
    },
    "loggers": {
        "uvicorn": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False
        },
        "uvicorn.error": {
            "level": "INFO",
            "handlers": ["console"],
            "propagate": False
        },
        "uvicorn.access": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False
        }
    }
}

import logging.config
logging.config.dictConfig(log_config)

logger = logging.getLogger(__name__)
# Function to include routers dynamically
def include_app_routers(application: FastAPI):
    """Include all application routers."""
    # Import available routers
    try:
        from .routers import users
        application.include_router(users.router, prefix="/api/v1/users", tags=["users"])
        logger.info("Users router included successfully")
    except ImportError as e:
        logger.warning(f"Could not import users router: {e}")
    
    # Include admin router
    try:
        from .routers.admin import router as admin_router
        application.include_router(admin_router, prefix="/api/v1", tags=["admin"])
        logger.info("Admin router included successfully")
    except ImportError as e:
        logger.warning(f"Could not import admin router: {e}")
    
    # Include auth router separately for /api/v1/auth endpoints
    try:
        from .routers.users.auth.auth import router as auth_router
        application.include_router(auth_router, prefix="/api/v1", tags=["auth"])
        logger.info("Auth router included successfully")
    except ImportError as e:
        logger.warning(f"Could not import auth router: {e}")
    except Exception as e:
        logger.error(f"Unexpected error with auth router: {e}")
    
    try:
        from .routers import projects
        application.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
        logger.info("Projects router included successfully")
    except ImportError as e:
        logger.warning(f"Could not import projects router: {e}")
    
    try:
        from .routers import tasks
        application.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
        logger.info("Tasks router included successfully")
    except ImportError as e:
        logger.warning(f"Could not import tasks router: {e}")
    
    try:
        from .routers import comments
        application.include_router(comments.router, prefix="/api/comments", tags=["comments"])
        logger.info("Comments router included successfully")
    except ImportError as e:
        logger.warning(f"Could not import comments router: {e}")
    
    try:
        from .routers import agents
        application.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])
        logger.info("Agents router included successfully")
    except ImportError as e:
        logger.warning(f"Could not import agents router: {e}")
    
    try:
        from .routers import memory
        application.include_router(memory.router, prefix="/api/memory", tags=["memory"])
        logger.info("Memory router included successfully")
    except ImportError as e:
        logger.warning(f"Could not import memory router: {e}")
    
    try:
        from .routers import mcp
        application.include_router(mcp.router, prefix="/api/mcp", tags=["mcp"])
        logger.info("MCP router included successfully")
    except ImportError as e:
        logger.warning(f"Could not import mcp router: {e}")
    
    try:
        from .routers import rules
        application.include_router(rules.router, prefix="/api/rules", tags=["rules"])
        logger.info("Rules router included successfully")
    except ImportError as e:
        logger.warning(f"Could not import rules router: {e}")
    
    try:
        from .routers import project_templates
        application.include_router(project_templates.router, prefix="/api/templates", tags=["templates"])
        logger.info("Project templates router included successfully")
    except ImportError as e:
        logger.warning(f"Could not import project_templates router: {e}")
    
    try:
        from .routers import audit_logs
        application.include_router(audit_logs.router, prefix="/api/audit-logs", tags=["audit-logs"])
        logger.info("Audit logs router included successfully")
    except ImportError as e:
        logger.warning(f"Could not import audit_logs router: {e}")
    
    logger.info("Router inclusion completed")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting Task Manager Backend...")
    
    # Initialize database tables
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

    # Display MCP server info for developers
    server_addr = os.getenv("MCP_SERVER_ADDRESS", "http://localhost:8000")
    cursor_info = {
        "mcp_server": server_addr,
        "openapi_url": f"{server_addr}/openapi.json",
        "tools_url": f"{server_addr}/mcp-docs"
    }
    logger.info(f"MCP server running at {server_addr}")
    logger.info(f"Cursor IDE integration JSON: {json.dumps(cursor_info)}")

    yield
    # Log routes and MCP tools after startup
    routes_info = []
    for route in app.routes:
        if hasattr(route, "methods"):
            methods = ", ".join(list(route.methods))
        else:
            methods = "N/A"
        routes_info.append(f" - {methods} {route.path} ({getattr(route, 'name', '')})")

    mcp_instance = getattr(app.state, "mcp_instance", None)
    tools_info = []
    if mcp_instance and hasattr(mcp_instance, 'tools'):
        if mcp_instance.tools:
            for tool_name, tool_info in mcp_instance.tools.items():
                tools_info.append(f" - {tool_name}: {tool_info.get('description', '')}")
        else:
            tools_info.append(" No MCP tools registered.")
    else:
        tools_info.append(" MCP Client not available or tools not initialized.")

    startup_dashboard = [
        "\n" + "="*40,
        "Backend Startup Dashboard",
        "="*40,
        "\nAPI Routes:",
        *routes_info,
        "\nMCP Tools:",
        *tools_info,
        "\n" + "="*40
    ]

    for line in startup_dashboard:
        logger.info(line)

    logger.info("Shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Task Manager API",
    version="2.0.0",
    description="Task Manager with MCP integration",
    openapi_url="/openapi.json",
    docs_url=None, # Disable default docs
    redoc_url=None, # Disable default redoc
    lifespan=lifespan
)

# CORS middleware - MOVED BEFORE other middleware and router inclusion
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

# Initialize middleware - MOVED BEFORE including routers
init_middleware(app)

# Define custom docs and redoc routes *after* middleware init
from fastapi.openapi.docs import get_redoc_html, get_swagger_ui_html

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    html_content = get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
    )
    return Response(
        content=html_content.body,
        headers={
            "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' https://fastapi.tiangolo.com"
        },
        media_type="text/html"
    )

@app.get("/redoc", include_in_schema=False)
async def custom_redoc_html():
    html_content = get_redoc_html(
        openapi_url=app.openapi_url,
        title=app.title + " - ReDoc",
    )
    return Response(
        content=html_content.body,
        headers={
            "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' https://fastapi.tiangolo.com"
        },
        media_type="text/html"
    )

# Include routers
include_app_routers(app)
logger.info("Routers included")

# Explicitly rebuild Pydantic models after routers are included
# This helps resolve forward references when schemas have interdependencies
logger.info("Explicitly rebuilding Pydantic models...")
try:
    from .schemas.task import Task
    from .schemas.project import Project 
    from .schemas.agent import Agent, AgentRule
    from .schemas.task_dependency import TaskDependency
    from .schemas.comment import Comment
    from .schemas.file_association import TaskFileAssociation
    from .schemas.memory import MemoryEntity
    from .schemas.user import User
    from .schemas.task_status import TaskStatus
    
    Task.model_rebuild()
    Project.model_rebuild()
    Agent.model_rebuild()
    AgentRule.model_rebuild()
    TaskDependency.model_rebuild()
    Comment.model_rebuild()
    TaskFileAssociation.model_rebuild()
    MemoryEntity.model_rebuild()
    User.model_rebuild()
    TaskStatus.model_rebuild()
    logger.info("Pydantic models rebuilt successfully.")
except Exception as e:
    logger.error(f"Error during Pydantic model rebuild: {e}")
    # Depending on severity, you might want to raise the exception or handle it differently
    # For now, we log it and let the application continue, but it might affect OpenAPI spec


# --- MCP Instance Initialization ---
if FastApiMCP is not None:
    mcp = FastApiMCP(
        app,
        name="Task Manager MCP",
        description="MCP server for task manager",
    )
    mcp.mount()
    app.state.mcp_instance = mcp
else:
    # Mock MCP instance for /mcp-docs
    class MockMCP:
        def __init__(self):
            self.tools = {}
    app.state.mcp_instance = MockMCP()

# --- Health Check and Basic Routes ---
@app.get("/")
async def read_root():
    logger.info("Received request for root endpoint (/).")
    result = {"message": "Welcome to the Task Manager API"}
    logger.info("Successfully processed request for root endpoint (/).")
    return result

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check(db: Session = Depends(get_db)) -> Dict[str, str]:
    try:
        # Attempt a simple query to check DB connection
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        db_status = "error"
    return {"status": "healthy", "database": db_status}

@app.get("/test-mcp")
async def test_mcp(request: Request) -> Dict[str, Any]:
    return {
        "message": "MCP Test Endpoint",
        "headers": dict(request.headers),
        "client_host": request.client.host if request.client else "unknown"
    }

@app.get("/mcp-docs", tags=["MCP"], summary="MCP Tools and Route Documentation")
async def mcp_docs(request: Request):
    mcp_instance = getattr(request.app.state, "mcp_instance", None)
    tools = getattr(mcp_instance, "tools", {}) if mcp_instance else {}
    # Gather route info
    routes = []
    for route in request.app.routes:
        if route.path in ["/openapi.json", "/docs", "/redoc"]:
            continue
        if hasattr(route, "methods"):
            methods = list(route.methods)
        else:
            methods = []
        routes.append({
            "path": route.path,
            "name": getattr(route, "name", ""),
            "description": getattr(route, "description", ""),
            "methods": methods
        })
    # Generate Markdown documentation
    md = ["# MCP Project Manager Tools Documentation\n"]
    md.append("## Tools\n")
    if tools:
        if isinstance(tools, dict):
            tool_iter = tools.items()
        elif isinstance(tools, list):
            tool_iter = []
            for idx, tool in enumerate(tools):
                if isinstance(tool, dict):
                    name = tool.get("name", f"tool_{idx}")
                    tool_iter.append((name, tool))
        else:
            tool_iter = []

        for tool_name, tool_info in tool_iter:
            md.append(f"- **{tool_name}**: {tool_info.get('description', '')}")
        if not tool_iter:
            md.append("No tools registered.\n")
    else:
        md.append("No tools registered.\n")
    md.append("\n## Routes\n")
    for r in routes:
        md.append(f"- `{r['path']}` ({', '.join(r['methods'])}): {r['name']} - {r['description']}")
    md_doc = "\n".join(md)
    return {
        "tools": tools,
        "routes": routes,
        "mcp_project_manager_tools_documentation": md_doc
    }
