from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException, Path

from ....database import get_db
from ....auth import get_current_active_user
from ....models import User as UserModel
from ....services.agent_capability_service import AgentCapabilityService
from ....schemas.agent_capability import (
    AgentCapability,
    AgentCapabilityCreate,
    AgentCapabilityUpdate,
)

router = APIRouter()


async def get_service(db: AsyncSession = Depends(get_db)) -> AgentCapabilityService:
    return AgentCapabilityService(db)


@router.get(
    "/{role_id}/capabilities",
    response_model=List[AgentCapability],
)
async def list_capabilities(
    role_id: str = Path(..., min_length=32, max_length=32),
    service: AgentCapabilityService = Depends(get_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    return await service.list_capabilities(agent_role_id=role_id)


@router.post("/{role_id}/capabilities", response_model=AgentCapability)
async def create_capability(
    role_id: str = Path(..., min_length=32, max_length=32),
    capability_in: AgentCapabilityCreate,
    service: AgentCapabilityService = Depends(get_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    data = capability_in.copy(update={"agent_role_id": role_id})
    return await service.create_capability(data)


@router.put("/capabilities/{capability_id}", response_model=AgentCapability)
async def update_capability(
    capability_id: str = Path(..., min_length=32, max_length=32),
    capability_update: AgentCapabilityUpdate,
    service: AgentCapabilityService = Depends(get_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    updated = await service.update_capability(capability_id, capability_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Capability not found")
    return updated


@router.delete("/capabilities/{capability_id}")
async def delete_capability(
    capability_id: str = Path(..., min_length=32, max_length=32),
    service: AgentCapabilityService = Depends(get_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    success = await service.delete_capability(capability_id)
    if not success:
        raise HTTPException(status_code=404, detail="Capability not found")
    return {"message": "Capability deleted successfully"}
