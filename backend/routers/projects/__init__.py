"""
Projects router module.
Combines all project-related routers.
"""

from fastapi import APIRouter

# Import individual routers
try:
    from .core import router as core_router, get_project_service, get_audit_log_service
    from auth import get_current_active_user
except ImportError:
    print("Warning: Could not import projects core router")
    core_router = APIRouter()
    get_project_service = None
    get_audit_log_service = None
    get_current_active_user = None

try:
    from .members import router as members_router
except ImportError:
    print("Warning: Could not import projects members router")
    members_router = APIRouter()

try:
    from .files import router as files_router
except ImportError:
    print("Warning: Could not import projects files router")
    files_router = APIRouter()

try:
    from .planning import router as planning_router
except ImportError:
    print("Warning: Could not import projects planning router")
    planning_router = APIRouter()

# Create main router and include sub-routers
router = APIRouter()
router.include_router(core_router, prefix="", tags=["projects-core"])
router.include_router(members_router, prefix="/members", tags=["projects-members"])
router.include_router(files_router, prefix="/files", tags=["projects-files"])
router.include_router(planning_router, prefix="/planning", tags=["projects-planning"])
