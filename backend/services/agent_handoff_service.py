from sqlalchemy.orm import Session
from typing import List, Optional

from backend import models
from backend.schemas.agent_handoff_criteria import (
    AgentHandoffCriteriaCreate,
    AgentHandoffCriteriaUpdate,
)


class AgentHandoffService:
    """Service for CRUD operations on AgentHandoffCriteria."""

    def __init__(self, db: Session):
        self.db = db

    def create_criteria(
        self, criteria_in: AgentHandoffCriteriaCreate
    ) -> models.AgentHandoffCriteria:
        db_obj = models.AgentHandoffCriteria(
            agent_role_id=criteria_in.agent_role_id,
            criteria=criteria_in.criteria,
            description=criteria_in.description,
            target_agent_role=criteria_in.target_agent_role,
            is_active=criteria_in.is_active,
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def get_criteria(self, criteria_id: str) -> Optional[models.AgentHandoffCriteria]:
        return (
            self.db.query(models.AgentHandoffCriteria)
            .filter(models.AgentHandoffCriteria.id == criteria_id)
            .first()
        )

    def get_criteria_list(
        self, agent_role_id: Optional[str] = None
    ) -> List[models.AgentHandoffCriteria]:
        query = self.db.query(models.AgentHandoffCriteria)
        if agent_role_id:
            query = query.filter(
                models.AgentHandoffCriteria.agent_role_id == agent_role_id
            )
        return query.all()

    def update_criteria(
        self, criteria_id: str, criteria_update: AgentHandoffCriteriaUpdate
    ) -> Optional[models.AgentHandoffCriteria]:
        db_obj = self.get_criteria(criteria_id)
        if not db_obj:
            return None
        update_data = criteria_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete_criteria(self, criteria_id: str) -> bool:
        db_obj = self.get_criteria(criteria_id)
        if not db_obj:
            return False
        self.db.delete(db_obj)
        self.db.commit()
        return True
