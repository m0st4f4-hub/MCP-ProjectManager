from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ....database import get_sync_db as get_db
from ....schemas.agent_verification_requirement import (
    AgentVerificationRequirement,
    AgentVerificationRequirementCreate,
    AgentVerificationRequirementUpdate,
)
from ....services.agent_verification_service import AgentVerificationService

router = APIRouter()


def get_service(db: Session = Depends(get_db)) -> AgentVerificationService:
    return AgentVerificationService(db)


@router.post(
    "/{agent_role_id}/verification-requirements",
    response_model=AgentVerificationRequirement,
)
def create_verification_requirement(
    agent_role_id: str,
    requirement: AgentVerificationRequirementCreate,
    service: AgentVerificationService = Depends(get_service),
):
    data = requirement.model_copy(update={"agent_role_id": agent_role_id})
    return service.create_requirement(data)


@router.get(
    "/{agent_role_id}/verification-requirements",
    response_model=List[AgentVerificationRequirement],
)
def list_verification_requirements(
    agent_role_id: str,
    service: AgentVerificationService = Depends(get_service),
):
    return service.list_requirements(agent_role_id)


@router.put(
    "/verification-requirements/{requirement_id}",
    response_model=AgentVerificationRequirement,
)
def update_verification_requirement(
    requirement_id: str,
    requirement_update: AgentVerificationRequirementUpdate,
    service: AgentVerificationService = Depends(get_service),
):
    result = service.update_requirement(requirement_id, requirement_update)
    if not result:
        raise HTTPException(
            status_code=404,
            detail="Verification requirement not found",
        )
    return result


@router.delete("/verification-requirements/{requirement_id}")
def delete_verification_requirement(
    requirement_id: str,
    service: AgentVerificationService = Depends(get_service),
):
    success = service.delete_requirement(requirement_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Verification requirement not found",
        )
    return {"message": "Verification requirement removed successfully"}
