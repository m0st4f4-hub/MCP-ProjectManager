"""MCP tools for agent verification requirements."""

from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import logging

from backend.services.agent_verification_requirement_service import (
    AgentVerificationRequirementService,
)
from backend.schemas.agent_verification_requirement import (
    AgentVerificationRequirementCreate,
)

logger = logging.getLogger(__name__)


def _get_service(db: Session) -> AgentVerificationRequirementService:
    return AgentVerificationRequirementService(db)


async def create_verification_requirement_tool(
    requirement_data: AgentVerificationRequirementCreate,
    db: Session,
) -> dict:
    """Create a new verification requirement."""
    try:
        service = _get_service(db)
        req = service.create_requirement(requirement_data)
        return {
            "success": True,
            "requirement": {
                "id": req.id,
                "agent_role_id": req.agent_role_id,
                "requirement": req.requirement,
                "description": req.description,
                "is_mandatory": req.is_mandatory,
            },
        }
    except Exception as exc:
        logger.error(f"MCP create verification requirement failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def list_verification_requirements_tool(
    agent_role_id: Optional[str],
    db: Session,
) -> dict:
    """List verification requirements."""
    try:
        service = _get_service(db)
        items = service.list_requirements(agent_role_id)
        return {
            "success": True,
            "requirements": [
                {
                    "id": r.id,
                    "agent_role_id": r.agent_role_id,
                    "requirement": r.requirement,
                    "description": r.description,
                    "is_mandatory": r.is_mandatory,
                }
                for r in items
            ],
        }
    except Exception as exc:
        logger.error(f"MCP list verification requirements failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def delete_verification_requirement_tool(
    requirement_id: str,
    db: Session,
) -> dict:
    """Delete a verification requirement."""
    try:
        service = _get_service(db)
        success = service.delete_requirement(requirement_id)
        if not success:
            raise HTTPException(status_code=404, detail="Requirement not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"MCP delete verification requirement failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
