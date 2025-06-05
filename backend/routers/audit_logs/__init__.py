from fastapi import APIRouter
from .core import router as core_router

router = APIRouter()
router.include_router(core_router)
