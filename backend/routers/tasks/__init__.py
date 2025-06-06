"""
Tasks router module.
Combines all task-related routers.
"""

from fastapi import APIRouter
from .core.core import router as core_router

# Create main router and include sub-routers
router = APIRouter()
router.include_router(core_router, prefix="", tags=["tasks-core"])
