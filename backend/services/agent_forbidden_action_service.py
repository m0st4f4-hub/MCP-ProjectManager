from typing import List, Optional
from sqlalchemy.orm import Session

from .. import models


class AgentForbiddenActionService:
    """Service for managing agent forbidden actions."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create_action(
        self, agent_role_id: str, action: str, reason: Optional[str] = None
    ) -> models.AgentForbiddenAction:
        """Create a forbidden action for an agent role."""
        db_action = models.AgentForbiddenAction(
            agent_role_id=agent_role_id,
            action=action,
            reason=reason,
            is_active=True,
        )
        self.db.add(db_action)
        self.db.commit()
        self.db.refresh(db_action)
        return db_action

    def list_actions(
        self, agent_role_id: Optional[str] = None
    ) -> List[models.AgentForbiddenAction]:
        """List forbidden actions, optionally filtered by agent role."""
        query = self.db.query(models.AgentForbiddenAction)
        if agent_role_id:
            query = query.filter(
                models.AgentForbiddenAction.agent_role_id == agent_role_id
            )
        return query.all()

    def get_action(self, action_id: str) -> Optional[models.AgentForbiddenAction]:
        """Retrieve a single forbidden action by ID."""
        return (
            self.db.query(models.AgentForbiddenAction)
            .filter(models.AgentForbiddenAction.id == action_id)
            .first()
        )

    def update_action(
        self,
        action_id: str,
        action: Optional[str] = None,
        reason: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Optional[models.AgentForbiddenAction]:
        """Update a forbidden action."""
        db_action = self.get_action(action_id)
        if not db_action:
            return None
        if action is not None:
            db_action.action = action
        if reason is not None:
            db_action.reason = reason
        if is_active is not None:
            db_action.is_active = is_active
        self.db.commit()
        self.db.refresh(db_action)
        return db_action

    def delete_action(self, action_id: str) -> bool:
        """Delete a forbidden action by ID."""
        db_action = self.get_action(action_id)
        if not db_action:
            return False
        self.db.delete(db_action)
        self.db.commit()
        return True
