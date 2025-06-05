from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from ....database import get_sync_db as get_db
from ....services.task_dependency_service import TaskDependencyService

from ....schemas.task_dependency import TaskDependency, TaskDependencyCreate
from ....schemas.api_responses import DataResponse, ListResponse
from ....services.exceptions import EntityNotFoundError, DuplicateEntityError

router = APIRouter()

def get_task_dependency_service(db: Session = Depends(get_db)) -> TaskDependencyService:
    return TaskDependencyService(db)

@router.post(
    "/{project_id}/tasks/{task_number}/dependencies/",
    response_model=DataResponse[TaskDependency],
    summary="Add Task Dependency",
    tags=["Task Dependencies"],
    operation_id="projects_tasks_add_task_dependency"
)


async def add_task_dependency_endpoint(
    project_id: str,  # This is the successor's project_id
    task_number: int,  # This is the successor's task_number
    dependency: TaskDependencyCreate,
    task_dependency_service: TaskDependencyService = Depends(get_task_dependency_service),
):
    """Add a dependency between two tasks."""
    try:
        try:
            successor_uuid = uuid.UUID(project_id)
            predecessor_uuid = uuid.UUID(dependency.predecessor_project_id)
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid project_id format")

        db_dependency = await task_dependency_service.add_task_dependency(
            successor_project_id=successor_uuid,
            successor_task_number=task_number,
            predecessor_project_id=predecessor_uuid,
            predecessor_task_number=dependency.predecessor_task_number,
            dependency_type=dependency.dependency_type
        )
        return DataResponse[TaskDependency](
            data=db_dependency,
            message="Task dependency added successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except DuplicateEntityError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )

@router.get(
    "/{project_id}/tasks/{task_number}/dependencies/",
    response_model=ListResponse[TaskDependency],
    summary="Get All Task Dependencies (Both Predecessors and Successors)",
    tags=["Task Dependencies"],
    operation_id="projects_tasks_get_all_task_dependencies"
)


async def get_all_task_dependencies_endpoint(
    project_id: str,
    task_number: int,
    sort_by: Optional[str] = Query(
        None, description="Field to sort by (e.g., \'predecessor_task.task_number\',"
            "\'successor_task.task_number\')."),  # Adjusted for potential join
    sort_direction: Optional[str] = Query(
        None, description="Sort direction: \'asc\' or \'desc\'."),
    dependency_type: Optional[str] = Query(
        None, description="Filter by dependency type (e.g., \'FINISH_TO_START\')."),  # Assuming TaskDependency model has `type`
    task_dependency_service: TaskDependencyService = Depends(get_task_dependency_service)
):
    """Get all dependencies for a task (both predecessors and successors)."""
    try:
        try:
            project_uuid = uuid.UUID(project_id)
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid project_id format")

        dependencies = await task_dependency_service.get_all_task_dependencies(
            project_id=project_uuid,
            task_number=task_number,
            sort_by=sort_by,
            sort_direction=sort_direction,
            dependency_type=dependency_type
        )
        return ListResponse[TaskDependency](
            data=dependencies,
            total=len(dependencies),
            page=1,  # Assuming no pagination for this specific list endpoint yet
            page_size=len(dependencies),
            has_more=False,
            message=f"Retrieved {len(dependencies)} dependencies"
                "for task  #{task_number}"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )

@router.get(
    "/{project_id}/tasks/{task_number}/dependencies/predecessors/",
    response_model=ListResponse[TaskDependency],
    summary="Get Task Predecessors",
    tags=["Task Dependencies"],
    operation_id="projects_tasks_get_task_predecessors"
)


async def get_task_predecessors_endpoint(
    project_id: str,
    task_number: int,
    sort_by: Optional[str] = Query(
        None, description="Field to sort by (e.g., \'predecessor_task.task_number\')."),
    sort_direction: Optional[str] = Query(
        None, description="Sort direction: \'asc\' or \'desc\'."),
    dependency_type: Optional[str] = Query(
        None, description="Filter by dependency type."),
    task_dependency_service: TaskDependencyService = Depends(get_task_dependency_service)
):
    """Get the predecessors for a specific task."""
    try:
        try:
            project_uuid = uuid.UUID(project_id)
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid project_id format")

        predecessors = await task_dependency_service.get_task_predecessors(
            project_id=project_uuid,
            task_number=task_number,
            sort_by=sort_by,
            sort_direction=sort_direction,
            dependency_type=dependency_type
        )
        return ListResponse[TaskDependency](
            data=predecessors,
            total=len(predecessors),
            page=1,
            page_size=len(predecessors),
            has_more=False,
            message=f"Retrieved {len(predecessors)} predecessors"
                "for task  #{task_number}"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )

@router.get(
    "/{project_id}/tasks/{task_number}/dependencies/successors/",
    response_model=ListResponse[TaskDependency],
    summary="Get Task Successors",
    tags=["Task Dependencies"],
    operation_id="projects_tasks_get_task_successors"
)


async def get_task_successors_endpoint(
    project_id: str,
    task_number: int,
    sort_by: Optional[str] = Query(
        None, description="Field to sort by (e.g., \'successor_task.task_number\')."),
    sort_direction: Optional[str] = Query(
        None, description="Sort direction: \'asc\' or \'desc\'."),
    dependency_type: Optional[str] = Query(
        None, description="Filter by dependency type."),
    task_dependency_service: TaskDependencyService = Depends(get_task_dependency_service)
):
    """Get the successors for a specific task."""
    try:
        try:
            project_uuid = uuid.UUID(project_id)
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid project_id format")

        successors = await task_dependency_service.get_task_successors(
            project_id=project_uuid,
            task_number=task_number,
            sort_by=sort_by,
            sort_direction=sort_direction,
            dependency_type=dependency_type
        )
        return ListResponse[TaskDependency](
            data=successors,
            total=len(successors),
            page=1,
            page_size=len(successors),
            has_more=False,
            message=f"Retrieved {len(successors)} successors for task  #{task_number}"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )

@router.delete(
    "/{project_id}/tasks/{task_number}/dependencies/{predecessor_project_id}/{predecessor_task_number}",
    response_model=DataResponse[dict],
    summary="Remove Task Dependency",
    tags=["Task Dependencies"],
    operation_id="projects_tasks_remove_task_dependency"
)


async def remove_task_dependency_endpoint(
    project_id: str,  # Successor project_id
    task_number: int,  # Successor task_number
    predecessor_project_id: str = Path(...,
        description="ID of the predecessor task\'s project."),
    predecessor_task_number: int = Path(
        ..., description="Number of the predecessor task within its project."),
    task_dependency_service: TaskDependencyService = Depends(get_task_dependency_service),
):
    """Remove a dependency between two tasks."""
    try:
        try:
            successor_uuid = uuid.UUID(project_id)
            predecessor_uuid = uuid.UUID(predecessor_project_id)
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid project_id format")

        success = await task_dependency_service.remove_task_dependency(
            successor_project_id=successor_uuid,
            successor_task_number=task_number,
            predecessor_project_id=predecessor_uuid,
            predecessor_task_number=predecessor_task_number
        )
        if not success:
            raise HTTPException(status_code=404, detail="Task dependency not found")
        return DataResponse[dict](
            data={"success": success},
            message="Task dependency removed successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )
