"""
Verification Requirement Service

This service provides verification requirement management functionality.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from ..models.agent_verification_requirement import AgentVerificationRequirement
from ..schemas.agent_verification_requirement import (
    AgentVerificationRequirementCreate,
    AgentVerificationRequirement as AgentVerificationRequirementSchema
)
from .agent_verification_service import AgentVerificationService


class VerificationRequirementService:
    """Service for managing verification requirements."""
    
    def __init__(self, db: Session):
        self.db = db
        self.agent_verification_service = AgentVerificationService(db)
    
    def create_verification_requirement(
        self, 
        requirement_in: AgentVerificationRequirementCreate
    ) -> AgentVerificationRequirement:
        """Create a new verification requirement."""
        return self.agent_verification_service.create_verification_requirement(requirement_in)
    
    def get_verification_requirements(
        self, 
        agent_role_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[AgentVerificationRequirement]:
        """Get verification requirements with optional filtering."""
        return self.agent_verification_service.get_verification_requirements(
            agent_role_id=agent_role_id,
            skip=skip,
            limit=limit
        )
    
    def get_verification_requirement(
        self, 
        requirement_id: str
    ) -> Optional[AgentVerificationRequirement]:
        """Get a specific verification requirement by ID."""
        return self.agent_verification_service.get_verification_requirement(requirement_id)
    
    def delete_verification_requirement(
        self, 
        requirement_id: str
    ) -> bool:
        """Delete a verification requirement."""
        return self.agent_verification_service.delete_verification_requirement(requirement_id) 