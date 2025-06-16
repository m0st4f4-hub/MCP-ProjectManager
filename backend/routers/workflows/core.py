from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List, Optional

from ...database import get_db
from ...services.workflow_service import WorkflowService
from ...schemas.workflow import Workflow, WorkflowCreate, WorkflowUpdate
from ...schemas.api_responses import DataResponse, ListResponse

router = APIRouter(
    prefix="/workflows",
    tags=["Workflows"],
)


async def get_workflow_service(db: Annotated[AsyncSession, Depends(get_db)]) -> WorkflowService:
    return WorkflowService(db)


@router.post(
    "/",
    response_model=DataResponse[Workflow],
    status_code=status.HTTP_201_CREATED,
    summary="Create Workflow",
    operation_id="create_new_workflow"
)
async def create_workflow_endpoint(
    workflow_data: WorkflowCreate,
    workflow_service: Annotated[WorkflowService, Depends(WorkflowService.get_instance)],
):
    """Create a new workflow."""
    try:
        new_workflow = await workflow_service.create_workflow(workflow_data)
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
    operation_id="list_all_workflows"
)
async def get_workflows_endpoint(
    workflow_service: Annotated[WorkflowService, Depends(WorkflowService.get_instance)],
    skip: Annotated[int, Query(description="Number of workflows to skip")] = 0,
    limit: Annotated[int, Query(description="Maximum number of workflows to return")] = 100,
):
    """Get all workflows."""
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
    operation_id="update_existing_workflow"
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
