<<<<<<< HEAD
"""Aggregate routers for agent roles and related resources."""

=======
>>>>>>> origin/codex/add-agent-capability-service-and-router
from fastapi import APIRouter

from .roles import router as roles_router
from .capabilities import router as capabilities_router
from .forbidden_actions import router as forbidden_actions_router
<<<<<<< HEAD
from .handoff_criteria import router as handoff_criteria_router
from .verification_requirements import router as verification_requirements_router

router = APIRouter()
router.include_router(roles_router, prefix="/roles", tags=["agent-roles"])
router.include_router(capabilities_router, prefix="/roles", tags=["agent-capabilities"])
router.include_router(
    forbidden_actions_router,
    prefix="/roles",
    tags=["agent-forbidden-actions"],
)
router.include_router(handoff_criteria_router)
router.include_router(verification_requirements_router)
=======

router = APIRouter(prefix="/roles")
router.include_router(roles_router)
router.include_router(capabilities_router)
router.include_router(forbidden_actions_router)
>>>>>>> origin/codex/add-agent-capability-service-and-router
