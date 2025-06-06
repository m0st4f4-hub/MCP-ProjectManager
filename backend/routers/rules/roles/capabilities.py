from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ....database import get_sync_db as get_db
from ....services.agent_capability_service import AgentCapabilityService
from ....schemas.api_responses import DataResponse, ListResponse


class CapabilityCreate(BaseModel):
    capability: str
    description: Optional[str] = None
    is_active: bool = True


class CapabilityUpdate(BaseModel):
    capability: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class Capability(BaseModel):
    id: str
    agent_role_id: str
    capability: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


router = APIRouter(prefix="/capabilities", tags=["Agent Capabilities"])


def get_service(db: Session = Depends(get_db)) -> AgentCapabilityService:
    return AgentCapabilityService(db)


@router.post(
    "/{role_id}",
    response_model=DataResponse[Capability],
    status_code=status.HTTP_201_CREATED,
)
def create_capability_endpoint(
    role_id: str,
    capability: CapabilityCreate,
    service: AgentCapabilityService = Depends(get_service),
):
    created = service.create(
        role_id=role_id,
        capability=capability.capability,
        description=capability.description,
        is_active=capability.is_active,
    )
    return DataResponse[Capability](
        data=Capability.model_validate(created),
        message="Capability created",
    )


@router.get("/{role_id}", response_model=ListResponse[Capability])
def list_capabilities_endpoint(
    role_id: str,
    service: AgentCapabilityService = Depends(get_service),
):
    caps = service.list(role_id)
    data = [Capability.model_validate(c) for c in caps]
    return ListResponse[Capability](
        data=data,
        total=len(data),
        page=1,
        page_size=len(data),
        has_more=False,
    )


@router.put(
    "/{capability_id}",
    response_model=DataResponse[Capability],
)
def update_capability_endpoint(
    capability_id: str,
    capability_update: CapabilityUpdate,
    service: AgentCapabilityService = Depends(get_service),
):
    updated = service.update(
        capability_id,
        capability=capability_update.capability,
        description=capability_update.description,
        is_active=capability_update.is_active,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Capability not found")
    return DataResponse[Capability](
        data=Capability.model_validate(updated),
        message="Capability updated",
    )


@router.delete("/{capability_id}", response_model=DataResponse[bool])
def delete_capability_endpoint(
    capability_id: str,
    service: AgentCapabilityService = Depends(get_service),
):
    success = service.delete(capability_id)
    if not success:
        raise HTTPException(status_code=404, detail="Capability not found")
    return DataResponse[bool](data=True, message="Capability deleted")
