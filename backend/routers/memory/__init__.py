"""
Memory router module.
Provides memory/knowledge graph management capabilities.
"""

from fastapi import APIRouter
from .memory import router as memory_router

# Create main router and include sub-routers
router = APIRouter()
router.include_router(memory_router, prefix="", tags=["memory"])
