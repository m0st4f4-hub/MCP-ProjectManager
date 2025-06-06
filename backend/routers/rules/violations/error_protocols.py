from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ....database import get_db
from ....services.agent_error_protocol_service import AgentErrorProtocolService
from ....schemas.agent_error_protocol import (
    AgentErrorProtocol,
    AgentErrorProtocolCreate,
    AgentErrorProtocolUpdate,
)
from ....schemas.api_responses import DataResponse

router = APIRouter()


async def get_service(db: AsyncSession = Depends(get_db)) -> AgentErrorProtocolService:
    return AgentErrorProtocolService(db)


@router.get("/error-protocols/{protocol_id}", response_model=AgentErrorProtocol)
async def read_error_protocol(protocol_id: str, service: AgentErrorProtocolService = Depends(get_service)):
    protocol = await service.get_protocol(protocol_id)
    if not protocol:
        raise HTTPException(status_code=404, detail="Error protocol not found")
    return protocol


@router.get("/{role_id}/error-protocols", response_model=List[AgentErrorProtocol])
async def list_error_protocols(role_id: str, service: AgentErrorProtocolService = Depends(get_service)):
    return await service.list_protocols(agent_role_id=role_id)


@router.post("/{role_id}/error-protocols", response_model=AgentErrorProtocol)
async def create_error_protocol(
    role_id: str,
    protocol_in: AgentErrorProtocolCreate,
    service: AgentErrorProtocolService = Depends(get_service),
):
    protocol_data = protocol_in.copy(update={"agent_role_id": role_id})
    return await service.create_protocol(protocol_data)


@router.put("/error-protocols/{protocol_id}", response_model=AgentErrorProtocol)
async def update_error_protocol(
    protocol_id: str,
    protocol_update: AgentErrorProtocolUpdate,
    service: AgentErrorProtocolService = Depends(get_service),
):
    updated = await service.update_protocol(protocol_id, protocol_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Error protocol not found")
    return updated


@router.delete("/error-protocols/{protocol_id}", response_model=DataResponse[bool])
async def delete_error_protocol(protocol_id: str, service: AgentErrorProtocolService = Depends(get_service)):
    success = await service.delete_protocol(protocol_id)
    if not success:
        raise HTTPException(status_code=404, detail="Error protocol not found")
    return DataResponse[bool](data=True, message="Error protocol deleted successfully")
