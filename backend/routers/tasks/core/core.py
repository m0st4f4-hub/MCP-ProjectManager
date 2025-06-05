from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from ....database import get_db
from ....services.task_service import TaskService
from ....services.agent_service import AgentService

from ....schemas.task import Task, TaskCreate, TaskUpdate
from ....schemas.api_responses import DataResponse, ListResponse, PaginationParams
from ....services.exceptions import (
    EntityNotFoundError,
    DuplicateEntityError,
    ValidationError,
    AuthorizationError
)
from ....enums import TaskStatusEnum
from ....auth import get_current_active_user
from ....services.audit_log_service import AuditLogService
from ....models import User as UserModel


router = APIRouter()


def get_task_service(db: Session = Depends(get_db)) -> TaskService:
    return TaskService(db)


def get_agent_service(db: Session = Depends(get_db)) -> AgentService:
    return AgentService(db)


def get_audit_log_service(db: Session = Depends(get_db)) -> AuditLogService:
    return AuditLogService(db)


@router.post(
    "/{project_id}/tasks/",
    response_model=DataResponse[Task],
    summary="Create Task in Project",
    tags=["Tasks"],
    operation_id="projects_tasks_create_task"
)


async def create_task_for_project(
    project_id: str,
    task: TaskCreate,
    task_service: TaskService = Depends(get_task_service),
    current_user: UserModel = Depends(get_current_active_user),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Create a new task in a project."""
    try:
        db_task = await task_service.create_task(
            project_id=uuid.UUID(project_id),
            task=task
        )

        await audit_log_service.create_log(
            action="create_task",
            user_id=current_user.id,
            details={
                "project_id": project_id,
                "task_title_from_input": task.title
            }
        )

        return DataResponse[Task](
            data=db_task,
            message="Task created successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )


@router.get(
    "/{project_id}/tasks/",
    response_model=ListResponse[Task],
    summary="Get Tasks in Project",
    tags=["Tasks"],
    operation_id="projects_tasks_get_tasks"
)


async def get_tasks_list(
    project_id: str,
    pagination: PaginationParams = Depends(),
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
    None,
    description="Filter by archived status. False for non-archived,"
        "True for archived, null/None for all."
    ),
    sort_by: Optional[str] = Query(
    "created_at", description="Field to sort by. Supported: \'created_at\', \'updated_at\', \'title\', \'status\', \'task_number\', \'agent_id\'"),
    sort_direction: Optional[str] = Query(
    "desc", description="Sort direction: \'asc\' or \'desc\'"),
    task_service: TaskService = Depends(get_task_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Retrieve a list of tasks in a project, with optional filtering and sorting.
    Supported sort fields: created_at, updated_at, title, status, task_number, agent_id
    """
    try:
        agent_id_val: Optional[str] = None
        if agent_name:
            agent = await agent_service.get_agent_by_name(name=agent_name)
            if agent:
                agent_id_val = agent.id
            else:
                return ListResponse[Task](
                    data=[],
                    total=0,
                    page=pagination.page,
                    page_size=pagination.page_size,
                    has_more=False,
                    message=f"No tasks found for agent \'{agent_name}\'"
                )

        all_tasks = await task_service.get_tasks_by_project(
            project_id=uuid.UUID(project_id),
            skip=0, limit=None,
            agent_id=agent_id_val or agent_id,
            search=search,
            status=status,
            is_archived=is_archived
        )
        total = len(all_tasks)

        tasks = await task_service.get_tasks_by_project(
            project_id=uuid.UUID(project_id),
            skip=pagination.offset,
            limit=pagination.page_size,
            agent_id=agent_id_val or agent_id,
            search=search,
            status=status,
            is_archived=is_archived,
            sort_by=sort_by,
            sort_direction=sort_direction
        )

        pydantic_tasks = [Task.model_validate(task) for task in tasks]

        return ListResponse[Task](
            data=pydantic_tasks,
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            has_more=pagination.offset + len(pydantic_tasks) < total,
            message=f"Retrieved {len(pydantic_tasks)} tasks" +
            (f" for agent '{agent_name}' ({agent_id_val})" if agent_name and agent_id_val else "")
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )


@router.get(
    "/search",
    response_model=ListResponse[Task],
    summary="Search Tasks",
    tags=["Tasks"],
    operation_id="tasks_search"
)


async def search_tasks_endpoint(
    query: str = Query(..., description="Search term for task titles and descriptions."),
    pagination: PaginationParams = Depends(),
    is_archived: Optional[bool] = Query(
        None,
        description="Filter by archived status. False for non-archived, True for archived, null/None for all."
    ),
    task_service: TaskService = Depends(get_task_service)
):
    """Search tasks across all projects by title and description."""
    try:
        all_tasks = await task_service.get_all_tasks(
            skip=0,
            limit=None,
            search=query,
            is_archived=is_archived
        )
        total = len(all_tasks)

        tasks = await task_service.get_all_tasks(
            skip=pagination.offset,
            limit=pagination.page_size,
            search=query,
            is_archived=is_archived
        )

        pydantic_tasks = [Task.model_validate(task) for task in tasks]

        return ListResponse[Task](
            data=pydantic_tasks,
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            has_more=pagination.offset + len(pydantic_tasks) < total,
            message=f"Found {len(pydantic_tasks)} matching tasks"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )


@router.get(
    "/{project_id}/tasks/{task_number}",
    response_model=DataResponse[Task],
    summary="Get Task by Project and Number",
    tags=["Tasks"],
    operation_id="projects_tasks_get_task_by_project_and_number"
)


async def read_task(
    project_id: str,
    task_number: int = Path(...,
    description="Task number unique within the project."),
    task_service: TaskService = Depends(get_task_service)
):
    """Retrieve a specific task by project and task number."""
    try:
        db_task = await task_service.get_task(
            project_id=uuid.UUID(project_id),
            task_number=task_number
        )

        return DataResponse[Task](
            data=Task.model_validate(db_task),
            message=f"Task  #{task_number} retrieved successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )

@router.post(
    "/{project_id}/tasks/{task_number}/archive",
    response_model=DataResponse[Task],
    summary="Archive Task",
    tags=["Tasks"],
    operation_id="projects_tasks_archive_task"
)


async def archive_task_endpoint(
    project_id: str,
    task_number: int,
    task_service: TaskService = Depends(get_task_service),
    current_user: UserModel = Depends(get_current_active_user),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Archive a task by setting is_archived to True."""
    try:
        db_task = await task_service.archive_task(
            project_id=uuid.UUID(project_id),
            task_number=task_number
        )

        await audit_log_service.create_log(
            action="archive_task",
            user_id=current_user.id,
            details={
                "project_id": project_id,
                "task_number": task_number
            }
        )

        return DataResponse[Task](
            data=Task.model_validate(db_task),
            message=f"Task  #{task_number} archived successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )

@router.post(
    "/{project_id}/tasks/{task_number}/unarchive",
    response_model=DataResponse[Task],
    summary="Unarchive Task",
    tags=["Tasks"],
    operation_id="projects_tasks_unarchive_task"
)


async def unarchive_task_endpoint(
    project_id: str,
    task_number: int,
    task_service: TaskService = Depends(get_task_service),
    current_user: UserModel = Depends(get_current_active_user),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Unarchive a task by setting is_archived to False."""
    try:
        db_task = await task_service.unarchive_task(
            project_id=uuid.UUID(project_id),
            task_number=task_number
        )

        await audit_log_service.create_log(
            action="unarchive_task",
            user_id=current_user.id,
            details={
                "project_id": project_id,
                "task_number": task_number
            }
        )

        return DataResponse[Task](
            data=Task.model_validate(db_task),
            message=f"Task  #{task_number} unarchived successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )

@router.put(
    "/{project_id}/tasks/{task_number}",
    response_model=DataResponse[Task],
    summary="Update Task (incl. Project/Agent)",
    tags=["Tasks"],
    operation_id="projects_tasks_update_task_by_project_and_number"
)


async def update_task(
    project_id: str,
    task_number: int,
    task_update: TaskUpdate,
    task_service: TaskService = Depends(get_task_service),
    current_user: UserModel = Depends(get_current_active_user),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Update a task by project and task number."""
    try:
        db_task = await task_service.update_task(
            project_id=uuid.UUID(project_id),
            task_number=task_number,
            task_update=task_update
        )

        await audit_log_service.create_log(
            action="update_task",
            user_id=current_user.id,
            details={
                "project_id": project_id,
                "task_number": task_number,
                "changes": task_update.model_dump(exclude_unset=True)
            }
        )

        return DataResponse[Task](
            data=Task.model_validate(db_task),
            message=f"Task  #{task_number} updated successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )

@router.delete(
    "/{project_id}/tasks/{task_number}",
    response_model=DataResponse[Task],
    summary="Delete Task",
    tags=["Tasks"],
    operation_id="projects_tasks_delete_task_by_project_and_number"
)


async def delete_task(
    project_id: str,
    task_number: int,
    task_service: TaskService = Depends(get_task_service),
    current_user: UserModel = Depends(get_current_active_user),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Delete a task by project and task number."""
    try:
        db_task = await task_service.delete_task(
            project_id=uuid.UUID(project_id),
            task_number=task_number
        )

        await audit_log_service.create_log(
            action="delete_task",
            user_id=current_user.id,
            details={
                "project_id": project_id,
                "task_number": task_number
            }
        )

        return DataResponse[Task](
            data=Task.model_validate(db_task),
            message=f"Task  #{task_number} deleted successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )
