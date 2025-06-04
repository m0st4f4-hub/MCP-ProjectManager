from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from ....database import get_db
from ....crud import rules as crud_rules

router = APIRouter()  # Agent Capabilities
@router.post("/{agent_role_id}/capabilities")


def add_capability(
    agent_role_id: str,
    capability: str,
    description: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Add a capability to an agent role"""
    return crud_rules.add_agent_capability(db, agent_role_id, capability, description)

@router.delete("/capabilities/{capability_id}")


def remove_capability(
    capability_id: str,
    db: Session = Depends(get_db)
):
    """Remove an agent capability"""
    success = crud_rules.remove_agent_capability(db, capability_id)
    if not success:
    raise HTTPException(status_code=404, detail="Capability not found")
    return {"message": "Capability removed successfully"}
