"""MCP tools for agent verification requirements."""

import logging
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.agent_verification_requirement import AgentVerificationRequirement
from services.audit_log_service import AuditLogService

logger = logging.getLogger(__name__)


async def create_verification_requirement_tool(
    agent_role_id: str,
    requirement: str,
    description: Optional[str],
    is_mandatory: bool,
    db: Session,
) -> dict:
    """MCP Tool: Create a verification requirement for an agent role."""
    try:
        req = AgentVerificationRequirement(
            agent_role_id=agent_role_id,
            requirement=requirement,
            description=description,
            is_mandatory=is_mandatory,
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        AuditLogService(db).log_action(
            action="verification_requirement_created",
            entity_type="agent_verification_requirement",
            entity_id=req.id,
            changes={
                "requirement": requirement,
                "description": description,
                "is_mandatory": is_mandatory,
            },
        )
        return {
            "success": True,
            "verification_requirement": {
                "id": req.id,
                "agent_role_id": req.agent_role_id,
                "requirement": req.requirement,
                "description": req.description,
                "is_mandatory": req.is_mandatory,
                "created_at": req.created_at.isoformat(),
            },
        }
    except Exception as exc:
        logger.error(f"MCP create verification requirement failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def list_verification_requirements_tool(
    agent_role_id: Optional[str],
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> dict:
    """MCP Tool: List verification requirements for agent roles."""
    try:
        query = db.query(AgentVerificationRequirement)
        if agent_role_id:
            query = query.filter(
                AgentVerificationRequirement.agent_role_id == agent_role_id
            )
        items = query.offset(skip).limit(limit).all()
        return {
            "success": True,
            "verification_requirements": [
                {
                    "id": r.id,
                    "agent_role_id": r.agent_role_id,
                    "requirement": r.requirement,
                    "description": r.description,
                    "is_mandatory": r.is_mandatory,
                    "created_at": r.created_at.isoformat(),
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
    """MCP Tool: Delete a verification requirement."""
    try:
        obj = (
            db.query(AgentVerificationRequirement)
            .filter(AgentVerificationRequirement.id == requirement_id)
            .first()
        )
        if not obj:
            raise HTTPException(status_code=404, detail="Requirement not found")
        db.delete(obj)
        db.commit()
        AuditLogService(db).log_action(
            action="verification_requirement_deleted",
            entity_type="agent_verification_requirement",
            entity_id=requirement_id,
            changes={},
        )
        return {"success": True}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"MCP delete verification requirement failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
