from typing import List, Optional
from sqlalchemy.orm import Session

from backend import models
from backend.schemas.agent_verification_requirement import (
    AgentVerificationRequirementCreate,
)


class AgentVerificationService:
    """Service for managing agent verification requirements."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create_requirement(
        self, requirement_in: AgentVerificationRequirementCreate
    ) -> models.AgentVerificationRequirement:
        db_requirement = models.AgentVerificationRequirement(
            agent_role_id=requirement_in.agent_role_id,
            requirement=requirement_in.requirement,
            description=requirement_in.description,
            is_mandatory=requirement_in.is_mandatory,
        )
        self.db.add(db_requirement)
        self.db.commit()
        self.db.refresh(db_requirement)
        return db_requirement

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
        requirement = (
            self.db.query(models.AgentVerificationRequirement)
            .filter(models.AgentVerificationRequirement.id == requirement_id)
            .first()
        )
        if requirement is None:
            return False
        self.db.delete(requirement)
        self.db.commit()
        return True
