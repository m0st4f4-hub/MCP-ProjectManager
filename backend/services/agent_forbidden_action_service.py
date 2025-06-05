from typing import List, Optional
from sqlalchemy.orm import Session

from .. import models


class AgentForbiddenActionService:
    """Service for managing agent forbidden actions."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, agent_role_id: str, action: str, reason: Optional[str] = None) -> models.AgentForbiddenAction:
        """Create a forbidden action for a given agent role."""
        forbidden = models.AgentForbiddenAction(
            agent_role_id=agent_role_id,
            action=action,
            reason=reason,
            is_active=True,
        )
        self.db.add(forbidden)
        self.db.commit()
        self.db.refresh(forbidden)
        return forbidden

    def list(self, agent_role_id: Optional[str] = None) -> List[models.AgentForbiddenAction]:
        """List forbidden actions, optionally filtered by agent role."""
        query = self.db.query(models.AgentForbiddenAction)
        if agent_role_id:
            query = query.filter(models.AgentForbiddenAction.agent_role_id == agent_role_id)
        return query.all()

    def delete(self, action_id: str) -> bool:
        """Delete a forbidden action by ID."""
        action = (
            self.db.query(models.AgentForbiddenAction)
            .filter(models.AgentForbiddenAction.id == action_id)
            .first()
        )
        if action:
            self.db.delete(action)
            self.db.commit()
            return True
        return False
