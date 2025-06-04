from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from ....database import get_db
from ....crud import rules as crud_rules

router = APIRouter()  # Agent Forbidden Actions
@router.post("/{agent_role_id}/forbidden-actions")


def add_forbidden_action(
    agent_role_id: str,
    action: str,
    reason: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Add a forbidden action to an agent role"""
    return crud_rules.add_forbidden_action(db, agent_role_id, action, reason)

@router.delete("/forbidden-actions/{action_id}")


def remove_forbidden_action(
    action_id: str,
    db: Session = Depends(get_db)
):
    """Remove a forbidden action"""
    success = crud_rules.remove_forbidden_action(db, action_id)
    if not success:
    raise HTTPException(status_code=404, detail="Forbidden action not found")
    return {"message": "Forbidden action removed successfully"}
