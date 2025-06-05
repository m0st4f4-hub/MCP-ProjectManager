from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ....database import get_sync_db as get_db
from ....schemas.agent_handoff_criteria import (
    AgentHandoffCriteria,
    AgentHandoffCriteriaCreate,
    AgentHandoffCriteriaUpdate,
)
from ....services.agent_handoff_service import AgentHandoffService

router = APIRouter()


@router.post("/", response_model=AgentHandoffCriteria)
def create_handoff_criteria(
    criteria: AgentHandoffCriteriaCreate, db: Session = Depends(get_db)
):
    service = AgentHandoffService(db)
    return service.create_criteria(criteria)


@router.get("/", response_model=List[AgentHandoffCriteria])
def list_handoff_criteria(
    agent_role_id: Optional[str] = None, db: Session = Depends(get_db)
):
    service = AgentHandoffService(db)
    return service.get_criteria_list(agent_role_id)


@router.put("/{criteria_id}", response_model=AgentHandoffCriteria)
def update_handoff_criteria(
    criteria_id: str,
    criteria_update: AgentHandoffCriteriaUpdate,
    db: Session = Depends(get_db),
):
    service = AgentHandoffService(db)
    updated = service.update_criteria(criteria_id, criteria_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Handoff criteria not found")
    return updated


@router.delete("/{criteria_id}")
def delete_handoff_criteria(criteria_id: str, db: Session = Depends(get_db)):
    service = AgentHandoffService(db)
    success = service.delete_criteria(criteria_id)
    if not success:
        raise HTTPException(status_code=404, detail="Handoff criteria not found")
    return {"message": "Handoff criteria deleted"}
