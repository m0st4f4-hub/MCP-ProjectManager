"""MCP Tools for managing forbidden actions for agent roles."""

from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import logging

from backend.models.agent_forbidden_action import AgentForbiddenAction
from backend.services.audit_log_service import AuditLogService

logger = logging.getLogger(__name__)


async def create_forbidden_action_tool(
    agent_role_id: str,
    action: str,
    reason: Optional[str],
    db: Session,
) -> dict:
    """MCP Tool: Create a forbidden action for an agent role."""
    try:
        forbidden = AgentForbiddenAction(
            agent_role_id=agent_role_id,
            action=action,
            reason=reason,
            is_active=True,
        )
        db.add(forbidden)
        db.commit()
        db.refresh(forbidden)
        AuditLogService(db).log_action(
            action="forbidden_action_created",
            entity_type="agent_forbidden_action",
            entity_id=forbidden.id,
            changes={"action": action, "reason": reason},
        )
        return {
            "success": True,
            "forbidden_action": {
                "id": forbidden.id,
                "agent_role_id": forbidden.agent_role_id,
                "action": forbidden.action,
                "reason": forbidden.reason,
                "is_active": forbidden.is_active,
            },
        }
    except Exception as exc:
        logger.error(f"MCP create forbidden action failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def list_forbidden_actions_tool(
    agent_role_id: Optional[str],
    db: Session,
) -> dict:
    """MCP Tool: List forbidden actions for agent roles."""
    try:
        query = db.query(AgentForbiddenAction)
        if agent_role_id:
            query = query.filter(AgentForbiddenAction.agent_role_id == agent_role_id)
        actions = query.all()
        return {
            "success": True,
            "forbidden_actions": [
                {
                    "id": fa.id,
                    "agent_role_id": fa.agent_role_id,
                    "action": fa.action,
                    "reason": fa.reason,
                    "is_active": fa.is_active,
                }
                for fa in actions
            ],
        }
    except Exception as exc:
        logger.error(f"MCP list forbidden actions failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
