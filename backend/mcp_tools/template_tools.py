"""MCP Tools for managing project templates."""

from fastapi import HTTPException
from sqlalchemy.orm import Session
import logging

from services.project_template_service import ProjectTemplateService
from schemas.project_template import ProjectTemplateCreate

logger = logging.getLogger(__name__)


async def create_template_tool(
    template_data: ProjectTemplateCreate,
    db: Session,
) -> dict:
    """MCP Tool: Create a new project template."""
    try:
        service = ProjectTemplateService(db)
        existing = service.get_template_by_name(template_data.name)
        if existing:
            raise HTTPException(status_code=400, detail="Template already exists")

        template = service.create_template(template_data)
        return {
            "success": True,
            "template": {
                "id": template.id,
                "name": template.name,
                "description": template.description,
                "created_at": template.created_at.isoformat(),
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"MCP create template failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def list_templates_tool(
    skip: int = 0,
    limit: int = 100,
    db: Session = None,
) -> dict:
    """MCP Tool: List project templates."""
    try:
        service = ProjectTemplateService(db)
        templates = service.get_templates(skip=skip, limit=limit)
        return {
            "success": True,
            "templates": [
                {
                    "id": t.id,
                    "name": t.name,
                    "description": t.description,
                    "created_at": t.created_at.isoformat(),
                }
                for t in templates
            ],
        }
    except Exception as e:
        logger.error(f"MCP list templates failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def delete_template_tool(
    template_id: str,
    db: Session,
) -> dict:
    """MCP Tool: Delete a project template."""
    try:
        service = ProjectTemplateService(db)
        success = service.delete_template(template_id)
        if not success:
            raise HTTPException(status_code=404, detail="Template not found")
        return {"success": True, "template_id": template_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"MCP delete template failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
