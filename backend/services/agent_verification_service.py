<<<<<<< HEAD
<<<<<<< HEAD
from sqlalchemy.orm import Session
from typing import List, Optional
=======
from typing import List, Optional
from sqlalchemy.orm import Session
>>>>>>> origin/codex/add-agent-verification-service-and-router
=======
from typing import List, Optional
from sqlalchemy.orm import Session
>>>>>>> origin/codex/add-agent-verification-service-and-router

from .. import models
from ..schemas.agent_verification_requirement import (
    AgentVerificationRequirementCreate,
)


class AgentVerificationService:
    """Service for managing agent verification requirements."""

<<<<<<< HEAD
<<<<<<< HEAD
    def __init__(self, db: Session):
=======
    def __init__(self, db: Session) -> None:
>>>>>>> origin/codex/add-agent-verification-service-and-router
=======
    def __init__(self, db: Session) -> None:
>>>>>>> origin/codex/add-agent-verification-service-and-router
        self.db = db

    def create_requirement(
        self, requirement_in: AgentVerificationRequirementCreate
    ) -> models.AgentVerificationRequirement:
<<<<<<< HEAD
<<<<<<< HEAD
        db_req = models.AgentVerificationRequirement(
=======
        db_requirement = models.AgentVerificationRequirement(
>>>>>>> origin/codex/add-agent-verification-service-and-router
=======
        db_requirement = models.AgentVerificationRequirement(
>>>>>>> origin/codex/add-agent-verification-service-and-router
            agent_role_id=requirement_in.agent_role_id,
            requirement=requirement_in.requirement,
            description=requirement_in.description,
            is_mandatory=requirement_in.is_mandatory,
        )
<<<<<<< HEAD
<<<<<<< HEAD
        self.db.add(db_req)
        self.db.commit()
        self.db.refresh(db_req)
        return db_req
=======
=======
>>>>>>> origin/codex/add-agent-verification-service-and-router
        self.db.add(db_requirement)
        self.db.commit()
        self.db.refresh(db_requirement)
        return db_requirement
<<<<<<< HEAD
>>>>>>> origin/codex/add-agent-verification-service-and-router
=======
>>>>>>> origin/codex/add-agent-verification-service-and-router

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
<<<<<<< HEAD
<<<<<<< HEAD
        db_obj = (
=======
        requirement = (
>>>>>>> origin/codex/add-agent-verification-service-and-router
=======
        requirement = (
>>>>>>> origin/codex/add-agent-verification-service-and-router
            self.db.query(models.AgentVerificationRequirement)
            .filter(models.AgentVerificationRequirement.id == requirement_id)
            .first()
        )
<<<<<<< HEAD
<<<<<<< HEAD
        if not db_obj:
            return False
        self.db.delete(db_obj)
=======
        if requirement is None:
            return False
        self.db.delete(requirement)
>>>>>>> origin/codex/add-agent-verification-service-and-router
=======
        if requirement is None:
            return False
        self.db.delete(requirement)
>>>>>>> origin/codex/add-agent-verification-service-and-router
        self.db.commit()
        return True
