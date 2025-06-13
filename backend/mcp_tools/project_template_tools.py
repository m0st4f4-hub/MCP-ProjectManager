import json
import logging
from fastapi import HTTPException
from sqlalchemy.orm import Session

from services.project_template_service import ProjectTemplateService
from services.audit_log_service import AuditLogService
from schemas.project_template import ProjectTemplateCreate

logger = logging.getLogger(__name__)


def _get_service(db: Session) -> ProjectTemplateService:
    return ProjectTemplateService(db)


async def create_project_template_tool(
    template_data: ProjectTemplateCreate,
    db: Session,
) -> dict:
    """MCP Tool: Create a new project template."""
    try:
        service = _get_service(db)
        existing = service.get_template_by_name(template_data.name)
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Project template already exists",
            )
        template = service.create_template(template_data)
        AuditLogService(db).log_action(
            action="project_template_created",
            entity_type="project_template",
            entity_id=template.id,
            changes={"name": template.name, "description": template.description},
        )
        return {"success": True, "template_id": template.id}
    except HTTPException as e:
        logger.error(
            f"MCP create project template failed with HTTP exception: {e.detail}"
        )
        raise e
    except Exception as e:
        logger.error(f"MCP create project template failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def list_project_templates_tool(
    skip: int,
    limit: int,
    db: Session,
) -> dict:
    """MCP Tool: List project templates."""
    try:
        service = _get_service(db)
        templates = service.get_templates(skip=skip, limit=limit)
        return {
            "success": True,
            "templates": [
                {
                    "id": t.id,
                    "name": t.name,
                    "description": t.description,
                    "template_data": (
                        json.loads(t.template_data)
                        if isinstance(t.template_data, str)
                        else t.template_data
                    ),
                    "created_at": t.created_at.isoformat(),
                }
                for t in templates
            ],
        }
    except Exception as e:
        logger.error(f"MCP list project templates failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def delete_project_template_tool(
    template_id: str,
    db: Session,
) -> dict:
    """MCP Tool: Delete a project template."""
    try:
        service = _get_service(db)
        success = service.delete_template(template_id)
        if not success:
            raise HTTPException(status_code=404, detail="Project template not found")
        AuditLogService(db).log_action(
            action="project_template_deleted",
            entity_type="project_template",
            entity_id=template_id,
            changes={},
        )
        return {"success": True}
    except HTTPException as e:
        logger.error(
            f"MCP delete project template failed with HTTP exception: {e.detail}"
        )
        raise e
    except Exception as e:
        logger.error(f"MCP delete project template failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
