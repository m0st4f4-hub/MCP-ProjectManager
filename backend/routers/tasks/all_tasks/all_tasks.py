# Task ID: <taskId>  # Agent Role: ImplementationSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from ....database import get_sync_db as get_db
from ....services.task_service import TaskService
from ....services.agent_service import AgentService

from ....schemas.task import Task
from ....schemas.api_responses import ListResponse, PaginationParams

from ....enums import TaskStatusEnum


router = APIRouter(
    prefix="/",  # This router handles the root /tasks path
    tags=["Tasks"],
)


def get_task_service(db: Session = Depends(get_db)) -> TaskService:
    return TaskService(db)


def get_agent_service(db: Session = Depends(get_db)) -> AgentService:
    return AgentService(db)


@router.get(
    "/",  # At the root of this sub-router (e.g. /api/v1/tasks)
    response_model=ListResponse[Task],
    summary="Get All Tasks (System-Wide)",
    tags=["Tasks"],
    operation_id="tasks_get_all_tasks_root"
)


async def get_all_tasks(
    project_id: Optional[str] = Query(
    None, description="Filter tasks by project ID."),
    agent_id: Optional[str] = Query(
    None, description="Filter tasks by agent ID."),
    agent_name: Optional[str] = Query(
    None, description="Filter tasks by agent name."),
    search: Optional[str] = Query(
    None, description="Search term for task titles and descriptions."),
    status: Optional[TaskStatusEnum] = Query(
    None, description="Filter tasks by status."
    ),
    is_archived: Optional[bool] = Query(
    False,  # Default to not showing archived tasks, can be overridden
    description="Filter by archived status. False for non-archived,"
        "True for archived, null/None for all."
    ),
    pagination: PaginationParams = Depends(),  # Use PaginationParams for skip/limit
    sort_by: Optional[str] = Query(
    "created_at", description="Field to sort by. Supported: \'created_at\', \'updated_at\', \'title\', \'status\', \'task_number\', \'agent_id\', \'project_id\'"),
    sort_direction: Optional[str] = Query(
    "desc", description="Sort direction: \'asc\' or \'desc\'."),
    task_service: TaskService = Depends(get_task_service),
    agent_service: AgentService = Depends(get_agent_service)  # For agent_name lookup
):
    """Retrieve a list of all tasks in the system, with optional filtering and sorting."""
    try:
    agent_id_val: Optional[str] = None
    if agent_name:  # Assuming agent_service.get_agent_by_name is async if it involves DB IO
    agent = await agent_service.get_agent_by_name(name=agent_name)
    if agent:
    agent_id_val = agent.id
    else:  # If agent_name is specified but not found, return empty list as no tasks can match
    return ListResponse[Task](
    data=[],
    total=0,
    page=pagination.page,
    page_size=pagination.page_size,
    has_more=False,
    message=f"No tasks found for agent '{agent_name}'"
    )  # Get all tasks matching filters for total count (consider optimizing this if performance is an issue)  # Assuming get_tasks can also return a count or we have a separate count method
    all_tasks = await task_service.get_tasks(
    project_id=uuid.UUID(project_id) if project_id else None,  # Pass project_id if provided
    skip=0, limit=None,  # Get all for count
    agent_id=agent_id_val or agent_id,
    search=search,
    status=status,
    is_archived=is_archived
    )
    total = len(all_tasks)  # Get paginated tasks
    tasks = await task_service.get_tasks(
    project_id=uuid.UUID(project_id) if project_id else None,  # Pass project_id if provided
    skip=pagination.offset,
    limit=pagination.page_size,  # Use page_size for limit
    agent_id=agent_id_val or agent_id,
    search=search,
    status=status,
    is_archived=is_archived,
    sort_by=sort_by,
    sort_direction=sort_direction
    )  # Convert to Pydantic models
    pydantic_tasks = [Task.model_validate(task) for task in tasks]  # Return standardized response
    return ListResponse[Task](
    data=pydantic_tasks,
    total=total,
    page=pagination.page,
    page_size=pagination.page_size,
    has_more=pagination.offset + len(pydantic_tasks) < total,
    message=f"Retrieved {len(pydantic_tasks)} tasks" +
    (f" for agent '{agent_name}' ({agent_id_val})" if agent_name and agent_id_val else "") +
    (f" in project {project_id}" if project_id else "")
    )
    except ValueError as ve:
    raise HTTPException(status_code=400, detail=f"Invalid UUID format for project_id or agent_id: {ve}")
    except Exception as e:  # Consider logging the exception here
    raise HTTPException(
    status_code=500,
    detail=f"Internal server error: {e}"
    )
