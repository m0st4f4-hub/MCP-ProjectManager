<<<<<<< HEAD
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
=======
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
>>>>>>> origin/codex/add-agent-verification-service-and-router

from ....database import get_sync_db as get_db
from ....services.agent_verification_service import AgentVerificationService
from ....schemas.agent_verification_requirement import (
    AgentVerificationRequirement,
    AgentVerificationRequirementCreate,
)

router = APIRouter()


<<<<<<< HEAD
@router.get("/", response_model=List[AgentVerificationRequirement])
def list_verification_requirements(
    agent_role_id: Optional[str] = Query(None, description="Filter by agent role"),
    db: Session = Depends(get_db),
):
    """List verification requirements, optionally filtered by agent role."""
    service = AgentVerificationService(db)
    return service.list_requirements(agent_role_id)


@router.post("/", response_model=AgentVerificationRequirement)
def create_verification_requirement(
    requirement: AgentVerificationRequirementCreate,
    db: Session = Depends(get_db),
):
    """Create a new verification requirement."""
    service = AgentVerificationService(db)
    return service.create_requirement(requirement)


@router.delete("/{requirement_id}")
def delete_verification_requirement(
    requirement_id: str,
    db: Session = Depends(get_db),
):
    """Delete a verification requirement by ID."""
    service = AgentVerificationService(db)
    success = service.delete_requirement(requirement_id)
    if not success:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return {"message": "Verification requirement deleted successfully"}
=======
def get_service(db: Session = Depends(get_db)) -> AgentVerificationService:
    return AgentVerificationService(db)


@router.get(
    "/verification-requirements",
    response_model=List[AgentVerificationRequirement],
)
def list_verification_requirements(
    agent_role_id: Optional[str] = Query(None, description="Filter by agent role"),
    service: AgentVerificationService = Depends(get_service),
) -> List[AgentVerificationRequirement]:
    """List verification requirements, optionally filtered by agent role."""
    return service.list_requirements(agent_role_id)


@router.post("/verification-requirements", response_model=AgentVerificationRequirement)
def create_verification_requirement(
    requirement: AgentVerificationRequirementCreate,
    service: AgentVerificationService = Depends(get_service),
) -> AgentVerificationRequirement:
    """Create a new verification requirement."""
    return service.create_requirement(requirement)


@router.delete("/verification-requirements/{requirement_id}")
def delete_verification_requirement(
    requirement_id: str,
    service: AgentVerificationService = Depends(get_service),
):
    """Delete a verification requirement by ID."""
    success = service.delete_requirement(requirement_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Verification requirement not found",
        )
    return {"message": "Verification requirement deleted"}
>>>>>>> origin/codex/add-agent-verification-service-and-router
