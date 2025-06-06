# Task ID: <taskId> | Role: ImplementationSpecialist | Request ID: <requestId>

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
import logging

from ...database import get_db
from ...services.project_service import ProjectService
from ...services.audit_log_service import AuditLogService
# Import specific schema classes from their files
from ...schemas.project import Project, ProjectCreate, ProjectUpdate
# Import standardized API response models
from ...schemas.api_responses import (
    DataResponse,
    ListResponse,
    ErrorResponse,
)
# Import service exceptions
from ...services.exceptions import (
    EntityNotFoundError,
)
from ...auth import get_current_active_user, RoleChecker
from ...enums import UserRoleEnum
from ...models import User as UserModel  # For type hinting current_user


router = APIRouter(
    prefix="",  # This router handles the root /projects path - no trailing slash
    tags=["Projects"],
)  # Dependency to get ProjectService instance


def get_project_service(db: Session = Depends(get_db)) -> ProjectService:
    return ProjectService(db)  # Dependency for AuditLogService


def get_audit_log_service(db: Session = Depends(get_db)) -> AuditLogService:
    return AuditLogService(db)


@router.post(
    "/",
    response_model=DataResponse[Project],
    status_code=status.HTTP_201_CREATED,
    summary="Create Project",
    operation_id="create_project",
    dependencies=[Depends(RoleChecker([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]))],
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        409: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)  # Allow ADMIN and MANAGER
async def create_project(
    project: ProjectCreate,
    project_service: ProjectService = Depends(get_project_service),
    current_user: UserModel = Depends(get_current_active_user),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Creates a new project. Requires ADMIN or MANAGER role.

    Optionally uses a project template.

    - **name**: Unique name for the project (required).
    - **description**: Optional description.
    - **template_id**: Optional ID of a project template to use.
    """
    try:
        db_project = await project_service.create_project(
            project=project,
            created_by_user_id=current_user.id,
        )
        # Convert the SQLAlchemy model while the object is attached to the session
        project_data = Project.model_validate(db_project)
        project_id = project_data.id
        project_name = project_data.name  # Log project creation
        await audit_log_service.create_log(
            action="create_project",
            user_id=current_user.id,
            details={"project_id": project_id, "project_name": project_name}
        )  # Return standardized response with the Pydantic model
        return DataResponse[Project](
            data=project_data,
            message="Project created successfully"
        )
    except Exception as e:  # Allow global handlers to manage errors
        logging.error(f"Error in create_project: {e}")
        raise


@router.get(
    "/",
    response_model=ListResponse[Project],
    summary="List Projects",
    operation_id="list_projects",
    dependencies=[Depends(get_current_active_user)],
)
async def get_project_list(
    skip: int = Query(0, ge=0, description="Number of records to skip."),
    limit: int = Query(100, gt=0, description="Maximum records to return."),
    search: Optional[str] = None,
    project_status: Optional[str] = None,
    is_archived: Optional[bool] = Query(
        None,
        description=(
            "Filter by archived status. False for non-archived, "
            "True for archived, null/None for all."
        ),
    ),
    project_service: ProjectService = Depends(get_project_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Retrieves a list of projects."""
    try:  # Get all projects matching filters for total count
        all_matching_projects = await project_service.get_projects(
            skip=0,
            limit=None,
            search=search,
            status=project_status,
            is_archived=is_archived,
        )
        total = len(all_matching_projects)
        projects = await project_service.get_projects(
            skip=skip,
            limit=limit,
            search=search,
            status=project_status,
            is_archived=is_archived,
        )
        pydantic_projects = [Project.model_validate(project) for project in projects]
        return ListResponse[Project](
            data=pydantic_projects,
            total=total,
            page=skip // limit + 1,
            page_size=limit,
            has_more=skip + len(projects) < total,
            message=f"Retrieved {len(projects)} projects"
        )
    except Exception as e:  # Log unexpected errors
        logging.error(f"Error in get_project_list: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving projects: {str(e)}"
        )


@router.get(
    "/{project_id}",
    response_model=DataResponse[Project],
    summary="Get Project by ID",
    operation_id="get_project_by_id",
    responses={
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def get_project_by_id_endpoint(
    project_id: str,
    is_archived: Optional[bool] = Query(
        False,
        description=(
            "Set to true to fetch if archived, null/None to fetch regardless of status."
        ),
    ),
    project_service: ProjectService = Depends(get_project_service)
):
    """Retrieves a specific project by its ID."""
    try:
        db_project = await project_service.get_project(
            project_id=project_id, is_archived=is_archived
        )  # Return standardized response
        return DataResponse[Project](
            data=Project.model_validate(db_project),
            message=f"Project '{db_project.name}' retrieved successfully"
        )
    except EntityNotFoundError:  # Status message based on filter
        status_search_message = ""
        if is_archived is True:
            status_search_message = " (archived)"
        elif is_archived is False:
            status_search_message = " (active)"

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project not found{status_search_message}"
        )
    except Exception as e:  # Log unexpected errors
        logging.error(f"Error in get_project_by_id_endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving project: {str(e)}"
        )


@router.put(
    "/{project_id}",
    response_model=DataResponse[Project],
    summary="Update Project",
    operation_id="update_project_by_id",
    responses={
        400: {"model": ErrorResponse},
        403: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        409: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    project_service: ProjectService = Depends(get_project_service),
    current_user: UserModel = Depends(get_current_active_user),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Update a project by ID."""
    try:
        # First get the project to check ownership
        db_project = await project_service.get_project(project_id=project_id)

        # Check ownership/permissions
        if current_user.role not in [UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]:
            # For regular users, check if they created the project
            if db_project.created_by != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have permission to update this project"
                )

        # Proceed with update
        db_project = await project_service.update_project(
            project_id=project_id,
            project_update=project_update,
        )
        await audit_log_service.create_log(
            action="update_project",
            user_id=current_user.id,
            details={
                "project_id": project_id,
                "changes": project_update.model_dump(exclude_unset=True),
            },
        )
        return DataResponse[Project](
            data=Project.model_validate(db_project),
            message="Project updated successfully"
        )
    except Exception as e:
        logging.error(f"Unexpected error in PUT /projects/{project_id}: {e}")
        raise


@router.get(
    "/{project_id}/export",
    response_model=DataResponse[dict],
    summary="Export Project",
    operation_id="export_project",
)
async def export_project_endpoint(
    project_id: str,
    project_service: ProjectService = Depends(get_project_service),
):
    """Return project details with tasks and members."""
    try:
        export_data = await project_service.export_project(project_id)
        return DataResponse[dict](
            data=export_data,
            message="Project exported successfully",
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logging.error(f"Error in GET /projects/{project_id}/export: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@router.delete(
    "/{project_id}",
    response_model=DataResponse[bool],
    summary="Delete Project",
    operation_id="delete_project_by_id",
    responses={
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def delete_project(
    project_id: str,
    project_service: ProjectService = Depends(get_project_service)
):
    """Delete a project by ID."""
    try:
        db_project = await project_service.delete_project(project_id=project_id)
        if db_project is None:
            # Use EntityNotFoundError from services
            raise EntityNotFoundError("Project", project_id)
        return DataResponse[bool](
            data=True,
            message="Project deleted successfully"
        )
    except Exception as e:
        logging.error(f"Unexpected error in DELETE /projects/{project_id}: {e}")
        raise


@router.post(
    "/{project_id}/archive",
    response_model=DataResponse[Project],
    summary="Archive Project",
    operation_id="archive_project",
    responses={
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def archive_project(
    project_id: str,
    project_service: ProjectService = Depends(get_project_service),
    current_user: UserModel = Depends(get_current_active_user),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Archive a project by setting is_archived to True."""
    try:  # Use the update_project method with is_archived=True
        project_update = ProjectUpdate(is_archived=True)
        db_project = await project_service.update_project(
            project_id=project_id, project_update=project_update
        )  # Log project archive
        await audit_log_service.create_log(
            action="archive_project",
            user_id=current_user.id,
            details={"project_id": project_id}
        )  # Return standardized response
        return DataResponse[Project](
            data=Project.model_validate(db_project),
            message="Project archived successfully"
        )
    except Exception as e:
        logging.error(
            f"Unexpected error in POST /projects/{project_id}/archive: {e}"
        )
        raise


@router.post(
    "/{project_id}/unarchive",
    response_model=DataResponse[Project],
    summary="Unarchive Project",
    operation_id="unarchive_project",
    responses={
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def unarchive_project(
    project_id: str,
    project_service: ProjectService = Depends(get_project_service),
    current_user: UserModel = Depends(get_current_active_user),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Unarchive a project by setting is_archived to False."""
    try:  # Use the update_project method with is_archived=False
        project_update = ProjectUpdate(is_archived=False)
        db_project = await project_service.update_project(
            project_id=project_id, project_update=project_update
        )  # Log project unarchive
        await audit_log_service.create_log(
            action="unarchive_project",
            user_id=current_user.id,
            details={"project_id": project_id}
        )  # Return standardized response
        return DataResponse[Project](
            data=Project.model_validate(db_project),
            message="Project unarchived successfully"
        )
    except Exception as e:
        logging.error(
            f"Unexpected error in POST /projects/{project_id}/unarchive: {e}"
        )
        raise
