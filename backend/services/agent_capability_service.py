from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .. import models
from ..schemas.agent_capability import (
    AgentCapabilityCreate,
    AgentCapabilityUpdate,
)


class AgentCapabilityService:
    """Service providing CRUD operations for AgentCapability."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_capability(
        self, capability_id: str
    ) -> Optional[models.AgentCapability]:
        query = select(models.AgentCapability).filter(
            models.AgentCapability.id == capability_id
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_capabilities(
        self, agent_role_id: Optional[str] = None
    ) -> List[models.AgentCapability]:
        query = select(models.AgentCapability)
        if agent_role_id:
            query = query.filter(models.AgentCapability.agent_role_id == agent_role_id)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_capability(
        self, capability_in: AgentCapabilityCreate
    ) -> models.AgentCapability:
        capability = models.AgentCapability(
            agent_role_id=capability_in.agent_role_id,
            capability=capability_in.capability,
            description=capability_in.description,
            is_active=capability_in.is_active,
        )
        self.db.add(capability)
        await self.db.commit()
        await self.db.refresh(capability)
        return capability

    async def update_capability(
        self, capability_id: str, capability_update: AgentCapabilityUpdate
    ) -> Optional[models.AgentCapability]:
        capability = await self.get_capability(capability_id)
        if not capability:
            return None
        update_data = capability_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(capability, field, value)
        await self.db.commit()
        await self.db.refresh(capability)
        return capability

    async def delete_capability(self, capability_id: str) -> bool:
        capability = await self.get_capability(capability_id)
        if not capability:
            return False
        await self.db.delete(capability)
        await self.db.commit()
        return True
