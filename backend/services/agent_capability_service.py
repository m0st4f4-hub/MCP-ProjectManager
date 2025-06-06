<<<<<<< HEAD
<<<<<<< HEAD
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
=======
=======
>>>>>>> origin/codex/add-agent-capability-service-and-router
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models
import uuid


class AgentCapabilityService:
    """Service for agent capability CRUD operations."""

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        role_id: str,
        capability: str,
        description: Optional[str] = None,
        is_active: bool = True,
    ) -> models.AgentCapability:
        new_capability = models.AgentCapability(
            id=str(uuid.uuid4()).replace("-", ""),
            agent_role_id=role_id,
            capability=capability,
            description=description,
            is_active=is_active,
        )
        self.db.add(new_capability)
        self.db.commit()
        self.db.refresh(new_capability)
        return new_capability

    def list(self, role_id: Optional[str] = None) -> List[models.AgentCapability]:
        query = self.db.query(models.AgentCapability)
        if role_id is not None:
            query = query.filter(models.AgentCapability.agent_role_id == role_id)
        return query.all()

    def update(
        self,
        capability_id: str,
        capability: Optional[str] = None,
        description: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Optional[models.AgentCapability]:
        db_cap = (
            self.db.query(models.AgentCapability)
            .filter(models.AgentCapability.id == capability_id)
            .first()
        )
        if not db_cap:
            return None

        if capability is not None:
            db_cap.capability = capability
        if description is not None:
            db_cap.description = description
        if is_active is not None:
            db_cap.is_active = is_active

        self.db.commit()
        self.db.refresh(db_cap)
        return db_cap

    def delete(self, capability_id: str) -> bool:
        db_cap = (
            self.db.query(models.AgentCapability)
            .filter(models.AgentCapability.id == capability_id)
            .first()
        )
        if not db_cap:
            return False

        self.db.delete(db_cap)
        self.db.commit()
<<<<<<< HEAD
>>>>>>> origin/codex/add-agent-capability-service-and-router
=======
>>>>>>> origin/codex/add-agent-capability-service-and-router
        return True
