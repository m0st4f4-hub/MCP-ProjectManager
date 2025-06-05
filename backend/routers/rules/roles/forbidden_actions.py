from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ....database import get_sync_db as get_db
from ....services.agent_forbidden_action_service import AgentForbiddenActionService
from ....models.agent_forbidden_action import AgentForbiddenAction

router = APIRouter()


@router.post("/", response_model=AgentForbiddenAction)
def create_forbidden_action(
    role_id: str,
    action: str,
    reason: Optional[str] = None,
    db: Session = Depends(get_db),
) -> AgentForbiddenAction:
    """Create a forbidden action for an agent role."""
    service = AgentForbiddenActionService(db)
    return service.create_action(role_id, action, reason)


@router.get("/", response_model=List[AgentForbiddenAction])
def list_forbidden_actions(
    role_id: Optional[str] = Query(None, description="Filter by agent role"),
    db: Session = Depends(get_db),
) -> List[AgentForbiddenAction]:
    """List forbidden actions, optionally filtered by role."""
    service = AgentForbiddenActionService(db)
    return service.list_actions(role_id)


@router.delete("/{action_id}")
def delete_forbidden_action(action_id: str, db: Session = Depends(get_db)):
    """Delete a forbidden action by ID."""
    service = AgentForbiddenActionService(db)
    success = service.delete_action(action_id)
    if not success:
        raise HTTPException(status_code=404, detail="Forbidden action not found")
    return {"message": "Forbidden action removed successfully"}
