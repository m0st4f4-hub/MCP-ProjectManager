from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from .. import models
from ..crud import rules as crud_rules
from ..schemas import rules as schemas


class AgentErrorProtocolService:
    """Service for managing agent error handling protocols."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_error_protocol(
        self, role_id: str, error_protocol: schemas.ErrorProtocolCreate
    ) -> models.AgentErrorProtocol:
        """Create a new error protocol for the given agent role."""
        return await crud_rules.create_error_protocol(
            self.db, role_id, error_protocol
        )

    async def update_error_protocol(
        self, protocol_id: str, protocol_update: schemas.ErrorProtocolUpdate
    ) -> Optional[models.AgentErrorProtocol]:
        """Update an existing error protocol."""
        return await crud_rules.update_error_protocol(
            self.db, protocol_id, protocol_update
        )

    async def delete_error_protocol(self, protocol_id: str) -> bool:
        """Delete an error protocol by ID."""
        return await crud_rules.delete_error_protocol(self.db, protocol_id)

    async def get_error_protocols_for_role(
        self, role_id: str
    ) -> List[models.AgentErrorProtocol]:
        """Retrieve all error protocols for a specific agent role."""
        role = await crud_rules.get_agent_role(self.db, role_id)
        return role.error_protocols if role else []
