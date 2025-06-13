from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List
import uuid

from ....database import get_db
from ....services.task_dependency_service import TaskDependencyService
from ....schemas.task_dependency import TaskDependency, TaskDependencyCreate
from ....schemas.api_responses import DataResponse, ListResponse

router = APIRouter(
    prefix="/dependencies",
    tags=["Task Dependencies"]
)

async def get_task_dependency_service(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> TaskDependencyService:
    return TaskDependencyService(db)

@router.get(
    "/",
    response_model=ListResponse[TaskDependency],
    summary="Get Task Dependencies",
    operation_id="get_task_dependencies"
)
async def get_task_dependencies(
    project_id: Annotated[str, Query(description="Project ID")],
    task_number: Annotated[int, Query(description="Task number")],
    skip: Annotated[int, Query(0, ge=0, description="Number of dependencies to skip")],
    limit: Annotated[int, Query(100, ge=1, le=100, description="Maximum number of dependencies to return")],
    service: Annotated[TaskDependencyService, Depends(get_task_dependency_service)]
):
    """Get all dependencies for a task."""
    try:
        dependencies = service.get_dependencies_for_task(
            task_project_id=uuid.UUID(project_id),
            task_number=task_number
        )
        return ListResponse(
            data=dependencies,
            total=len(dependencies),
            message="Task dependencies retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving task dependencies: {str(e)}"
        )

@router.post(
    "/",
    response_model=DataResponse[TaskDependency],
    status_code=status.HTTP_201_CREATED,
    summary="Create Task Dependency",
    operation_id="create_task_dependency"
)
async def create_task_dependency(
    dependency: TaskDependencyCreate,
    service: Annotated[TaskDependencyService, Depends(get_task_dependency_service)]
):
    """Create a new task dependency."""
    try:
        new_dependency = await service.add_dependency(
            predecessor_task_project_id=uuid.UUID(dependency.predecessor_project_id),
            predecessor_task_number=dependency.predecessor_task_number,
            successor_task_project_id=uuid.UUID(dependency.successor_project_id),
            successor_task_number=dependency.successor_task_number,
            dependency_type=dependency.dependency_type
        )
        return DataResponse(
            data=new_dependency,
            message="Task dependency created successfully"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating task dependency: {str(e)}"
        )

@router.get(
    "/predecessors",
    response_model=ListResponse[TaskDependency],
    summary="Get Task Predecessors",
    operation_id="get_task_predecessors"
)
async def get_task_predecessors(
    project_id: Annotated[str, Query(description="Project ID")],
    task_number: Annotated[int, Query(description="Task number")],
    service: Annotated[TaskDependencyService, Depends(get_task_dependency_service)]
):
    """Get all predecessor tasks for a given task."""
    try:
        predecessors = service.get_predecessor_tasks(
            task_project_id=uuid.UUID(project_id),
            task_number=task_number
        )
        return ListResponse(
            data=predecessors,
            total=len(predecessors),
            message="Task predecessors retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving task predecessors: {str(e)}"
        )

@router.get(
    "/successors",
    response_model=ListResponse[TaskDependency],
    summary="Get Task Successors",
    operation_id="get_task_successors"
)
async def get_task_successors(
    project_id: Annotated[str, Query(description="Project ID")],
    task_number: Annotated[int, Query(description="Task number")],
    service: Annotated[TaskDependencyService, Depends(get_task_dependency_service)]
):
    """Get all successor tasks for a given task."""
    try:
        successors = service.get_successor_tasks(
            task_project_id=uuid.UUID(project_id),
            task_number=task_number
        )
        return ListResponse(
            data=successors,
            total=len(successors),
            message="Task successors retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving task successors: {str(e)}"
        )

@router.delete(
    "/",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove Task Dependency",
    operation_id="remove_task_dependency"
)
async def remove_task_dependency(
    predecessor_project_id: Annotated[str, Query(description="Predecessor project ID")],
    predecessor_task_number: Annotated[int, Query(description="Predecessor task number")],
    successor_project_id: Annotated[str, Query(description="Successor project ID")],
    successor_task_number: Annotated[int, Query(description="Successor task number")],
    service: Annotated[TaskDependencyService, Depends(get_task_dependency_service)]
):
    """Remove a task dependency."""
    try:
        success = service.remove_dependency(
            predecessor_task_project_id=uuid.UUID(predecessor_project_id),
            predecessor_task_number=predecessor_task_number,
            successor_task_project_id=uuid.UUID(successor_project_id),
            successor_task_number=successor_task_number
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task dependency not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing task dependency: {str(e)}"
        )
