from typing import List, Optional
from sqlalchemy.orm import Session

from .. import models


class AgentForbiddenActionService:
    """Service for managing agent forbidden actions."""

    def __init__(self, db: Session) -> None:
        self.db = db

<<<<<<< HEAD
    def create_action(
        self, role_id: str, action: str, reason: Optional[str] = None
    ) -> models.AgentForbiddenAction:
        """Create a forbidden action for an agent role."""
        db_action = models.AgentForbiddenAction(
            agent_role_id=role_id,
=======
    def create(self, agent_role_id: str, action: str, reason: Optional[str] = None) -> models.AgentForbiddenAction:
        """Create a forbidden action for a given agent role."""
        forbidden = models.AgentForbiddenAction(
            agent_role_id=agent_role_id,
>>>>>>> main
            action=action,
            reason=reason,
            is_active=True,
        )
<<<<<<< HEAD
        self.db.add(db_action)
        self.db.commit()
        self.db.refresh(db_action)
        return db_action

    def list_actions(
        self, role_id: Optional[str] = None
    ) -> List[models.AgentForbiddenAction]:
        """List forbidden actions, optionally filtered by agent role."""
        query = self.db.query(models.AgentForbiddenAction)
        if role_id:
            query = query.filter(models.AgentForbiddenAction.agent_role_id == role_id)
        return query.all()

    def delete_action(self, action_id: str) -> bool:
        """Delete a forbidden action by ID."""
        db_action = (
=======
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
>>>>>>> main
            self.db.query(models.AgentForbiddenAction)
            .filter(models.AgentForbiddenAction.id == action_id)
            .first()
        )
<<<<<<< HEAD
        if not db_action:
            return False
        self.db.delete(db_action)
        self.db.commit()
        return True
=======
        if action:
            self.db.delete(action)
            self.db.commit()
            return True
        return False
>>>>>>> main
