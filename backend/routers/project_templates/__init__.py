from fastapi import APIRouter
from .project_templates import router as project_templates_router

router = APIRouter()
router.include_router(project_templates_router)
