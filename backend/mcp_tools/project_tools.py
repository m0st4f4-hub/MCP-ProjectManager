"""
MCP Tools for Project Management.
"""

from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
import logging

from backend.database import get_db
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
        project_service = ProjectService(db)  # Check if project exists
        existing = project_service.get_project_by_name(project_data.name)
        if existing:
            raise HTTPException(status_code=400, detail="Project already exists")

        project = project_service.create_project(project_data)  # Log to audit
        audit_service = AuditLogService(db)
        audit_service.log_action(
            action="project_created",
            entity_type="project",
            entity_id=project.id,
            changes={"name": project.name, "description": project.description}
        )

        return {
            "success": True,
            "project": {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "created_at": project.created_at.isoformat()
            }
        }
    except Exception as e:
        logger.error(f"MCP create project failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def list_projects_tool(
    skip: int = 0,
    limit: int = 100,
    is_archived: Optional[bool] = None,
    db: Session = None
) -> dict:
    """MCP Tool: List all projects."""
    try:
        project_service = ProjectService(db)
        projects = project_service.get_projects(
            skip=skip,
            limit=limit,
            is_archived=is_archived
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
                    "created_at": p.created_at.isoformat()
                }
                for p in projects
            ]
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
                "updated_at": project.updated_at.isoformat() if project.updated_at else None
            }
        }
    except Exception as e:
        logger.error(f"MCP get project failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
