from fastapi import APIRouter
from .core.core import router as core_router

router = APIRouter()
router.include_router(core_router)
