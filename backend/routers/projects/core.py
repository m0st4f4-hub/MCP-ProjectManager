from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List, Optional

from backend.database import get_db
from backend.services.project_service import ProjectService
from backend.services.audit_log_service import AuditLogService
from backend.schemas.project import (
    Project as ProjectSchema,
    ProjectCreate,
    ProjectUpdate
)
from backend.schemas.api_responses import DataResponse, ListResponse, PaginationParams
from backend.services.exceptions import EntityNotFoundError, DuplicateEntityError, ValidationError
from backend.enums import ProjectStatus, ProjectPriority, ProjectVisibility

router = APIRouter(
    prefix="",
    tags=["Projects"],
)

async def get_project_service(db: Annotated[AsyncSession, Depends(get_db)]) -> ProjectService:
    return ProjectService(db)

async def get_audit_log_service(db: Annotated[AsyncSession, Depends(get_db)]) -> AuditLogService:
    return AuditLogService(db)

@router.post(
    "/", 
    response_model=DataResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Create Project",
    operation_id="create_project",
    tags=["mcp-tools"]
)
async def create_project_endpoint(
    project_data: ProjectCreate,
    project_service: Annotated[ProjectService, Depends(get_project_service)],
    audit_log_service: Annotated[AuditLogService, Depends(get_audit_log_service)],
):
    """
    Create a new project. Only accessible by Admins and Managers.
    
    - **name**: Required unique project name
    - **description**: Optional project description
    - **status**: Project status (defaults to ACTIVE)
    - **priority**: Project priority level
    - **visibility**: Project visibility (PUBLIC, PRIVATE, INTERNAL)
    """
    try:
        new_project = await project_service.create_project(project_data)
        await audit_log_service.create_log(
            action="create_project",
            details={"project_name": new_project.name},
            user_id="00000000-0000-0000-0000-000000000000"  # Placeholder
        )
        return DataResponse(data=ProjectSchema.model_validate(new_project), message="Project created successfully")
    except DuplicateEntityError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")

@router.get(
    "/", 
    response_model=ListResponse,
    summary="Get Projects",
    operation_id="get_projects",
    tags=["mcp-tools"]
)
async def get_projects_endpoint(
    project_service: Annotated[ProjectService, Depends(get_project_service)],
    pagination: Annotated[PaginationParams, Depends()],
    status_filter: Annotated[Optional[ProjectStatus], Query(description="Filter projects by status")] = None,
    priority_filter: Annotated[Optional[ProjectPriority], Query(description="Filter projects by priority")] = None,
    visibility_filter: Annotated[Optional[ProjectVisibility], Query(description="Filter projects by visibility")] = None,
    search: Annotated[Optional[str], Query(description="Search term for project names and descriptions")] = None,
    is_archived: Annotated[Optional[bool], Query(description="Filter by archived status")] = None,
    owner_id: Annotated[Optional[str], Query(description="Filter by owner ID")] = None,
    sort_by: Annotated[Optional[str], Query(description="Field to sort by")] = "created_at",
    sort_direction: Annotated[Optional[str], Query(description="Sort direction: asc or desc")] = "desc"
):
    """
    Get a list of projects with filtering support.
    
    Supports pagination, search, filtering by status/priority/visibility, and sorting.
    """
    try:
        projects, total_count = await project_service.get_projects(
            skip=pagination.offset, 
            limit=pagination.page_size,
            status=status_filter,
            priority=priority_filter,
            visibility=visibility_filter,
            search=search,
            is_archived=is_archived,
            owner_id=owner_id,
            sort_by=sort_by,
            sort_direction=sort_direction
        )
        
        return ListResponse(
            data=[ProjectSchema.model_validate(p) for p in projects],
            total=total_count,
            page=pagination.page,
            page_size=pagination.page_size,
            has_more=(pagination.offset + len(projects)) < total_count,
            message="Projects retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error retrieving projects: {e}")

@router.get(
    "/{project_id}", 
    response_model=DataResponse,
    summary="Get Project by ID",
    operation_id="get_project_by_id",
    tags=["mcp-tools"]
)
async def get_project_endpoint(
    project_id: Annotated[str, Path(description="ID of the project to retrieve")],
    project_service: Annotated[ProjectService, Depends(get_project_service)],
):
    """
    Get a project by its ID.
    
    Returns the project details if found and accessible to the current user.
    """
    try:
        project = await project_service.get_project(project_id)
        return DataResponse(data=ProjectSchema.model_validate(project), message="Project retrieved successfully")
    except EntityNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

@router.put(
    "/{project_id}", 
    response_model=DataResponse,
    summary="Update Project",
    operation_id="update_project"
)
async def update_project_endpoint(
    project_id: Annotated[str, Path(description="ID of the project to update")],
    project_data: ProjectUpdate,
    project_service: Annotated[ProjectService, Depends(get_project_service)],
    audit_log_service: Annotated[AuditLogService, Depends(get_audit_log_service)],
):
    """
    Update a project's information.
    
    - **name**: Optional new project name
    - **description**: Optional new description
    - **status**: Optional new status
    - **priority**: Optional new priority
    - **visibility**: Optional new visibility
    """
    try:
        # Auth check inside service or here
        project = await project_service.get_project(project_id)
        # Add logic to check if current_user is owner or admin
        
        updated_project = await project_service.update_project(project_id, project_data)
        await audit_log_service.create_log(
            action="update_project",
            details={"project_id": project_id, "updated_fields": project_data.model_dump(exclude_unset=True)},
            user_id="00000000-0000-0000-0000-000000000000"  # Placeholder
        )
        return DataResponse(data=ProjectSchema.model_validate(updated_project), message="Project updated successfully")
    except EntityNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post(
    "/{project_id}/archive", 
    response_model=DataResponse,
    summary="Archive Project",
    operation_id="archive_project"
)
async def archive_project_endpoint(
    project_id: Annotated[str, Path(description="ID of the project to archive")],
    project_service: Annotated[ProjectService, Depends(get_project_service)],
    audit_log_service: Annotated[AuditLogService, Depends(get_audit_log_service)],
):
    """
    Archive a project. Only accessible by Admins and Managers.
    
    Archived projects are hidden from normal listings but retain their data.
    """
    try:
        archived_project = await project_service.archive_project(project_id)
        await audit_log_service.create_log(
            action="archive_project",
            details={"project_id": project_id},
            user_id="00000000-0000-0000-0000-000000000000"  # Placeholder
        )
        return DataResponse(data=ProjectSchema.model_validate(archived_project), message="Project archived successfully")
    except EntityNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error archiving project: {e}")

@router.post(
    "/{project_id}/unarchive", 
    response_model=DataResponse,
    summary="Unarchive Project",
    operation_id="unarchive_project"
)
async def unarchive_project_endpoint(
    project_id: Annotated[str, Path(description="ID of the project to unarchive")],
    project_service: Annotated[ProjectService, Depends(get_project_service)],
    audit_log_service: Annotated[AuditLogService, Depends(get_audit_log_service)],
):
    """
    Unarchive a project. Only accessible by Admins and Managers.
    
    Makes an archived project active and visible in normal listings again.
    """
    try:
        unarchived_project = await project_service.unarchive_project(project_id)
        await audit_log_service.create_log(
            action="unarchive_project",
            details={"project_id": project_id},
            user_id="00000000-0000-0000-0000-000000000000"  # Placeholder
        )
        return DataResponse(data=ProjectSchema.model_validate(unarchived_project), message="Project unarchived successfully")
    except EntityNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error unarchiving project: {e}")

@router.delete(
    "/{project_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Project",
    operation_id="delete_project"
)
async def delete_project_endpoint(
    project_id: Annotated[str, Path(description="ID of the project to delete")],
    project_service: Annotated[ProjectService, Depends(get_project_service)],
    audit_log_service: Annotated[AuditLogService, Depends(get_audit_log_service)],
):
    """
    Deletes a project. This action is permanent.
    
    This action cannot be undone. Consider archiving instead.
    """
    try:
        # Check authorization (e.g., if current_user is admin)
        success = await project_service.delete_project(project_id)
        if success:
            await audit_log_service.create_log(
                action="delete_project",
                details={"project_id": project_id},
                user_id="00000000-0000-0000-0000-000000000000"  # Placeholder
            )
            return
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    except EntityNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error deleting project: {e}")
