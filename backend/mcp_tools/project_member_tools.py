"""Utility functions for MCP project member operations."""

from fastapi import HTTPException
from sqlalchemy.orm import Session
import logging

from backend.services.project_member_service import ProjectMemberService
from backend.schemas.project import ProjectMemberCreate

logger = logging.getLogger(__name__)


async def add_project_member_tool(
    member_data: ProjectMemberCreate,
    db: Session,
) -> dict:
    """Add a member to a project."""
    try:
        service = ProjectMemberService(db)
        member = await service.add_member_to_project(
            project_id=member_data.project_id,
            user_id=member_data.user_id,
            role=member_data.role,
        )
        return {
            "success": True,
            "member": {
                "project_id": member.project_id,
                "user_id": member.user_id,
                "role": member.role,
                "created_at": member.created_at.isoformat(),
            },
        }
    except HTTPException as exc:
        logger.error(f"MCP add project member failed with HTTP exception: {exc.detail}")
        raise exc
    except Exception as exc:
        logger.error(f"MCP add project member failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def list_project_members_tool(
    project_id: str,
    skip: int,
    limit: int,
    db: Session,
) -> dict:
    """List members for a project."""
    try:
        service = ProjectMemberService(db)
        members = await service.get_members_by_project(
            project_id,
            skip=skip,
            limit=limit,
        )
        return {
            "success": True,
            "members": [
                {
                    "project_id": m.project_id,
                    "user_id": m.user_id,
                    "role": m.role,
                    "created_at": m.created_at.isoformat(),
                }
                for m in members
            ],
        }
    except Exception as exc:
        logger.error(f"MCP list project members failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


async def remove_project_member_tool(
    project_id: str,
    user_id: str,
    db: Session,
) -> dict:
    """Remove a member from a project."""
    try:
        service = ProjectMemberService(db)
        success = await service.remove_member_from_project(project_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Project member not found")
        return {"success": True}
    except HTTPException as exc:
        logger.error(
            f"MCP remove project member failed with HTTP exception: {exc.detail}"
        )
        raise exc
    except Exception as exc:
        logger.error(f"MCP remove project member failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
