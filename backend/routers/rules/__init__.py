from fastapi import APIRouter
from .workflows.workflows import router as workflows_router
from .violations.violations import router as violations_router
from .violations.error_protocols import router as error_protocols_router

router = APIRouter()
router.include_router(workflows_router)
router.include_router(violations_router)
router.include_router(error_protocols_router)
