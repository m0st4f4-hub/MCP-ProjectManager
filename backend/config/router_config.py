"""
Router configuration module.
"""

from fastapi import FastAPI

# Import routers
from backend.routers.projects import router as projects_router
from backend.routers.agents import router as agents_router
from backend.routers.audit_logs import router as audit_logs_router
from backend.routers.tasks import router as tasks_router
from backend.routers.rules import router as rules_router
from backend.routers.memory import router as memory_router
from backend.routers.mcp import router as mcp_tools_router


def configure_routers(app: FastAPI):
    """Configure and include all routers in the FastAPI app."""
    
    # API v1 routers
    routers = [
        (projects_router, "projects"),
        (tasks_router, "tasks"),
        (agents_router, "agents"),
        (audit_logs_router, "audit"),
        (rules_router, "rules"),
        (memory_router, "memory"),
        (mcp_tools_router, "mcp-tools"),
    ]
    
    for router, tag in routers:
        app.include_router(
            router, 
            prefix="/api/v1",
            tags=[tag.title()]
        )
