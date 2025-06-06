from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models
from ..schemas.agent_verification_requirement import (
    AgentVerificationRequirementCreate,
)


class AgentVerificationService:
    """Service for managing agent verification requirements."""

    def __init__(self, db: Session):
        self.db = db

    def create_requirement(
        self, requirement_in: AgentVerificationRequirementCreate
    ) -> models.AgentVerificationRequirement:
        db_req = models.AgentVerificationRequirement(
            agent_role_id=requirement_in.agent_role_id,
            requirement=requirement_in.requirement,
            description=requirement_in.description,
            is_mandatory=requirement_in.is_mandatory,
        )
        self.db.add(db_req)
        self.db.commit()
        self.db.refresh(db_req)
        return db_req

    def list_requirements(
        self, agent_role_id: Optional[str] = None
    ) -> List[models.AgentVerificationRequirement]:
        query = self.db.query(models.AgentVerificationRequirement)
        if agent_role_id:
            query = query.filter(
                models.AgentVerificationRequirement.agent_role_id == agent_role_id
            )
        return query.all()

    def delete_requirement(self, requirement_id: str) -> bool:
        db_obj = (
            self.db.query(models.AgentVerificationRequirement)
            .filter(models.AgentVerificationRequirement.id == requirement_id)
            .first()
        )
        if not db_obj:
            return False
        self.db.delete(db_obj)
        self.db.commit()
        return True
