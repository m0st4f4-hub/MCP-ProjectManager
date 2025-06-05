from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models


class AgentVerificationService:
    """Service for CRUD operations on AgentVerificationRequirement."""

    def __init__(self, db: Session):
        self.db = db

    def get_requirements(
        self, role_id: str
    ) -> List[models.AgentVerificationRequirement]:
        query = (
            self.db.query(models.AgentVerificationRequirement)
            .filter(models.AgentVerificationRequirement.agent_role_id == role_id)
        )
        return query.all()

    def create_requirement(
        self,
        role_id: str,
        requirement: str,
        description: Optional[str] = None,
        is_mandatory: bool = True,
    ) -> models.AgentVerificationRequirement:
        new_req = models.AgentVerificationRequirement(
            agent_role_id=role_id,
            requirement=requirement,
            description=description,
            is_mandatory=is_mandatory,
        )
        self.db.add(new_req)
        self.db.commit()
        self.db.refresh(new_req)
        return new_req

    def update_requirement(
        self,
        requirement_id: str,
        requirement: Optional[str] = None,
        description: Optional[str] = None,
        is_mandatory: Optional[bool] = None,
    ) -> Optional[models.AgentVerificationRequirement]:
        req = (
            self.db.query(models.AgentVerificationRequirement)
            .filter(models.AgentVerificationRequirement.id == requirement_id)
            .first()
        )
        if not req:
            return None
        if requirement is not None:
            req.requirement = requirement
        if description is not None:
            req.description = description
        if is_mandatory is not None:
            req.is_mandatory = is_mandatory
        self.db.commit()
        self.db.refresh(req)
        return req

    def delete_requirement(self, requirement_id: str) -> bool:
        req = (
            self.db.query(models.AgentVerificationRequirement)
            .filter(models.AgentVerificationRequirement.id == requirement_id)
            .first()
        )
        if not req:
            return False
        self.db.delete(req)
        self.db.commit()
        return True
