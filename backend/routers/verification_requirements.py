from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_sync_db as get_db
from ..services.agent_verification_requirement_service import AgentVerificationRequirementService
from ..schemas.verification_requirement import (
    VerificationRequirement,
    VerificationRequirementCreate,
)

router = APIRouter(prefix="/verification-requirements", tags=["Verification Requirements"])


def get_service(db: Session = Depends(get_db)) -> AgentVerificationRequirementService:
    return AgentVerificationRequirementService(db)


@router.post("/", response_model=VerificationRequirement, status_code=201)
def create_requirement(
    requirement_in: VerificationRequirementCreate,
    service: AgentVerificationRequirementService = Depends(get_service),
):
    return service.create_requirement(requirement_in)


@router.get("/", response_model=List[VerificationRequirement])
def list_requirements(
    agent_role_id: Optional[str] = Query(None),
    service: AgentVerificationRequirementService = Depends(get_service),
):
    return service.list_requirements(agent_role_id)


@router.delete("/{requirement_id}")
def delete_requirement(
    requirement_id: str,
    service: AgentVerificationRequirementService = Depends(get_service),
):
    success = service.delete_requirement(requirement_id)
    if not success:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return {"message": "Requirement deleted successfully"}
