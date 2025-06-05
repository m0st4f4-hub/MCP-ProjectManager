from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ....database import get_sync_db as get_db
from ....services.agent_forbidden_action_service import AgentForbiddenActionService
from ....models import AgentForbiddenAction

router = APIRouter()


def get_service(db: Session = Depends(get_db)) -> AgentForbiddenActionService:
    return AgentForbiddenActionService(db)


@router.post("/{agent_role_id}/forbidden-actions", response_model=AgentForbiddenAction)
def create_forbidden_action(
    agent_role_id: str,
    action: str,
    reason: Optional[str] = None,
    service: AgentForbiddenActionService = Depends(get_service),
) -> AgentForbiddenAction:
    """Add a forbidden action to an agent role."""
    return service.create(agent_role_id, action, reason)


@router.get("/{agent_role_id}/forbidden-actions", response_model=List[AgentForbiddenAction])
def list_forbidden_actions(
    agent_role_id: str,
    service: AgentForbiddenActionService = Depends(get_service),
) -> List[AgentForbiddenAction]:
    """List forbidden actions for an agent role."""
    return service.list(agent_role_id)


@router.delete("/forbidden-actions/{action_id}")
def delete_forbidden_action(
    action_id: str,
    service: AgentForbiddenActionService = Depends(get_service),
) -> dict:
    """Remove a forbidden action."""
    success = service.delete(action_id)
    if not success:
        raise HTTPException(status_code=404, detail="Forbidden action not found")
    return {"message": "Forbidden action removed successfully"}
