"""
Projects router module.
Combines all project-related routers.
"""

from fastapi import APIRouter

# Import individual routers
try:
    from .core import router as core_router
except ImportError as e:
    print(f"Warning: Could not import projects core router: {e}")
    raise e

try:
    from .files import router as files_router
except ImportError as e:
    print(f"Warning: Could not import projects files router: {e}")
    raise e

try:
    from .planning import router as planning_router
except ImportError as e:
    print(f"Warning: Could not import projects planning router: {e}")
    raise e

# Create main router and include sub-routers
router = APIRouter()
router.include_router(core_router, prefix="", tags=["projects-core"])
router.include_router(files_router, prefix="/files", tags=["projects-files"])
router.include_router(planning_router, prefix="/planning", tags=["projects-planning"])
