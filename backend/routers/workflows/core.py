from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List, Optional

from ...database import get_db
from ...services.workflow_service import WorkflowService
from ...schemas.workflow import Workflow, WorkflowCreate, WorkflowUpdate
from ...schemas.api_responses import DataResponse, ListResponse
from ...auth import get_current_active_user
from ...models import User as UserModel

router = APIRouter(
    prefix="/workflows",
    tags=["Workflows"],
    dependencies=[Depends(get_current_active_user)],
)


async def get_workflow_service(db: Annotated[AsyncSession, Depends(get_db)]) -> WorkflowService:
    return WorkflowService(db)


@router.post(
    "/",
    response_model=DataResponse[Workflow],
    status_code=status.HTTP_201_CREATED,
    summary="Create Workflow",
    operation_id="create_workflow"
)
async def create_workflow(
    workflow: WorkflowCreate,
    workflow_service: Annotated[WorkflowService, Depends(get_workflow_service)]
):
    """Create a new workflow."""
    try:
        new_workflow = await workflow_service.create_workflow(workflow)
        return DataResponse(
            data=new_workflow,
            message="Workflow created successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating workflow: {str(e)}"
        )


@router.get(
    "/",
    response_model=ListResponse[Workflow],
    summary="Get Workflows",
    operation_id="get_workflows"
)
async def get_workflows(
    skip: Annotated[int, Query(0, ge=0, description="Number of workflows to skip")],
    limit: Annotated[int, Query(100, ge=1, le=100, description="Maximum number of workflows to return")],
    workflow_service: Annotated[WorkflowService, Depends(get_workflow_service)]
):
    """Get all workflows with pagination."""
    try:
        workflows = await workflow_service.get_workflows(skip=skip, limit=limit)
        return ListResponse(
            data=workflows,
            total=len(workflows),
            message="Workflows retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving workflows: {str(e)}"
        )


@router.get(
    "/{workflow_id}",
    response_model=DataResponse[Workflow],
    summary="Get Workflow",
    operation_id="get_workflow"
)
async def get_workflow(
    workflow_id: Annotated[str, Path(description="Workflow ID")],
    workflow_service: Annotated[WorkflowService, Depends(get_workflow_service)]
):
    """Get a specific workflow by ID."""
    try:
        workflow = await workflow_service.get_workflow(workflow_id)
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workflow not found"
            )
        return DataResponse(
            data=workflow,
            message="Workflow retrieved successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving workflow: {str(e)}"
        )


@router.put(
    "/{workflow_id}",
    response_model=DataResponse[Workflow],
    summary="Update Workflow",
    operation_id="update_workflow"
)
async def update_workflow(
    workflow_id: Annotated[str, Path(description="Workflow ID")],
    workflow_update: WorkflowUpdate,
    workflow_service: Annotated[WorkflowService, Depends(get_workflow_service)]
):
    """Update an existing workflow."""
    try:
        updated_workflow = await workflow_service.update_workflow(workflow_id, workflow_update)
        if not updated_workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workflow not found"
            )
        return DataResponse(
            data=updated_workflow,
            message="Workflow updated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error updating workflow: {str(e)}"
        )


@router.delete(
    "/{workflow_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Workflow",
    operation_id="delete_workflow"
)
async def delete_workflow(
    workflow_id: Annotated[str, Path(description="Workflow ID")],
    workflow_service: Annotated[WorkflowService, Depends(get_workflow_service)]
):
    """Delete a workflow."""
    try:
        success = await workflow_service.delete_workflow(workflow_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workflow not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting workflow: {str(e)}"
        )
