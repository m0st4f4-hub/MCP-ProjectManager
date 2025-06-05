from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models


class AgentCapabilityService:
    """Service layer for managing agent capabilities."""

    def __init__(self, db: Session):
        self.db = db

    def create_capability(
        self,
        agent_role_id: str,
        capability: str,
        description: Optional[str] = None,
    ) -> models.AgentCapability:
        """Create and persist a new capability for an agent role."""
        db_capability = models.AgentCapability(
            agent_role_id=agent_role_id,
            capability=capability,
            description=description,
        )
        self.db.add(db_capability)
        self.db.commit()
        self.db.refresh(db_capability)
        return db_capability

    def update_capability(
        self,
        capability_id: str,
        capability: Optional[str] = None,
        description: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Optional[models.AgentCapability]:
        """Update an existing capability by ID."""
        db_capability = (
            self.db.query(models.AgentCapability)
            .filter(models.AgentCapability.id == capability_id)
            .first()
        )
        if not db_capability:
            return None

        if capability is not None:
            db_capability.capability = capability
        if description is not None:
            db_capability.description = description
        if is_active is not None:
            db_capability.is_active = is_active

        self.db.commit()
        self.db.refresh(db_capability)
        return db_capability

    def list_capabilities(
        self,
        agent_role_id: Optional[str] = None,
        active_only: bool = True,
    ) -> List[models.AgentCapability]:
        """Retrieve capabilities, optionally filtered by role and active state."""
        query = self.db.query(models.AgentCapability)
        if agent_role_id:
            query = query.filter(models.AgentCapability.agent_role_id == agent_role_id)
        if active_only:
            query = query.filter(models.AgentCapability.is_active.is_(True))
        return query.all()

    def delete_capability(self, capability_id: str) -> bool:
        """Remove a capability by ID."""
        db_capability = (
            self.db.query(models.AgentCapability)
            .filter(models.AgentCapability.id == capability_id)
            .first()
        )
        if not db_capability:
            return False

        self.db.delete(db_capability)
        self.db.commit()
        return True
