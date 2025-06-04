import sys
import os

"""
Task Manager Backend - Simplified Main Application
"""
import logging
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any

# Schema preloading for forward ref resolution
from .schemas import (
    task, project, api_responses, task_status,
    agent, task_dependency, comment, file_association,
    memory, user
)

from .database import get_db, Base, engine
from .middleware import RateLimitMiddleware, SecurityHeadersMiddleware, init_middleware
from . import models

try:
    from fastapi_mcp import FastApiMCP
except ImportError:
    FastApiMCP = None

# Configure logging
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
            "formatter": "uvicorn_standard",
            "stream": "ext://sys.stderr"
        }
    },
    "loggers": {
        "uvicorn": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "uvicorn.error": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "uvicorn.access": {"handlers": ["console"], "level": "INFO", "propagate": False}
    }
}
logging.config.dictConfig(log_config)
logger = logging.getLogger(__name__)

def include_app_routers(application: FastAPI):
    try:
        from .routers import users
        application.include_router(users.router, prefix="/api/v1/users", tags=["users"])
    except ImportError as e:
        logger.warning(f"Users router failed: {e}")
    try:
        from .routers.admin import router as admin_router
        application.include_router(admin_router, prefix="/api/v1", tags=["admin"])
    except ImportError as e:
        logger.warning(f"Admin router failed: {e}")
    try:
        from .routers.users.auth.auth import router as auth_router
        application.include_router(auth_router, prefix="/api/v1", tags=["auth"])
    except ImportError as e:
        logger.warning(f"Auth router failed: {e}")
    try:
        from .routers import projects
        application.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
    except ImportError as e:
        logger.warning(f"Projects router failed: {e}")
    try:
        from .routers import tasks
        application.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
    except ImportError as e:
        logger.warning(f"Tasks router failed: {e}")
    try:
        from .routers import comments
        application.include_router(comments.router, prefix="/api/comments", tags=["comments"])
    except ImportError as e:
        logger.warning(f"Comments router failed: {e}")
    try:
        from .routers import agents
        application.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])
    except ImportError as e:
        logger.warning(f"Agents router failed: {e}")
    try:
        from .routers import memory
        application.include_router(memory.router, prefix="/api/memory", tags=["memory"])
    except ImportError as e:
        logger.warning(f"Memory router failed: {e}")
    try:
        from .routers import mcp
        application.include_router(mcp.router, prefix="/api/mcp", tags=["mcp"])
    except ImportError as e:
        logger.warning(f"MCP router failed: {e}")
    try:
        from .routers import rules
        application.include_router(rules.router, prefix="/api/rules", tags=["rules"])
    except ImportError as e:
        logger.warning(f"Rules router failed: {e}")
    try:
        from .routers import project_templates
        application.include_router(project_templates.router, prefix="/api/templates", tags=["templates"])
    except ImportError as e:
        logger.warning(f"Project templates router failed: {e}")
    try:
        from .routers import audit_logs
        application.include_router(audit_logs.router, prefix="/api/audit-logs", tags=["audit-logs"])
    except ImportError as e:
        logger.warning(f"Audit logs router failed: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Task Manager backend startup initiated.")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database initialized.")
    except Exception as e:
        logger.error(f"Database init failed: {e}")
        raise

    server_addr = os.getenv("MCP_SERVER_ADDRESS", "http://localhost:8000")
    cursor_info = {
        "mcp_server": server_addr,
        "openapi_url": f"{server_addr}/openapi.json",
        "tools_url": f"{server_addr}/mcp-docs"
    }
    logger.info(f"MCP running at {server_addr}")
    logger.info(f"Cursor IDE JSON: {json.dumps(cursor_info)}")
    yield

app = FastAPI(
    title="Task Manager API",
    version="2.0.0",
    description="Task Manager with MCP integration",
    openapi_url="/openapi.json",
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
init_middleware(app)

from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    html_content = get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
    )
    return Response(content=html_content.body, media_type="text/html")

@app.get("/redoc", include_in_schema=False)
async def custom_redoc_html():
    html_content = get_redoc_html(
        openapi_url=app.openapi_url,
        title=app.title + " - ReDoc",
    )
    return Response(content=html_content.body, media_type="text/html")

include_app_routers(app)

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
except Exception as e:
    logger.warning(f"Pydantic model rebuild failed: {e}")

if FastApiMCP is not None:
    mcp = FastApiMCP(app, name="Task Manager MCP", description="MCP server for task manager")
    mcp.mount()
    app.state.mcp_instance = mcp
else:
    class MockMCP: tools = {}
    app.state.mcp_instance = MockMCP()

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Task Manager API"}

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check(db: Session = Depends(get_db)) -> Dict[str, str]:
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check DB error: {e}")
        return {"status": "healthy", "database": "error"}

@app.get("/test-mcp")
async def test_mcp(request: Request) -> Dict[str, Any]:
    return {
        "message": "MCP Test Endpoint",
        "headers": dict(request.headers),
        "client_host": request.client.host if request.client else "unknown"
    }

@app.get("/mcp-docs", tags=["MCP"])
async def mcp_docs(request: Request):
    mcp_instance = getattr(request.app.state, "mcp_instance", None)
    tools = getattr(mcp_instance, "tools", {}) if mcp_instance else {}
    routes = []
    for route in request.app.routes:
        if route.path in ["/openapi.json", "/docs", "/redoc"]:
            continue
        methods = list(route.methods) if hasattr(route, "methods") else []
        routes.append({
            "path": route.path,
            "name": getattr(route, "name", ""),
            "description": getattr(route, "description", ""),
            "methods": methods
        })
    md = ["# MCP Project Manager Tools Documentation\n", "## Tools"]
    for tool_name, tool_info in (tools.items() if isinstance(tools, dict) else []):
        md.append(f"- **{tool_name}**: {tool_info.get('description', '')}")
    if not tools:
        md.append("No tools registered.\n")
    md.append("\n## Routes")
    for r in routes:
        md.append(f"- `{r['path']}` ({', '.join(r['methods'])}): {r['name']} - {r['description']}")
    return {
        "tools": tools,
        "routes": routes,
        "mcp_project_manager_tools_documentation": "\n".join(md)
    }
