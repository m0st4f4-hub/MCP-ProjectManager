from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ...database import get_sync_db as get_db
from ...crud import rules as crud_rules
from ...schemas.workflow import Workflow, WorkflowCreate, WorkflowUpdate

router = APIRouter()  # Workflows
@router.get("/", response_model=List[Workflow])


def get_workflows(
    workflow_type: Optional[str] = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get workflows"""
    return crud_rules.get_workflows(db, workflow_type, active_only)

@router.get("/{workflow_id}", response_model=Workflow)


def get_workflow(
    workflow_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific workflow with steps"""
    workflow = crud_rules.get_workflow(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.post("/", response_model=Workflow)


def create_workflow(
    workflow: WorkflowCreate,
    db: Session = Depends(get_db)
):
    """Create a new workflow"""
    return crud_rules.create_workflow(db, workflow)
