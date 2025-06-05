"""MCP Tools for Project Management."""

from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import logging

from backend.services.project_service import ProjectService
from backend.services.audit_log_service import AuditLogService
from backend import schemas

logger = logging.getLogger(__name__)


async def create_project_tool(
    project_data: schemas.ProjectCreate,
    db: Session
) -> dict:
    """MCP Tool: Create a new project."""
    try:
        project_service = ProjectService(db)
        existing = project_service.get_project_by_name(project_data.name)
        if existing:
            raise HTTPException(status_code=400, detail="Project already exists")

        project = project_service.create_project(project_data)
        audit_service = AuditLogService(db)
        audit_service.log_action(
            action="project_created",
            entity_type="project",
            entity_id=project.id,
            changes={
                "name": project.name,
                "description": project.description,
            },
        )

        return {
            "success": True,
            "project": {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "created_at": project.created_at.isoformat(),
            },
        }
    except Exception as e:
        logger.error(f"MCP create project failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def list_projects_tool(
    skip: int = 0,
    limit: int = 100,
    is_archived: Optional[bool] = None,
    db: Session = None,
) -> dict:
    """MCP Tool: List all projects."""
    try:
        project_service = ProjectService(db)
        projects = project_service.get_projects(
            skip=skip,
            limit=limit,
            is_archived=is_archived,
        )

        return {
            "success": True,
            "projects": [
                {
                    "id": p.id,
                    "name": p.name,
                    "description": p.description,
                    "task_count": p.task_count,
                    "is_archived": p.is_archived,
                    "created_at": p.created_at.isoformat(),
                }
                for p in projects
            ],
        }
    except Exception as e:
        logger.error(f"MCP list projects failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def get_project_tool(
    project_id: str,
    db: Session
) -> dict:
    """MCP Tool: Get specific project details."""
    try:
        project_service = ProjectService(db)
        project = project_service.get_project(project_id)

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        return {
            "success": True,
            "project": {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "task_count": project.task_count,
                "is_archived": project.is_archived,
                "created_at": project.created_at.isoformat(),
                "updated_at": (
                    project.updated_at.isoformat() if project.updated_at else None
                ),
            },
        }
    except Exception as e:
        logger.error(f"MCP get project failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def update_project_tool(
    project_id: str,
    project_update: schemas.ProjectUpdate,
    db: Session
) -> dict:
    """MCP Tool: Update an existing project."""
    try:
        project_service = ProjectService(db)
        project = project_service.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        updated = project_service.update_project(project_id, project_update)
        audit_service = AuditLogService(db)
        audit_service.log_action(
            action="project_updated",
            entity_type="project",
            entity_id=updated.id,
            changes=project_update.model_dump(exclude_unset=True),
        )

        return {
            "success": True,
            "project": {
                "id": updated.id,
                "name": updated.name,
                "description": updated.description,
                "task_count": updated.task_count,
                "is_archived": updated.is_archived,
                "created_at": updated.created_at.isoformat(),
                "updated_at": (
                    updated.updated_at.isoformat() if updated.updated_at else None
                ),
            },
        }
    except Exception as e:
        logger.error(f"MCP update project failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def delete_project_tool(
    project_id: str,
    db: Session
) -> dict:
    """MCP Tool: Delete a project."""
    try:
        project_service = ProjectService(db)
        project = project_service.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        deleted = project_service.delete_project(project_id)
        audit_service = AuditLogService(db)
        audit_service.log_action(
            action="project_deleted",
            entity_type="project",
            entity_id=project_id,
            changes={},
        )

        return {
            "success": True,
            "project": {
                "id": deleted.id,
                "name": deleted.name,
                "description": deleted.description,
                "task_count": deleted.task_count,
                "is_archived": deleted.is_archived,
                "created_at": deleted.created_at.isoformat(),
                "updated_at": (
                    deleted.updated_at.isoformat() if deleted.updated_at else None
                ),
            },
        }
    except Exception as e:
        logger.error(f"MCP delete project failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
