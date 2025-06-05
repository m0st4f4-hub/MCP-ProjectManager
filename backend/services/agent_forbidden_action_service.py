from typing import List, Optional
from sqlalchemy.orm import Session

from .. import models
from ..crud import rules as crud_rules


class AgentForbiddenActionService:
    """Service layer for agent forbidden actions."""

    def __init__(self, db: Session) -> None:
        self.db = db

    async def create_forbidden_action(
        self, role_id: str, action: str, reason: Optional[str] = None
    ) -> models.AgentForbiddenAction:
        return await crud_rules.add_forbidden_action(self.db, role_id, action, reason)

    async def list_forbidden_actions(
        self, role_id: str
    ) -> List[models.AgentForbiddenAction]:
        return await crud_rules.get_forbidden_actions(self.db, role_id)

    async def delete_forbidden_action(self, action_id: str) -> bool:
        return await crud_rules.remove_forbidden_action(self.db, action_id)
