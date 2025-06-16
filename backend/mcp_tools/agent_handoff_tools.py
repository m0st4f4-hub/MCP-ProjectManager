"""MCP Tools for managing agent handoff criteria."""

from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import logging

from backend.services.agent_handoff_service import AgentHandoffService
from backend.schemas.agent_handoff_criteria import AgentHandoffCriteriaCreate

logger = logging.getLogger(__name__)


def _get_service(db: Session) -> AgentHandoffService:
    return AgentHandoffService(db)


async def create_handoff_criteria_tool(
    criteria_data: AgentHandoffCriteriaCreate,
    db: Session,
) -> dict:
    """MCP Tool: Create agent handoff criteria."""
    try:
        service = _get_service(db)
        criteria = service.create_criteria(criteria_data)
        return {
            "success": True,
            "criteria": {
                "id": criteria.id,
                "agent_role_id": criteria.agent_role_id,
                "criteria": criteria.criteria,
                "description": criteria.description,
                "target_agent_role": criteria.target_agent_role,
                "is_active": criteria.is_active,
            },
        }
    except Exception as exc:
        logger.error(f"MCP create handoff criteria failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def list_handoff_criteria_tool(
    agent_role_id: Optional[str],
    db: Session,
) -> dict:
    """MCP Tool: List agent handoff criteria."""
    try:
        service = _get_service(db)
        items = service.list_criteria(agent_role_id)
        return {
            "success": True,
            "criteria": [
                {
                    "id": c.id,
                    "agent_role_id": c.agent_role_id,
                    "criteria": c.criteria,
                    "description": c.description,
                    "target_agent_role": c.target_agent_role,
                    "is_active": c.is_active,
                }
                for c in items
            ],
        }
    except Exception as exc:
        logger.error(f"MCP list handoff criteria failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def delete_handoff_criteria_tool(criteria_id: str, db: Session) -> dict:
    """MCP Tool: Delete agent handoff criteria."""
    try:
        service = _get_service(db)
        success = service.delete_criteria(criteria_id)
        if not success:
            raise HTTPException(status_code=404, detail="Criteria not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"MCP delete handoff criteria failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
