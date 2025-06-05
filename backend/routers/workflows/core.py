from fastapi import APIRouter, Depends, HTTPException, status, Path, Query
from sqlalchemy.orm import Session

from ...database import get_sync_db as get_db
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


def get_workflow_service(db: Session = Depends(get_db)) -> WorkflowService:
    return WorkflowService(db)


@router.post(
    "/",
    response_model=DataResponse[Workflow],
    status_code=status.HTTP_201_CREATED,
)
def create_workflow(
    workflow: WorkflowCreate,
    workflow_service: WorkflowService = Depends(get_workflow_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    db_workflow = workflow_service.create_workflow(workflow)
    return DataResponse[Workflow](
        data=Workflow.model_validate(db_workflow),
        message="Workflow created successfully",
    )


@router.get("/", response_model=ListResponse[Workflow])
def list_workflows(
    skip: int = Query(0),
    limit: int = Query(100),
    workflow_service: WorkflowService = Depends(get_workflow_service),
):
    workflows = workflow_service.get_workflows(skip=skip, limit=limit)
    return ListResponse[Workflow](
        data=[Workflow.model_validate(wf) for wf in workflows],
        total=len(workflows),
        page=skip // limit + 1 if limit else 1,
        page_size=limit,
        has_more=False,
        message=f"Retrieved {len(workflows)} workflows",
    )


@router.get("/{workflow_id}", response_model=DataResponse[Workflow])
def read_workflow(
    workflow_id: str = Path(...),
    workflow_service: WorkflowService = Depends(get_workflow_service),
):
    db_workflow = workflow_service.get_workflow(workflow_id)
    if db_workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return DataResponse[Workflow](
        data=Workflow.model_validate(db_workflow),
        message="Workflow retrieved successfully",
    )


@router.put("/{workflow_id}", response_model=DataResponse[Workflow])
def update_workflow(
    workflow_id: str,
    workflow_update: WorkflowUpdate,
    workflow_service: WorkflowService = Depends(get_workflow_service),
):
    db_workflow = workflow_service.update_workflow(workflow_id, workflow_update)
    if db_workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return DataResponse[Workflow](
        data=Workflow.model_validate(db_workflow),
        message="Workflow updated successfully",
    )


@router.delete("/{workflow_id}", response_model=DataResponse[dict])
def delete_workflow(
    workflow_id: str,
    workflow_service: WorkflowService = Depends(get_workflow_service),
):
    success = workflow_service.delete_workflow(workflow_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return DataResponse[dict](
        data={"message": "Workflow deleted"},
        message="Workflow deleted",
    )
