"""MCP Tools for managing forbidden actions."""

import logging
from typing import Optional, List

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.models.agent_forbidden_action import AgentForbiddenAction

logger = logging.getLogger(__name__)


async def add_forbidden_action_tool(
    agent_role_id: str,
    action: str,
    reason: Optional[str],
    db: Session,
) -> dict:
    """Add a forbidden action to an agent role."""
    try:
        forbidden_action = AgentForbiddenAction(
            agent_role_id=agent_role_id,
            action=action,
            reason=reason,
        )
        db.add(forbidden_action)
        db.commit()
        db.refresh(forbidden_action)
        return {
            "success": True,
            "forbidden_action": {
                "id": forbidden_action.id,
                "agent_role_id": forbidden_action.agent_role_id,
                "action": forbidden_action.action,
                "reason": forbidden_action.reason,
                "is_active": forbidden_action.is_active,
            },
        }
    except Exception as exc:  # pragma: no cover - unexpected DB failure
        logger.error(f"MCP add forbidden action failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def list_forbidden_actions_tool(
    agent_role_id: Optional[str],
    skip: int,
    limit: int,
    db: Session,
) -> dict:
    """List forbidden actions for an agent role."""
    try:
        query = db.query(AgentForbiddenAction)
        if agent_role_id:
            query = query.filter(AgentForbiddenAction.agent_role_id == agent_role_id)
        actions: List[AgentForbiddenAction] = query.offset(skip).limit(limit).all()
        return {
            "success": True,
            "forbidden_actions": [
                {
                    "id": a.id,
                    "agent_role_id": a.agent_role_id,
                    "action": a.action,
                    "reason": a.reason,
                    "is_active": a.is_active,
                }
                for a in actions
            ],
        }
    except Exception as exc:  # pragma: no cover - unexpected DB failure
        logger.error(f"MCP list forbidden actions failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
