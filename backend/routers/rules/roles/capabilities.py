from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ....database import get_sync_db as get_db
from ....services.agent_capability_service import AgentCapabilityService
from ....models import AgentCapability

router = APIRouter()


def get_service(db: Session = Depends(get_db)) -> AgentCapabilityService:
    return AgentCapabilityService(db)


@router.post("/{agent_role_id}/capabilities", response_model=AgentCapability)
def create_capability(
    agent_role_id: str,
    capability: str,
    description: Optional[str] = None,
    service: AgentCapabilityService = Depends(get_service),
):
    """Add a capability to an agent role."""
    return service.create_capability(agent_role_id, capability, description)


@router.get("/{agent_role_id}/capabilities", response_model=List[AgentCapability])
def list_capabilities(
    agent_role_id: str,
    active_only: bool = True,
    service: AgentCapabilityService = Depends(get_service),
):
    """List capabilities for an agent role."""
    return service.list_capabilities(
        agent_role_id=agent_role_id,
        active_only=active_only,
    )


@router.put("/capabilities/{capability_id}", response_model=AgentCapability)
def update_capability(
    capability_id: str,
    capability: Optional[str] = None,
    description: Optional[str] = None,
    is_active: Optional[bool] = None,
    service: AgentCapabilityService = Depends(get_service),
):
    """Update an existing capability."""
    result = service.update_capability(
        capability_id,
        capability,
        description,
        is_active,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Capability not found")
    return result


@router.delete("/capabilities/{capability_id}")
def delete_capability(
    capability_id: str,
    service: AgentCapabilityService = Depends(get_service),
):
    """Remove a capability from a role."""
    success = service.delete_capability(capability_id)
    if not success:
        raise HTTPException(status_code=404, detail="Capability not found")
    return {"message": "Capability removed successfully"}
