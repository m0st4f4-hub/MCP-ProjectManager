from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List, Optional

from ....database import get_db
from ....crud import rules as crud_rules
from ....schemas.workflow import Workflow, WorkflowCreate, WorkflowUpdate
from ....schemas.api_responses import DataResponse, ListResponse

router = APIRouter(
    prefix="/workflows",
    tags=["Workflows"]
)

@router.get(
    "/", 
    response_model=ListResponse[Workflow],
    summary="Get Workflows",
    operation_id="get_workflows"
)
async def get_workflows(
    workflow_type: Annotated[Optional[str], Query(None, description="Filter by workflow type")],
    skip: Annotated[int, Query(0, ge=0, description="Number of workflows to skip")],
    limit: Annotated[int, Query(100, ge=1, le=100, description="Maximum number of workflows to return")],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Get all workflows with optional filtering."""
    try:
        workflows = await crud_rules.get_workflows(db, skip=skip, limit=limit)
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
    summary="Get Workflow by ID",
    operation_id="get_workflow_by_id"
)
def get_workflow(
    workflow_id: Annotated[str, Path(description="ID of the workflow to retrieve")],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Get a specific workflow with steps.
    
    Returns the workflow details including all associated steps.
    """
    workflow = crud_rules.get_workflow(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")
    return DataResponse(data=workflow, message="Workflow retrieved successfully")

@router.post(
    "/",
    response_model=DataResponse[Workflow],
    status_code=status.HTTP_201_CREATED,
    summary="Create Workflow",
    operation_id="create_workflow"
)
async def create_workflow(
    workflow: WorkflowCreate,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Create a new workflow."""
    try:
        new_workflow = await crud_rules.create_workflow(db, workflow)
        return DataResponse(
            data=new_workflow,
            message="Workflow created successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating workflow: {str(e)}"
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
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Update an existing workflow."""
    try:
        updated_workflow = await crud_rules.update_workflow(db, workflow_id, workflow_update)
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
