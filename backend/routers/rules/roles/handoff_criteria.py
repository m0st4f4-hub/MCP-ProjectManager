from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ....database import get_sync_db as get_db
from ....services.agent_handoff_service import AgentHandoffService
from ....schemas.agent_handoff_criteria import (
    AgentHandoffCriteria,
    AgentHandoffCriteriaCreate,
    AgentHandoffCriteriaUpdate,
)

router = APIRouter()


@router.get("/", response_model=List[AgentHandoffCriteria])
def list_handoff_criteria(
    agent_role_id: Optional[str] = Query(None, description="Filter by agent role"),
    db: Session = Depends(get_db),
):
    """List handoff criteria, optionally filtered by agent role."""
    service = AgentHandoffService(db)
    return service.list_criteria(agent_role_id)


@router.get("/{criteria_id}", response_model=AgentHandoffCriteria)
def get_handoff_criteria(
    criteria_id: str,
    db: Session = Depends(get_db),
):
    """Retrieve a single handoff criteria by ID."""
    service = AgentHandoffService(db)
    db_obj = service.get_criteria(criteria_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Criteria not found")
    return db_obj


@router.post("/", response_model=AgentHandoffCriteria)
def create_handoff_criteria(
    criteria: AgentHandoffCriteriaCreate,
    db: Session = Depends(get_db),
):
    """Create new handoff criteria."""
    service = AgentHandoffService(db)
    return service.create_criteria(criteria)


@router.put("/{criteria_id}", response_model=AgentHandoffCriteria)
def update_handoff_criteria(
    criteria_id: str,
    criteria_update: AgentHandoffCriteriaUpdate,
    db: Session = Depends(get_db),
):
    """Update existing handoff criteria."""
    service = AgentHandoffService(db)
    db_obj = service.update_criteria(criteria_id, criteria_update)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Criteria not found")
    return db_obj


@router.delete("/{criteria_id}")
def delete_handoff_criteria(
    criteria_id: str,
    db: Session = Depends(get_db),
):
    """Delete handoff criteria by ID."""
    service = AgentHandoffService(db)
    success = service.delete_criteria(criteria_id)
    if not success:
        raise HTTPException(status_code=404, detail="Criteria not found")
    return {"message": "Criteria deleted successfully"}
