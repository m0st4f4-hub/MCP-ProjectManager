"""Service layer for agent error protocols."""

from typing import List, Optional
from sqlalchemy.orm import Session

from backend import models
from backend.schemas.error_protocol import ErrorProtocolCreate


class ErrorProtocolService:
    """Manage agent error protocols."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def add_protocol(
        self, role_id: str, protocol_in: ErrorProtocolCreate
    ) -> models.AgentErrorProtocol:
        """Create a new error protocol for an agent role."""
        protocol = models.AgentErrorProtocol(
            agent_role_id=role_id,
            error_type=protocol_in.error_type,
            protocol=protocol_in.handling_strategy,
            priority=protocol_in.priority,
            is_active=protocol_in.is_active,
        )
        self.db.add(protocol)
        self.db.commit()
        self.db.refresh(protocol)
        return protocol

    def list_protocols(
        self, role_id: Optional[str] = None
    ) -> List[models.AgentErrorProtocol]:
        query = self.db.query(models.AgentErrorProtocol)
        if role_id:
            query = query.filter(models.AgentErrorProtocol.agent_role_id == role_id)
        return query.all()

    def remove_protocol(self, protocol_id: str) -> bool:
        protocol = (
            self.db.query(models.AgentErrorProtocol)
            .filter(models.AgentErrorProtocol.id == protocol_id)
            .first()
        )
        if not protocol:
            return False
        self.db.delete(protocol)
        self.db.commit()
        return True
