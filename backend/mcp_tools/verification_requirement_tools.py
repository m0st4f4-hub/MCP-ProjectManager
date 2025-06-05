"""MCP tools for managing agent verification requirements."""

import logging
from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.models import AgentVerificationRequirement
from backend.schemas.verification_requirement import VerificationRequirementCreate

logger = logging.getLogger(__name__)


async def create_verification_requirement_tool(
    agent_role_id: str,
    requirement: VerificationRequirementCreate,
    db: Session,
) -> dict:
    """Create a verification requirement for an agent role."""
    try:
        db_req = AgentVerificationRequirement(
            agent_role_id=agent_role_id,
            requirement=requirement.requirement,
            description=requirement.description,
            is_mandatory=requirement.is_mandatory,
        )
        db.add(db_req)
        db.commit()
        db.refresh(db_req)
        return {
            "success": True,
            "requirement": {
                "id": db_req.id,
                "agent_role_id": db_req.agent_role_id,
                "requirement": db_req.requirement,
                "description": db_req.description,
                "is_mandatory": db_req.is_mandatory,
            },
        }
    except Exception as exc:
        logger.error(f"MCP create verification requirement failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def list_verification_requirements_tool(
    agent_role_id: str,
    db: Session,
) -> dict:
    """List verification requirements for an agent role."""
    try:
        reqs = (
            db.query(AgentVerificationRequirement)
            .filter(AgentVerificationRequirement.agent_role_id == agent_role_id)
            .all()
        )
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
                for r in reqs
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
        req = (
            db.query(AgentVerificationRequirement)
            .filter(AgentVerificationRequirement.id == requirement_id)
            .first()
        )
        if not req:
            raise HTTPException(status_code=404, detail="Requirement not found")
        db.delete(req)
        db.commit()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"MCP delete verification requirement failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))

