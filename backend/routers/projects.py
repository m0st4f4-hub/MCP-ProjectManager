# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from starlette.responses import JSONResponse
import uuid

from ..database import get_db
from ..services.project_service import ProjectService
from ..services.task_service import TaskService
from ..services.agent_service import AgentService
from ..services.project_member_service import ProjectMemberService
from ..services.project_file_association_service import ProjectFileAssociationService
from ..services.task_file_association_service import TaskFileAssociationService
from ..services.task_dependency_service import TaskDependencyService
from .. import models
from . import tasks # Import tasks router

# Import specific schema classes from their files
from backend.schemas.project import Project, ProjectCreate, ProjectUpdate, ProjectFileAssociation, ProjectFileAssociationCreate # Correct import location

# Import standardized API response models
from backend.schemas.api_responses import DataResponse, ListResponse, ErrorResponse, PaginationParams

# Import service exceptions
from backend.services.exceptions import EntityNotFoundError, DuplicateEntityError, ValidationError

# Import auth dependencies and UserRoleEnum
from backend.auth import get_current_active_user, RoleChecker
from backend.enums import UserRoleEnum
from backend.models import User as UserModel # For type hinting current_user

# Import AuditLogService
from backend.services.audit_log_service import AuditLogService

# Import Pydantic for bulk association schema
from pydantic import BaseModel

# Define schema for bulk file association input
class BulkFileAssociationInput(BaseModel):
    file_memory_entity_ids: List[int]

router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)

# Dependency to get ProjectService instance


def get_project_service(db: Session = Depends(get_db)) -> ProjectService:
    return ProjectService(db)

# Dependency to get TaskService instance


def get_task_service(db: Session = Depends(get_db)) -> TaskService:
    return TaskService(db)

# Dependency to get AgentService instance


def get_agent_service(db: Session = Depends(get_db)) -> AgentService:
    return AgentService(db)

# Dependency to get ProjectMemberService instance


def get_project_member_service(db: Session = Depends(get_db)) -> ProjectMemberService:
    return ProjectMemberService(db)

# Dependency to get TaskFileAssociationService instance


def get_task_file_association_service(db: Session = Depends(get_db)) -> TaskFileAssociationService:
    return TaskFileAssociationService(db)

# Dependency to get TaskDependencyService instance


def get_task_dependency_service(db: Session = Depends(get_db)) -> TaskDependencyService:
    return TaskDependencyService(db)

# Dependency to get ProjectFileAssociationService instance


def get_project_file_association_service(db: Session = Depends(get_db)) -> ProjectFileAssociationService:
    return ProjectFileAssociationService(db)

# Dependency for AuditLogService
def get_audit_log_service(db: Session = Depends(get_db)) -> AuditLogService:
    return AuditLogService(db)


@router.post("/", response_model=DataResponse[Project], summary="Create Project", operation_id="create_project",
             dependencies=[Depends(RoleChecker([UserRoleEnum.ADMIN]))]) # Protect endpoint
def create_project(
    project: ProjectCreate,
    project_service: ProjectService = Depends(get_project_service),
    current_user: UserModel = Depends(get_current_active_user), # Inject current user
    audit_log_service: AuditLogService = Depends(get_audit_log_service) # Inject AuditLogService
):
    """Creates a new project. Requires ADMIN role.

    Optionally uses a project template.

    - **name**: Unique name for the project (required).
    - **description**: Optional description.
    - **template_id**: Optional ID of a project template to use.
    """
    try:
        db_project = project_service.create_project(project=project, created_by_user_id=current_user.id)
        
        # Log project creation
        audit_log_service.create_log(
            action="create_project",
            user_id=current_user.id,
            details={"project_id": db_project.id, "project_name": db_project.name}
        )
        
        # Return standardized response
        return DataResponse[Project](
            data=Project.model_validate(db_project),
            message="Project created successfully"
        )
    except DuplicateEntityError as e:
        # Convert to FastAPI HTTPException
        raise HTTPException(status_code=409, detail=str(e))
    except ValidationError as e:
        # Convert to FastAPI HTTPException
        raise HTTPException(status_code=400, detail=str(e))
    except EntityNotFoundError as e:
        # This could happen if template_id is invalid
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/", response_model=ListResponse[Project], summary="List Projects", operation_id="list_projects")
def get_project_list(
    pagination: PaginationParams = Depends(),
    search: Optional[str] = None,
    status: Optional[str] = None,
    is_archived: Optional[bool] = Query(
        None, description="Filter by archived status. False for non-archived, True for archived, null/None for all."),
    project_service: ProjectService = Depends(get_project_service)
):
    """Retrieves a list of projects."""
    try:
        # Get total count for pagination
        # Assuming you have a method to count projects with filters
        total = len(project_service.get_projects(
            skip=0, search=search, status=status, is_archived=is_archived))
        
        # Get paginated projects
        projects = project_service.get_projects(
            skip=pagination.offset, search=search, status=status, is_archived=is_archived)

        # Convert SQLAlchemy models to Pydantic models
        pydantic_projects = [Project.model_validate(
            project) for project in projects]

        # Return standardized response
        return ListResponse[Project](
            data=pydantic_projects,
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            has_more=pagination.offset + len(projects) < total,
            message=f"Retrieved {len(projects)} projects"
        )
    except Exception as e:
        # Log unexpected errors
        import logging
        logging.error(f"Error in get_project_list: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving projects: {str(e)}"
        )


@router.get("/{project_id}", response_model=DataResponse[Project], summary="Get Project by ID", operation_id="get_project_by_id")
def get_project_by_id_endpoint(
    project_id: str,
    is_archived: Optional[bool] = Query(
        False, description="Set to true to fetch if archived, null/None to fetch regardless of status."),
    project_service: ProjectService = Depends(get_project_service)
):
    """Retrieves a specific project by its ID."""
    try:
        db_project = project_service.get_project(
            project_id=project_id, is_archived=is_archived)
        
        # Return standardized response
        return DataResponse[Project](
            data=Project.model_validate(db_project),
            message=f"Project '{db_project.name}' retrieved successfully"
        )
    except EntityNotFoundError as e:
        # Status message based on filter
        status_search_message = ""
        if is_archived is True:
            status_search_message = " (archived)"
        elif is_archived is False:
            status_search_message = " (active)"
            
        raise HTTPException(
            status_code=404, 
            detail=f"Project not found{status_search_message}"
        )


@router.post("/{project_id}/archive", response_model=Project, summary="Archive Project", operation_id="archive_project")
def archive_project_endpoint(
    project_id: str,
    project_service: ProjectService = Depends(get_project_service)
):
    """Archives a project and all its active tasks."""
    try:
        archived_project = project_service.archive_project(project_id)
        if archived_project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        return archived_project
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error archiving project {project_id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to archive project: {str(e)}")


@router.post("/{project_id}/unarchive", response_model=Project, summary="Unarchive Project", operation_id="unarchive_project")
def unarchive_project_endpoint(
    project_id: str,
    project_service: ProjectService = Depends(get_project_service)
):
    """Unarchives a project and all its tasks."""
    try:
        unarchived_project = project_service.unarchive_project(project_id)
        if unarchived_project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        return unarchived_project
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error unarchiving project {project_id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to unarchive project: {str(e)}")


@router.put("/{project_id}", response_model=Project, summary="Update Project", operation_id="update_project_by_id")
def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    project_service: ProjectService = Depends(get_project_service)
):
    try:
        db_project = project_service.update_project(
            project_id=project_id, project_update=project_update)
        if db_project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        return db_project
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Unexpected error in PUT /projects/{project_id}: {e}")
        if isinstance(e.__cause__, HTTPException) or isinstance(e.args[0], HTTPException):
            http_exc = e.__cause__ if isinstance(
                e.__cause__, HTTPException) else e.args[0]
            raise http_exc
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {e}")


@router.delete("/{project_id}", response_model=Project, summary="Delete Project", operation_id="delete_project_by_id")
def delete_project(
    project_id: str,
    project_service: ProjectService = Depends(get_project_service)
):
    success = project_service.delete_project(project_id=project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return JSONResponse(content={"message": "Project deleted successfully"}, status_code=200)

# --- Placeholder for future planning endpoint (if needed outside MCP) ---
# Moved planning endpoint to projects router as it's project-related

# Need BaseModel for PlanningRequest/Response


class PlanningRequest(BaseModel):
    goal: str


class PlanningResponse(BaseModel):
    prompt: str


@router.post("/generate-planning-prompt",
             response_model=PlanningResponse,
             summary="Generate Project Manager Planning Prompt",
             tags=["Projects", "Planning"],
             operation_id="generate_project_manager_planning_prompt")
async def generate_project_manager_planning_prompt(
    request: PlanningRequest,
    agent_service: AgentService = Depends(get_agent_service)
):
    """Generates a planning prompt instructing an LLM to utilize available agents."""

    # Fetch available agents
    agents = agent_service.get_agents(skip=0, limit=200)
    agent_list_str = "\n".join(
        [f"- {agent.name} (ID: {agent.id})" for agent in agents])
    if not agent_list_str:
        agent_list_str = "- No agents found in the database."

    # Construct the enhanced prompt
    prompt_content = f"""Goal: {request.goal}

Please generate a detailed, step-by-step plan to achieve the stated goal.

Available Agents:\n{agent_list_str}\n
Plan:\n"""

    return PlanningResponse(prompt=prompt_content)


@router.post("/planning/generate-prompt", response_model=PlanningResponse, summary="Generate Project Manager Planning Prompt (Alias)", tags=["Projects", "Planning"])
async def planning_generate_prompt_alias(request: PlanningRequest, agent_service: AgentService = Depends(get_agent_service)):
    return await generate_project_manager_planning_prompt(request, agent_service)


@router.post(
    "/{project_id}/files/",
    response_model=ProjectFileAssociation,
    summary="Associate File with Project",
    tags=["Project Files"],
    operation_id="associate_file_with_project"
)
def associate_file_with_project_endpoint(
    project_id: str,
    file_association: ProjectFileAssociationCreate,
    project_file_association_service: ProjectFileAssociationService = Depends(
        get_project_file_association_service)
):
    """Associate a file with a project using its memory entity ID provided in the request body."""
    # Ensure we pass the file_memory_entity_id from the schema
    return project_file_association_service.associate_file_with_project(
        project_id=project_id,
        file_memory_entity_id=file_association.file_memory_entity_id # Pass the ID from the schema
    )

@router.get(
    "/{project_id}/files/",
    response_model=List[ProjectFileAssociation],
    summary="Get Files Associated with Project",
    tags=["Project Files"],
    operation_id="get_files_associated_with_project"
)
def get_files_associated_with_project_endpoint(
    project_id: str,
    skip: int = Query(0, description="Skip the first N associations."),
    limit: int = Query(
        100, description="Limit the number of associations returned."),
    # Removed sort_by, sort_direction, and filename filters as they were based on the old File model
    project_file_association_service: ProjectFileAssociationService = Depends(
        get_project_file_association_service)
):
    """Retrieve a list of files associated with a project."""
    # The actual filtering/sorting logic based on sort_by would need to be handled in the service layer if needed.
    # For now, we only retrieve the associations based on project_id.
    return project_file_association_service.get_files_for_project(
        project_id=project_id,
        skip=skip,
        limit=limit
    )

@router.get(
    "/{project_id}/files/{file_memory_entity_id}", # Path parameter name matches the ID
    response_model=ProjectFileAssociation,
    summary="Get Project File Association by File Memory Entity ID", # Summary reflects using ID
    tags=["Project Files"],
    operation_id="get_project_file_association_by_file_memory_entity_id" # Operation ID reflects using ID
)
def get_project_file_association_by_file_memory_entity_id_endpoint( # Function name reflects using ID
    project_id: str = Path(..., description="ID of the project."),
    file_memory_entity_id: int = Path(..., description="ID of the associated file MemoryEntity."), # Parameter name and type match path and usage
    project_service: ProjectService = Depends(get_project_service)
):
    """Retrieves a specific project file association by project ID and file memory entity ID."""
    db_association = project_service.get_project_file_association(
        project_id=project_id,
        file_memory_entity_id=file_memory_entity_id # Pass the ID from the path parameter
    )
    if db_association is None:
        raise HTTPException(status_code=404, detail="Project file association not found")
    return db_association

@router.delete(
    "/{project_id}/files/{file_memory_entity_id}", # Path parameter name matches the ID
    response_model=dict,
    summary="Disassociate File from Project by File Memory Entity ID", # Summary reflects using ID
    tags=["Project Files"],
    operation_id="disassociate_file_from_project_by_file_memory_entity_id" # Operation ID reflects using ID
)
def disassociate_file_from_project_by_file_memory_entity_id_endpoint( # Function name reflects using ID
    project_id: str = Path(..., description="ID of the project."),
    file_memory_entity_id: int = Path(..., description="ID of the associated file MemoryEntity."), # Parameter name and type match path and usage
    project_file_association_service: ProjectFileAssociationService = Depends(
        get_project_file_association_service)
):
    """Removes a specific project file association by project ID and file memory entity ID."""
    success = project_file_association_service.disassociate_file_from_project(
        project_id=project_id,
        file_memory_entity_id=file_memory_entity_id # Pass the ID from the path parameter
    )
    if not success:
        raise HTTPException(status_code=404, detail="Project file association not found")
    return {"message": "Project file association deleted successfully"}

@router.post(
    "/{project_id}/files/bulk", # New endpoint for bulk association
    response_model=List[ProjectFileAssociation],
    summary="Associate Multiple Files with Project",
    tags=["Project Files"],
    operation_id="associate_multiple_files_with_project"
)
def associate_multiple_files_with_project_endpoint(
    project_id: str,
    bulk_input: BulkFileAssociationInput, # Use the new input schema
    project_file_association_service: ProjectFileAssociationService = Depends(get_project_file_association_service),
    current_user: UserModel = Depends(get_current_active_user) # Require authentication
):
    """Associate a list of files with a project using their memory entity IDs.

    Requires authentication.
    """
    try:
        # Delegate to the new service function
        return project_file_association_service.associate_multiple_files_with_project(
            project_id=project_id,
            file_memory_entity_ids=bulk_input.file_memory_entity_ids
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import logging
        logging.error(f"Unexpected error in POST /projects/{project_id}/files/bulk: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )
