from fastapi import APIRouter
from .roles import router as roles_router
from .capabilities import router as capabilities_router
from .forbidden_actions import router as forbidden_actions_router

router = APIRouter()
router.include_router(roles_router, prefix="", tags=["agent-roles"])
router.include_router(
    capabilities_router,
    prefix="",
    tags=["agent-capabilities"],
)
router.include_router(
    forbidden_actions_router,
    prefix="",
    tags=["agent-forbidden-actions"],
)
