from fastapi import APIRouter

from .roles import router as roles_router
from .capabilities import router as capabilities_router
from .forbidden_actions import router as forbidden_actions_router
from .handoff_criteria import router as handoff_criteria_router

router = APIRouter()
router.include_router(roles_router)
router.include_router(capabilities_router)
router.include_router(forbidden_actions_router)
router.include_router(handoff_criteria_router)
