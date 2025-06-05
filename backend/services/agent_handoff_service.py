from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models
from ..schemas.agent_handoff_criteria import AgentHandoffCriteriaCreate


class AgentHandoffService:
    """Service for managing agent handoff criteria."""

    def __init__(self, db: Session):
        self.db = db

    def create_criteria(self, criteria_in: AgentHandoffCriteriaCreate) -> models.AgentHandoffCriteria:
        db_criteria = models.AgentHandoffCriteria(
            agent_role_id=criteria_in.agent_role_id,
            criteria=criteria_in.criteria,
            description=criteria_in.description,
            target_agent_role=criteria_in.target_agent_role,
            is_active=criteria_in.is_active,
        )
        self.db.add(db_criteria)
        self.db.commit()
        self.db.refresh(db_criteria)
        return db_criteria

    def list_criteria(self, agent_role_id: Optional[str] = None) -> List[models.AgentHandoffCriteria]:
        query = self.db.query(models.AgentHandoffCriteria)
        if agent_role_id:
            query = query.filter(models.AgentHandoffCriteria.agent_role_id == agent_role_id)
        return query.all()

    def delete_criteria(self, criteria_id: str) -> bool:
        db_obj = (
            self.db.query(models.AgentHandoffCriteria)
            .filter(models.AgentHandoffCriteria.id == criteria_id)
            .first()
        )
        if not db_obj:
            return False
        self.db.delete(db_obj)
        self.db.commit()
        return True
