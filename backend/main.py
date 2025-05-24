import sys
import os
print("---- sys.path ----")
for p in sys.path:
    print(p)
print("--------------------")
print("---- os.getcwd() ----")
print(os.getcwd())
print("---------------------")


"""
Task Manager Backend - Simplified Main Application
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any

# Local imports
from backend.database import get_db, Base, engine
# Import middleware initialization
from backend.middleware import init_middleware

# Import routers
from backend.routers import mcp, projects, agents, audit_logs, memory, rules, tasks, users

# Add import for MCP (mock if not available)
try:
    from fastapi_mcp import MCPClient
except ImportError:
    MCPClient = None

logger = logging.getLogger(__name__)

# Create all tables in the database
# Base.metadata.create_all(bind=engine) # REMOVED module-level call

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting Task Manager Backend...")
    
    # Initialize database tables
    try:
        Base.metadata.create_all(bind=engine) # MOVED call into lifespan
        logger.info("Database tables initialized")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise
    
    yield
    logger.info("Shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Task Manager API",
    version="2.0.0",
    description="Task Manager with MCP integration",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Initialize middleware
init_middleware(app)

# --- MCP Instance Initialization ---
if MCPClient is not None:
    mcp = MCPClient(app, rules_dir=".cursor/rules")
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
    return {"message": "Welcome to the Task Manager API"}

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check(db: Session = Depends(get_db)) -> Dict[str, str]:
    try:
        # Attempt a simple query to check DB connection
        db.execute("SELECT 1")
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
        for tool_name, tool_info in tools.items():
            md.append(f"- **{tool_name}**: {tool_info.get('description', '')}")
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

# Include routers
app.include_router(agents.router)
app.include_router(audit_logs.router)
app.include_router(memory.router)
app.include_router(mcp.router, prefix="/mcp-tools")
app.include_router(projects.router)
app.include_router(rules.router)
app.include_router(tasks.router)
app.include_router(users.router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize middleware
init_middleware(app)

# Optional: Add a custom exception handler for HTTPExceptions if needed
# @app.exception_handler(HTTPException)
# async def http_exception_handler(request: Request, exc: HTTPException):
#     return JSONResponse(
#         status_code=exc.status_code,
#         content={"detail": exc.detail, "headers": exc.headers if hasattr(exc, 'headers') else None},
#     )

# Optional: Add a generic exception handler for unhandled errors
# @app.exception_handler(Exception)
# async def generic_exception_handler(request: Request, exc: Exception):
#     logger.error(f"Unhandled exception: {exc}", exc_info=True)
#     return JSONResponse(
#         status_code=500,
#         content={"detail": "An unexpected error occurred."},
#     )


if __name__ == "__main__":
    import uvicorn
    import logging

    # Configure logging format with timestamp
    log_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "standard": {
                "fmt": "%(asctime)s - %(levelname)s - %(name)s - %(message)s"
            },
            "uvicorn_standard": {
                "fmt": "%(asctime)s %(levelname)s %(name)s:%(lineno)d %(message)s"
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

    # Note: For production, consider using Gunicorn or another ASGI server
    # Also, remove reload=True for production
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_config=log_config) # Add log_config
