"""MCP Tools for managing user roles."""

import logging
from fastapi import HTTPException
from sqlalchemy.orm import Session
from backend.services.user_role_service import UserRoleService

logger = logging.getLogger(__name__)


def _get_service(db: Session) -> UserRoleService:
    return UserRoleService(db)


async def assign_role_tool(user_id: str, role_name: str, db: Session) -> dict:
    """Assign a role to a user."""
    try:
        service = _get_service(db)
        role = service.assign_role_to_user(user_id, role_name)
        return {
            "success": True,
            "role": {"user_id": role.user_id, "role_name": role.role_name},
        }
    except Exception as exc:
        logger.error(f"MCP assign role failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def list_roles_tool(user_id: str, db: Session) -> dict:
    """List roles assigned to a user."""
    try:
        service = _get_service(db)
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


async def remove_role_tool(user_id: str, role_name: str, db: Session) -> dict:
    """Remove a role from a user."""
    try:
        service = _get_service(db)
        success = service.remove_role_from_user(user_id, role_name)
        if not success:
            raise HTTPException(status_code=404, detail="Role not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"MCP remove role failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
