import logging
from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.services.rules_service import RulesService
from backend.schemas import AgentRuleCreate
from backend.schemas.universal_mandate import UniversalMandateCreate

logger = logging.getLogger(__name__)


def create_universal_mandate_tool(
    mandate_data: UniversalMandateCreate,
    db: Session,
) -> dict:
    """Create a universal mandate via MCP."""
    try:
        service = RulesService(db)
        mandate = service.create_universal_mandate(mandate_data)
        return {
            "success": True,
            "mandate": {
                "id": mandate.id,
                "title": mandate.title,
                "description": mandate.description,
                "priority": mandate.priority,
                "is_active": mandate.is_active,
            },
        }
    except Exception as exc:
        logger.error(f"MCP create mandate failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


def create_agent_rule_tool(
    rule_data: AgentRuleCreate,
    db: Session,
) -> dict:
    """Create an agent rule via MCP."""
    try:
        service = RulesService(db)
        rule = service.create_agent_rule(rule_data)
        return {
            "success": True,
            "agent_rule": {
                "id": rule.id,
                "agent_id": rule.agent_id,
                "rule_type": rule.rule_type,
                "rule_content": rule.rule_content,
                "is_active": rule.is_active,
            },
        }
    except Exception as exc:
        logger.error(f"MCP create agent rule failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
