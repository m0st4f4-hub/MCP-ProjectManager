"""
Tasks router module.
Combines all task-related routers.
"""

from fastapi import APIRouter

# Import minimal working router for now
try:
    from .minimal import router as core_router
    print("Successfully imported tasks minimal router")
except ImportError as e:
    print(f"Warning: Could not import tasks minimal router: {e}")
    core_router = APIRouter()

# Create main router and include sub-routers
router = APIRouter()
router.include_router(core_router, prefix="", tags=["tasks-core"])
