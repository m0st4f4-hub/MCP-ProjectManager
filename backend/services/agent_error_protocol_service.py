from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend import models
from backend.schemas.agent_error_protocol import (
    AgentErrorProtocol,
    AgentErrorProtocolCreate,
    AgentErrorProtocolUpdate,
)


class AgentErrorProtocolService:
    """Service providing CRUD operations for AgentErrorProtocol."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_protocol(self, protocol_id: str) -> Optional[models.AgentErrorProtocol]:
        result = await self.db.execute(
            select(models.AgentErrorProtocol).filter(models.AgentErrorProtocol.id == protocol_id)
        )
        return result.scalar_one_or_none()

    async def list_protocols(
        self, agent_role_id: Optional[str] = None
    ) -> List[models.AgentErrorProtocol]:
        query = select(models.AgentErrorProtocol)
        if agent_role_id:
            query = query.filter(models.AgentErrorProtocol.agent_role_id == agent_role_id)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_protocol(
        self, protocol_in: AgentErrorProtocolCreate
    ) -> models.AgentErrorProtocol:
        db_protocol = models.AgentErrorProtocol(
            agent_role_id=protocol_in.agent_role_id,
            error_type=protocol_in.error_type,
            protocol=protocol_in.protocol,
            priority=protocol_in.priority,
            is_active=protocol_in.is_active,
        )
        self.db.add(db_protocol)
        await self.db.commit()
        await self.db.refresh(db_protocol)
        return db_protocol

    async def update_protocol(
        self, protocol_id: str, protocol_update: AgentErrorProtocolUpdate
    ) -> Optional[models.AgentErrorProtocol]:
        db_protocol = await self.get_protocol(protocol_id)
        if not db_protocol:
            return None
        update_data = protocol_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_protocol, field, value)
        await self.db.commit()
        await self.db.refresh(db_protocol)
        return db_protocol

    async def delete_protocol(self, protocol_id: str) -> bool:
        db_protocol = await self.get_protocol(protocol_id)
        if not db_protocol:
            return False
        await self.db.delete(db_protocol)
        await self.db.commit()
        return True
