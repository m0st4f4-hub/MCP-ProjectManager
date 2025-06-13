from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List

from ..database import get_db
from ..services.task_service import TaskService
from ..schemas.task import Task as TaskSchema, TaskCreate, TaskUpdate
from ..schemas.api_responses import DataResponse, ListResponse, PaginationParams
from ..services.exceptions import EntityNotFoundError, ValidationError
from ..auth import get_current_active_user
from ..models import User as UserModel

router = APIRouter(
    prefix="/projects/{project_id}/tasks",
    tags=["Tasks"],
)

async def get_task_service(db: Annotated[AsyncSession, Depends(get_db)]) -> TaskService:
    return TaskService(db)

@router.post(
    "/", 
    response_model=DataResponse[TaskSchema], 
    status_code=status.HTTP_201_CREATED,
    summary="Create Task",
    operation_id="create_task"
)
async def create_task_endpoint(
    project_id: Annotated[str, Path(description="ID of the project")],
    task_data: TaskCreate,
    task_service: Annotated[TaskService, Depends(get_task_service)],
    current_user: Annotated[UserModel, Depends(get_current_active_user)]
):
    """
    Create a new task in a project.
    
    - **title**: Required task title
    - **description**: Optional task description
    - **status**: Task status (defaults to TODO)
    - **priority**: Task priority level
    - **assignee_id**: Optional ID of the user assigned to the task
    """
    if task_data.project_id != project_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project ID in path and body must match.")
    try:
        new_task = await task_service.create_task(task_data)
        return DataResponse(data=TaskSchema.model_validate(new_task), message="Task created successfully")
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get(
    "/", 
    response_model=ListResponse[TaskSchema],
    summary="Get Tasks for Project",
    operation_id="get_tasks_for_project"
)
async def get_tasks_for_project_endpoint(
    project_id: Annotated[str, Path(description="ID of the project")],
    pagination: Annotated[PaginationParams, Depends()],
    task_service: Annotated[TaskService, Depends(get_task_service)],
    current_user: Annotated[UserModel, Depends(get_current_active_user)]
):
    """
    Get all tasks for a specific project.
    
    Returns a paginated list of tasks belonging to the specified project.
    """
    tasks = await task_service.get_tasks_for_project(project_id, skip=pagination.offset, limit=pagination.page_size)
    total_tasks = len(await task_service.get_tasks_for_project(project_id))
    return ListResponse(
        data=[TaskSchema.model_validate(t) for t in tasks],
        total=total_tasks,
        page=pagination.page,
        page_size=pagination.page_size,
        has_more=(pagination.offset + len(tasks)) < total_tasks,
        message="Tasks retrieved successfully"
    )

@router.get(
    "/{task_number}", 
    response_model=DataResponse[TaskSchema],
    summary="Get Task by Number",
    operation_id="get_task_by_number"
)
async def get_task_endpoint(
    project_id: Annotated[str, Path(description="ID of the project")],
    task_number: Annotated[int, Path(description="Task number within the project")],
    task_service: Annotated[TaskService, Depends(get_task_service)],
    current_user: Annotated[UserModel, Depends(get_current_active_user)]
):
    """
    Get a specific task by its number within a project.
    
    Each task has a unique number within its project scope.
    """
    try:
        task = await task_service.get_task(project_id, task_number)
        return DataResponse(data=TaskSchema.model_validate(task), message="Task retrieved successfully")
    except EntityNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

@router.put(
    "/{task_number}", 
    response_model=DataResponse[TaskSchema],
    summary="Update Task",
    operation_id="update_task"
)
async def update_task_endpoint(
    project_id: Annotated[str, Path(description="ID of the project")],
    task_number: Annotated[int, Path(description="Task number within the project")],
    task_data: TaskUpdate,
    task_service: Annotated[TaskService, Depends(get_task_service)],
    current_user: Annotated[UserModel, Depends(get_current_active_user)]
):
    """
    Update a task's information.
    
    - **title**: Optional new task title
    - **description**: Optional new description
    - **status**: Optional new status
    - **priority**: Optional new priority
    - **assignee_id**: Optional new assignee
    """
    try:
        updated_task = await task_service.update_task(project_id, task_number, task_data)
        return DataResponse(data=TaskSchema.model_validate(updated_task), message="Task updated successfully")
    except EntityNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete(
    "/{task_number}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Task",
    operation_id="delete_task"
)
async def delete_task_endpoint(
    project_id: Annotated[str, Path(description="ID of the project")],
    task_number: Annotated[int, Path(description="Task number within the project")],
    task_service: Annotated[TaskService, Depends(get_task_service)],
    current_user: Annotated[UserModel, Depends(get_current_active_user)]
):
    """
    Delete a task permanently.
    
    This action cannot be undone. The task will be removed from the project.
    """
    try:
        await task_service.delete_task(project_id, task_number)
    except EntityNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
