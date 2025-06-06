from fastapi import APIRouter
from .workflows.workflows import router as workflows_router
from .violations.violations import router as violations_router
from .violations.error_protocols import router as error_protocols_router
from .templates.templates import router as templates_router
from .roles import router as roles_router
from .mandates.mandates import router as mandates_router
from .logs.logs import router as logs_router
from .roles.verification_requirements import (
    router as verification_requirements_router,
)

router = APIRouter()
router.include_router(workflows_router)
router.include_router(violations_router)
router.include_router(error_protocols_router)
router.include_router(templates_router)
router.include_router(roles_router)
router.include_router(mandates_router)
router.include_router(logs_router)
router.include_router(verification_requirements_router)
