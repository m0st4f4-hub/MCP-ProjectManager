from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List
import uuid

from ....database import get_db
from ....services.task_file_association_service import TaskFileAssociationService
from ....schemas.file_association import TaskFileAssociation, TaskFileAssociationCreate
from ....schemas.api_responses import DataResponse, ListResponse
from ....services.exceptions import EntityNotFoundError

router = APIRouter(
    prefix="/files",
    tags=["Task Files"]
)

async def get_task_file_association_service(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> TaskFileAssociationService:
    return TaskFileAssociationService(db)

@router.get(
    "/",
    response_model=ListResponse[TaskFileAssociation],
    summary="Get Task Files",
    operation_id="get_task_files"
)
async def get_task_files(
    project_id: Annotated[str, Query(description="Project ID")],
    task_number: Annotated[int, Query(description="Task number")],
    skip: Annotated[int, Query(0, ge=0, description="Number of files to skip")],
    limit: Annotated[int, Query(100, ge=1, le=100, description="Maximum number of files to return")],
    service: Annotated[TaskFileAssociationService, Depends(get_task_file_association_service)]
):
    """Get all files associated with a task."""
    try:
        files = await service.get_files_for_task(
            project_id=project_id,
            task_number=task_number,
            skip=skip,
            limit=limit
        )
        return ListResponse(
            data=files,
            total=len(files),
            message="Task files retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving task files: {str(e)}"
        )

@router.post(
    "/",
    response_model=DataResponse[TaskFileAssociation],
    status_code=status.HTTP_201_CREATED,
    summary="Associate File with Task",
    operation_id="associate_file_with_task"
)
async def associate_file_with_task(
    association: TaskFileAssociationCreate,
    service: Annotated[TaskFileAssociationService, Depends(get_task_file_association_service)]
):
    """Associate a file with a task."""
    try:
        new_association = await service.create_association(association)
        return DataResponse(
            data=new_association,
            message="File associated with task successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error associating file with task: {str(e)}"
        )

@router.delete(
    "/{association_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove File Association",
    operation_id="remove_file_association"
)
async def remove_file_association(
    association_id: Annotated[str, Path(description="Association ID")],
    service: Annotated[TaskFileAssociationService, Depends(get_task_file_association_service)]
):
    """Remove a file association from a task."""
    try:
        success = await service.delete_association(association_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File association not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing file association: {str(e)}"
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
        association = await task_file_association_service.get_task_file_association_by_file_memory_entity_id(
            project_id=uuid.UUID(project_id),
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
    response_model=DataResponse[bool],
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
        success = await task_file_association_service.disassociate_file_from_task(
            project_id=uuid.UUID(project_id),
            task_number=task_number,
            file_memory_entity_id=file_memory_entity_id
        )
        if not success:
            raise HTTPException(status_code=404, detail="Task file association not found")
        return DataResponse[bool](
            data=True,
            message="File disassociated from task successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )
