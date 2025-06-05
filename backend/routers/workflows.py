from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..database import get_db
from ..auth import get_current_active_user
from ..services.workflow_service import WorkflowService
from ..schemas.workflow import Workflow, WorkflowCreate


router = APIRouter(
    prefix="/workflows",
    tags=["workflows"],
    dependencies=[Depends(get_current_active_user)]
)


def get_workflow_service(db: AsyncSession = Depends(get_db)) -> WorkflowService:
    return WorkflowService(db)


@router.post("/", response_model=Workflow, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    workflow: WorkflowCreate,
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    return await workflow_service.create_workflow(workflow)


@router.get("/", response_model=List[Workflow])
async def list_workflows(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, gt=0),
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    return await workflow_service.get_workflows(skip=skip, limit=limit)


@router.delete("/{workflow_id}", response_model=dict)
async def delete_workflow(
    workflow_id: str = Path(...),
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    success = await workflow_service.delete_workflow(workflow_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"message": "Workflow deleted successfully"}
