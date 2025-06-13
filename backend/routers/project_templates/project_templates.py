# Task ID: <taskId>  # Agent Role: ImplementationSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List, Optional

from database import get_db
from auth import get_current_active_user
from services.project_template_service import ProjectTemplateService
from schemas.project_template import (
    ProjectTemplate,
    ProjectTemplateCreate,
    ProjectTemplateUpdate
)
from schemas.api_responses import DataResponse, ListResponse
from models import User as UserModel

router = APIRouter(
    prefix="/project-templates",
    tags=["Project Templates"],
    dependencies=[Depends(get_current_active_user)]
)

async def get_project_template_service(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> ProjectTemplateService:
    return ProjectTemplateService(db)

@router.get(
    "/",
    response_model=ListResponse[ProjectTemplate],
    summary="Get Project Templates",
    operation_id="get_project_templates"
)
async def get_templates(
    skip: Annotated[int, Query(0, ge=0, description="Number of templates to skip")],
    limit: Annotated[int, Query(100, ge=1, le=100, description="Maximum number of templates to return")],
    template_service: Annotated[ProjectTemplateService, Depends(get_project_template_service)]
):
    """Get all project templates with pagination."""
    try:
        templates = template_service.get_templates(skip=skip, limit=limit)
        return ListResponse(
            data=templates,
            total=len(templates),
            message="Project templates retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving project templates: {str(e)}"
        )

@router.get(
    "/{template_id}",
    response_model=DataResponse[ProjectTemplate],
    summary="Get Project Template",
    operation_id="get_project_template"
)
async def get_template(
    template_id: Annotated[str, Path(description="Template ID")],
    template_service: Annotated[ProjectTemplateService, Depends(get_project_template_service)]
):
    """Get a specific project template by ID."""
    try:
        template = template_service.get_template(template_id)
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project template not found"
            )
        return DataResponse(
            data=template,
            message="Project template retrieved successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving project template: {str(e)}"
        )

@router.post(
    "/",
    response_model=DataResponse[ProjectTemplate],
    status_code=status.HTTP_201_CREATED,
    summary="Create Project Template",
    operation_id="create_project_template"
)
async def create_template(
    template: ProjectTemplateCreate,
    template_service: Annotated[ProjectTemplateService, Depends(get_project_template_service)],
    current_user: Annotated[UserModel, Depends(get_current_active_user)]
):
    """Create a new project template."""
    try:
        new_template = template_service.create_template(template)
        return DataResponse(
            data=new_template,
            message="Project template created successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating project template: {str(e)}"
        )

@router.put(
    "/{template_id}",
    response_model=DataResponse[ProjectTemplate],
    summary="Update Project Template",
    operation_id="update_project_template"
)
async def update_template(
    template_id: Annotated[str, Path(description="Template ID")],
    template_update: ProjectTemplateUpdate,
    template_service: Annotated[ProjectTemplateService, Depends(get_project_template_service)],
    current_user: Annotated[UserModel, Depends(get_current_active_user)]
):
    """Update an existing project template."""
    try:
        updated_template = template_service.update_template(template_id, template_update)
        if not updated_template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project template not found"
            )
        return DataResponse(
            data=updated_template,
            message="Project template updated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error updating project template: {str(e)}"
        )

@router.delete(
    "/{template_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Project Template",
    operation_id="delete_project_template"
)
async def delete_template(
    template_id: Annotated[str, Path(description="Template ID")],
    template_service: Annotated[ProjectTemplateService, Depends(get_project_template_service)],
    current_user: Annotated[UserModel, Depends(get_current_active_user)]
):
    """Delete a project template."""
    try:
        success = template_service.delete_template(template_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project template not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting project template: {str(e)}"
        )
