from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException

from ....database import get_db
from ....services.agent_capability_service import AgentCapabilityService
from ....schemas.agent_capability import (
    AgentCapability,
    AgentCapabilityCreate,
    AgentCapabilityUpdate,
)

router = APIRouter()


async def get_service(db: AsyncSession = Depends(get_db)) -> AgentCapabilityService:
    return AgentCapabilityService(db)


@router.get("/{role_id}/capabilities", response_model=List[AgentCapability])
async def list_capabilities(
    role_id: str,
    service: AgentCapabilityService = Depends(get_service),
):
    return await service.list_capabilities(agent_role_id=role_id)


@router.post("/{role_id}/capabilities", response_model=AgentCapability)
async def create_capability(
    role_id: str,
    capability_in: AgentCapabilityCreate,
    service: AgentCapabilityService = Depends(get_service),
):
    data = capability_in.copy(update={"agent_role_id": role_id})
    return await service.create_capability(data)


@router.put("/capabilities/{capability_id}", response_model=AgentCapability)
async def update_capability(
    capability_id: str,
    capability_update: AgentCapabilityUpdate,
    service: AgentCapabilityService = Depends(get_service),
):
    updated = await service.update_capability(capability_id, capability_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Capability not found")
    return updated


@router.delete("/capabilities/{capability_id}")
async def delete_capability(
    capability_id: str,
    service: AgentCapabilityService = Depends(get_service),
):
    success = await service.delete_capability(capability_id)
    if not success:
        raise HTTPException(status_code=404, detail="Capability not found")
    return {"message": "Capability deleted successfully"}
