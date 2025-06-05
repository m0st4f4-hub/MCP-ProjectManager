from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from ....database import get_sync_db as get_db
from ....services.agent_verification_service import AgentVerificationService

router = APIRouter()


def get_service(db: Session = Depends(get_db)) -> AgentVerificationService:
    return AgentVerificationService(db)


@router.get("/{agent_role_id}/verification-requirements")
def list_requirements(
    agent_role_id: str,
    service: AgentVerificationService = Depends(get_service),
):
    """Return verification requirements for a role."""
    return service.get_requirements(agent_role_id)


@router.post("/{agent_role_id}/verification-requirements")
def add_requirement(
    agent_role_id: str,
    requirement: str,
    description: Optional[str] = None,
    is_mandatory: bool = True,
    service: AgentVerificationService = Depends(get_service),
):
    """Create a verification requirement for an agent role."""
    return service.create_requirement(
        agent_role_id,
        requirement,
        description,
        is_mandatory,
    )


@router.put("/verification-requirements/{requirement_id}")
def update_requirement(
    requirement_id: str,
    requirement: Optional[str] = None,
    description: Optional[str] = None,
    is_mandatory: Optional[bool] = None,
    service: AgentVerificationService = Depends(get_service),
):
    """Update an existing verification requirement."""
    result = service.update_requirement(
        requirement_id,
        requirement,
        description,
        is_mandatory,
    )
    if not result:
        raise HTTPException(
            status_code=404,
            detail="Verification requirement not found",
        )
    return result


@router.delete("/verification-requirements/{requirement_id}")
def remove_requirement(
    requirement_id: str,
    service: AgentVerificationService = Depends(get_service),
):
    """Remove a verification requirement."""
    success = service.delete_requirement(requirement_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Verification requirement not found",
        )
    return {"message": "Verification requirement removed successfully"}
