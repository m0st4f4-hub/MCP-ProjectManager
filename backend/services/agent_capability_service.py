from sqlalchemy.orm import Session
from backend import models
from backend.schemas.agent_capability import AgentCapabilityCreate, AgentCapabilityUpdate
from typing import List, Optional
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
        return True

    def create_capability(self, capability: AgentCapabilityCreate) -> models.AgentCapability:
        db_capability = models.AgentCapability(**capability.model_dump())
        self.db.add(db_capability)
        self.db.commit()
        self.db.refresh(db_capability)
        return db_capability

    def get_capability(self, capability_id: str) -> Optional[models.AgentCapability]:
        return (
            self.db.query(models.AgentCapability)
            .filter(models.AgentCapability.id == capability_id)
            .first()
        )

    def get_capabilities(self, skip: int = 0, limit: int = 100) -> List[models.AgentCapability]:
        return self.db.query(models.AgentCapability).offset(skip).limit(limit).all()

    def get_capabilities_by_agent(self, agent_id: str) -> List[models.AgentCapability]:
        return (
            self.db.query(models.AgentCapability)
            .filter(models.AgentCapability.agent_id == agent_id)
            .all()
        )

    def update_capability(
        self, capability_id: str, capability_update: AgentCapabilityUpdate
    ) -> Optional[models.AgentCapability]:
        db_capability = self.get_capability(capability_id)
        if not db_capability:
            return None
        update_data = capability_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_capability, key, value)
        self.db.commit()
        self.db.refresh(db_capability)
        return db_capability

    def delete_capability(self, capability_id: str) -> bool:
        db_capability = self.get_capability(capability_id)
        if not db_capability:
            return False
        self.db.delete(db_capability)
        self.db.commit()
        return True

    def get_capabilities_by_category(self, category: str) -> List[models.AgentCapability]:
        return (
            self.db.query(models.AgentCapability)
            .filter(models.AgentCapability.category == category)
            .all()
        )
