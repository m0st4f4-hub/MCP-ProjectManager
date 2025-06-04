from fastapi import APIRouter
from .core.core import router as core_router
from .auth.auth import router as auth_router

router = APIRouter()
router.include_router(core_router)
router.include_router(auth_router)
