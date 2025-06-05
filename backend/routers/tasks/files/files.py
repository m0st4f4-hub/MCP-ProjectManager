from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session
from typing import Optional
import uuid

from ....database import get_sync_db as get_db
from ....services.task_file_association_service import TaskFileAssociationService

from ....schemas.file_association import TaskFileAssociation, TaskFileAssociationCreate
from ....schemas.api_responses import DataResponse, ListResponse
from ....services.exceptions import EntityNotFoundError

router = APIRouter()

def get_task_file_association_service(db: Session = Depends(get_db)) -> TaskFileAssociationService:
    return TaskFileAssociationService(db)


@router.post(
    "/{project_id}/tasks/{task_number}/files/",
    response_model=DataResponse[TaskFileAssociation],
    summary="Associate File with Task",
    tags=["Task Files"],
    operation_id="projects_tasks_associate_file_with_task"
)


async def associate_file_with_task_endpoint(
    project_id: str,
    task_number: int,
    file_association: TaskFileAssociationCreate,
    task_file_association_service: TaskFileAssociationService = Depends(get_task_file_association_service),
):
    """Associate a file with a task."""
    try:
        try:
            project_uuid = uuid.UUID(project_id)
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid project_id format")

        db_association = await task_file_association_service.associate_file_with_task(
            project_id=project_uuid,
            task_number=task_number,
            file_memory_entity_id=file_association.file_memory_entity_id
        )
    return DataResponse[TaskFileAssociation](
    data=db_association,
    message="File associated with task successfully"
    )
    except EntityNotFoundError as e:
    raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
    raise HTTPException(
    status_code=500,
    detail=f"Internal server error: {e}"
    )

@router.get(
    "/{project_id}/tasks/{task_number}/files/",
    response_model=ListResponse[TaskFileAssociation],
    summary="Get Files for Task",
    tags=["Task Files"],
    operation_id="projects_tasks_get_files_for_task"
)


async def get_files_for_task_endpoint(
    project_id: str,
    task_number: int,
    sort_by: Optional[str] = Query(None, description="Field to sort by (e.g., \'filename\')."),
    sort_direction: Optional[str] = Query(None, description="Sort direction: \'asc\' or \'desc\'."),
    filename: Optional[str] = Query(None, description="Filter by filename."),
    task_file_association_service: TaskFileAssociationService = Depends(get_task_file_association_service)
):
    """Get all files associated with a task."""
    try:
        try:
            project_uuid = uuid.UUID(project_id)
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid project_id format")

        files = await task_file_association_service.get_task_files(
            project_id=project_uuid,
            task_number=task_number,
            sort_by=sort_by,
            sort_direction=sort_direction,
            filename=filename
        )
    return ListResponse[TaskFileAssociation](
    data=files,
    total=len(files),
    page=1,  # Assuming no pagination for this specific list endpoint yet
    page_size=len(files),
    has_more=False,
    message=f"Retrieved {len(files)} files for task  #{task_number}"
    )
    except EntityNotFoundError as e:
    raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
    raise HTTPException(
    status_code=500,
    detail=f"Internal server error: {e}"
    )

@router.get(
    "/{project_id}/tasks/{task_number}/files/{file_memory_entity_id}",
    response_model=DataResponse[TaskFileAssociation],
    summary="Get Task File Association by File Memory Entity ID",
    tags=["Task Files"],
    operation_id="projects_tasks_get_task_file_association_by_file_memory_entity_id"
)


async def get_task_file_association_by_file_memory_entity_id_endpoint(
    project_id: str = Path(..., description="ID of the project."),
    task_number: int = Path(..., description="Task number unique within the project."),
    file_memory_entity_id: int = Path(..., description="ID of the associated file MemoryEntity."),
    task_file_association_service: TaskFileAssociationService = Depends(
    get_task_file_association_service)
):
    """Retrieve a specific task file association by file memory entity ID."""
    try:
        try:
            project_uuid = uuid.UUID(project_id)
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid project_id format")

        association = await task_file_association_service.get_task_file_association_by_file_memory_entity_id(
            project_id=project_uuid,
            task_number=task_number,
            file_memory_entity_id=file_memory_entity_id
        )
    return DataResponse[TaskFileAssociation](
    data=association,
    message="Task file association retrieved successfully"
    )
    except EntityNotFoundError as e:
    raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
    raise HTTPException(
    status_code=500,
    detail=f"Internal server error: {e}"
    )

@router.delete(
    "/{project_id}/tasks/{task_number}/files/{file_memory_entity_id}",
    response_model=DataResponse[dict],
    summary="Disassociate File from Task by File Memory Entity ID",
    tags=["Task Files"],
    operation_id="projects_tasks_disassociate_file_from_task_by_file_memory_entity_id"
)


async def disassociate_file_from_task_by_file_memory_entity_id_endpoint(
    project_id: str = Path(..., description="ID of the project."),
    task_number: int = Path(..., description="Task number unique within the project."),
    file_memory_entity_id: int = Path(..., description="ID of the associated file MemoryEntity."),
    task_file_association_service: TaskFileAssociationService = Depends(
        get_task_file_association_service),
):
    """Disassociate a file from a task by file memory entity ID."""
    try:
        try:
            project_uuid = uuid.UUID(project_id)
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid project_id format")

        success = await task_file_association_service.disassociate_file_from_task(
            project_id=project_uuid,
            task_number=task_number,
            file_memory_entity_id=file_memory_entity_id
        )
        if not success:
            raise HTTPException(status_code=404, detail="Task file association not found")
        return DataResponse[dict](
            data={"success": success},
            message="File disassociated from task successfully",
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )
