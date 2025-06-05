"""MCP Tools for user role management."""

from fastapi import HTTPException
from sqlalchemy.orm import Session
import logging

from backend.services.user_role_service import UserRoleService

logger = logging.getLogger(__name__)


async def assign_role_tool(
    user_id: str,
    role_name: str,
    db: Session,
) -> dict:
    """Assign a role to a user."""
    try:
        service = UserRoleService(db)
        role = service.assign_role_to_user(user_id, role_name)
        return {
            "success": True,
            "role": {
                "user_id": role.user_id,
                "role_name": role.role_name,
            },
        }
    except Exception as exc:
        logger.error(f"MCP assign role failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def list_roles_tool(
    user_id: str,
    db: Session,
) -> dict:
    """List roles assigned to a user."""
    try:
        service = UserRoleService(db)
        roles = service.get_user_roles(user_id)
        return {
            "success": True,
            "roles": [
                {"user_id": r.user_id, "role_name": r.role_name} for r in roles
            ],
        }
    except Exception as exc:
        logger.error(f"MCP list roles failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def remove_role_tool(
    user_id: str,
    role_name: str,
    db: Session,
) -> dict:
    """Remove a role from a user."""
    try:
        service = UserRoleService(db)
        success = service.remove_role_from_user(user_id, role_name)
        return {"success": success}
    except Exception as exc:
        logger.error(f"MCP remove role failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
