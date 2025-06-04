# Task ID: <taskId>  # Agent Role: ImplementationSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ....database import get_sync_db as get_db
from ....auth import get_current_active_user
from ....services.project_template_service import ProjectTemplateService
from ....schemas.project_template import (
    ProjectTemplate,
    ProjectTemplateCreate,
    ProjectTemplateUpdate  # Import auth dependencies and UserRoleEnum for protection
)
from ....models import User as UserModel  # For type hinting current_user

router = APIRouter(
    prefix="/project-templates",
    tags=["Project Templates"],  # Protect all template management endpoints, maybe ADMIN only?
    dependencies=[Depends(get_current_active_user)]  # Require authentication for all template operations
)

def get_project_template_service(db: Session = Depends(get_db)) -> ProjectTemplateService:
    return ProjectTemplateService(db)

@router.post("/", response_model=ProjectTemplate, status_code=status.HTTP_201_CREATED)


def create_project_template(
    template: ProjectTemplateCreate,
    project_template_service: ProjectTemplateService = Depends(get_project_template_service),
    current_user: UserModel = Depends(get_current_active_user)  # Inject user for logging/context
):
    """Create a new project template.

    Requires authentication.
    """  # Optional: Add role check here if only certain roles can create templates  # E.g., Depends(RoleChecker([UserRoleEnum.ADMIN]))

    db_template = project_template_service.get_template_by_name(name=template.name)
    if db_template:
        raise HTTPException(status_code=400, detail="Project template name already exists")

    return project_template_service.create_template(template)

@router.get("/", response_model=List[ProjectTemplate])


def read_project_templates(
    skip: int = 0,
    limit: int = 100,
    project_template_service: ProjectTemplateService = Depends(get_project_template_service)
):
    """Retrieve a list of project templates.

    Requires authentication.
    """
    return project_template_service.get_templates(skip=skip, limit=limit)

@router.get("/{template_id}", response_model=ProjectTemplate)


def read_project_template(
    template_id: str,
    project_template_service: ProjectTemplateService = Depends(get_project_template_service)
):
    """Retrieve a single project template by ID.

    Requires authentication.
    """
    db_template = project_template_service.get_template(template_id)
    if db_template is None:
        raise HTTPException(status_code=404, detail="Project template not found")
    return db_template

@router.put("/{template_id}", response_model=ProjectTemplate)


def update_project_template(
    template_id: str,
    template_update: ProjectTemplateUpdate,
    project_template_service: ProjectTemplateService = Depends(get_project_template_service),
    current_user: UserModel = Depends(get_current_active_user)  # Inject user for logging/context
):
    """Update a project template by ID.

    Requires authentication. Optional: Add role check here.
    """
    db_template = project_template_service.update_template(template_id, template_update)
    if db_template is None:
        raise HTTPException(status_code=404, detail="Project template not found")
    return db_template

@router.delete("/{template_id}", response_model=dict)


def delete_project_template(
    template_id: str,
    project_template_service: ProjectTemplateService = Depends(get_project_template_service),
    current_user: UserModel = Depends(get_current_active_user)  # Inject user for logging/context
):
    """Delete a project template by ID.

    Requires authentication. Optional: Add role check here.
    """
    success = project_template_service.delete_template(template_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project template not found")
    return {"message": "Project template deleted successfully"}
