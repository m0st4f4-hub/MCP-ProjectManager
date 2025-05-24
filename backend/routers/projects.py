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

from .. import schemas
from ..database import get_db
from ..services.project_service import ProjectService
from ..services.task_service import TaskService
from ..services.agent_service import AgentService
from ..services.project_member_service import ProjectMemberService
from ..services.project_file_association_service import ProjectFileAssociationService
from ..services.task_file_association_service import TaskFileAssociationService
from ..services.task_dependency_service import TaskDependencyService
from .. import models

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


@router.post("/", response_model=schemas.Project, summary="Create Project", operation_id="create_project")
def create_project(
    project: schemas.ProjectCreate,
    project_service: ProjectService = Depends(get_project_service)
):
    """Creates a new project.
    - **name**: Unique name for the project (required).
    - **description**: Optional description.
    """
    db_project = project_service.get_project_by_name(
        name=project.name, is_archived=None)
    if db_project:
        raise HTTPException(
            status_code=400, detail="Project name already registered")
    db_project = project_service.create_project(project=project)
    return schemas.Project.model_validate(db_project)


@router.get("/", response_model=List[schemas.Project], summary="List Projects", operation_id="list_projects")
def get_project_list(
    skip: int = 0,
    search: Optional[str] = None,
    status: Optional[str] = None,
    is_archived: Optional[bool] = Query(
        None, description="Filter by archived status. False for non-archived, True for archived, null/None for all."),
    project_service: ProjectService = Depends(get_project_service)
):
    """Retrieves a list of projects."""
    projects = project_service.get_projects(
        skip=skip, search=search, status=status, is_archived=is_archived)

    # Convert SQLAlchemy models to Pydantic models
    pydantic_projects = [schemas.Project.model_validate(
        project) for project in projects]

    return pydantic_projects


@router.get("/{project_id}", response_model=schemas.Project, summary="Get Project by ID", operation_id="get_project_by_id")
def get_project_by_id_endpoint(
    project_id: str,
    is_archived: Optional[bool] = Query(
        False, description="Set to true to fetch if archived, null/None to fetch regardless of status."),
    project_service: ProjectService = Depends(get_project_service)
):
    """Retrieves a specific project by its ID."""
    db_project = project_service.get_project(
        project_id=project_id, is_archived=is_archived)
    if db_project is None:
        status_search_message = ""
        if is_archived is True:
            status_search_message = " (archived)"
        elif is_archived is False:
            status_search_message = " (active)"
        raise HTTPException(
            status_code=404, detail=f"Project not found{status_search_message}")
    return db_project


@router.post("/{project_id}/archive", response_model=schemas.Project, summary="Archive Project", operation_id="archive_project")
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


@router.post("/{project_id}/unarchive", response_model=schemas.Project, summary="Unarchive Project", operation_id="unarchive_project")
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


@router.put("/{project_id}", response_model=schemas.Project, summary="Update Project", operation_id="update_project_by_id")
def update_project(
    project_id: str,
    project_update: schemas.ProjectUpdate,
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


@router.delete("/{project_id}", response_model=schemas.Project, summary="Delete Project", operation_id="delete_project_by_id")
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
