from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from typing import List

from ....database import get_sync_db as get_db
from ....services.workflow_service import WorkflowService
from ....schemas.workflow import Workflow, WorkflowCreate, WorkflowUpdate

router = APIRouter(prefix="/workflows", tags=["Workflows"])


def get_workflow_service(db: Session = Depends(get_db)) -> WorkflowService:
    return WorkflowService(db)


@router.post("/", response_model=Workflow, status_code=status.HTTP_201_CREATED)
def create_workflow(
    workflow: WorkflowCreate,
    workflow_service: WorkflowService = Depends(get_workflow_service),
):
    return workflow_service.create_workflow(workflow)


@router.get("/", response_model=List[Workflow])
def list_workflows(
    skip: int = 0,
    limit: int = 100,
    workflow_service: WorkflowService = Depends(get_workflow_service),
):
    return workflow_service.get_workflows(skip=skip, limit=limit)


@router.get("/{workflow_id}", response_model=Workflow)
def read_workflow(
    workflow_id: str = Path(..., description="Workflow ID"),
    workflow_service: WorkflowService = Depends(get_workflow_service),
):
    db_workflow = workflow_service.get_workflow(workflow_id)
    if db_workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return db_workflow


@router.put("/{workflow_id}", response_model=Workflow)
def update_workflow(
    workflow_update: WorkflowUpdate,
    workflow_id: str = Path(..., description="Workflow ID"),
    workflow_service: WorkflowService = Depends(get_workflow_service),
):
    db_workflow = workflow_service.update_workflow(workflow_id, workflow_update)
    if db_workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return db_workflow


@router.delete("/{workflow_id}", response_model=dict)
def delete_workflow(
    workflow_id: str = Path(..., description="Workflow ID"),
    workflow_service: WorkflowService = Depends(get_workflow_service),
):
    success = workflow_service.delete_workflow(workflow_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"message": "Workflow deleted"}
