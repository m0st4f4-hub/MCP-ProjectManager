"""MCP Tools for managing project file associations."""

from fastapi import HTTPException
from sqlalchemy.orm import Session
import logging

from backend.services.project_file_association_service import ProjectFileAssociationService

logger = logging.getLogger(__name__)


def _get_service(db: Session) -> ProjectFileAssociationService:
    return ProjectFileAssociationService(db)


async def add_project_file_tool(
    project_id: str,
    file_memory_entity_id: int,
    db: Session,
) -> dict:
    """Associate a memory file entity with a project."""
    try:
        service = _get_service(db)
        association = service.associate_file_with_project(project_id, file_memory_entity_id)
        return {
            "success": True,
            "association": {
                "project_id": association.project_id,
                "file_memory_entity_id": association.file_memory_entity_id,
            },
        }
    except Exception as e:
        logger.error(f"MCP add project file failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def list_project_files_tool(
    project_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session,
) -> dict:
    """List files associated with a project."""
    try:
        service = _get_service(db)
        files = service.get_files_for_project(project_id, skip=skip, limit=limit)
        return {
            "success": True,
            "files": [
                {
                    "project_id": f.project_id,
                    "file_memory_entity_id": f.file_memory_entity_id,
                }
                for f in files
            ],
        }
    except Exception as e:
        logger.error(f"MCP list project files failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def remove_project_file_tool(
    project_id: str,
    file_memory_entity_id: int,
    db: Session,
) -> dict:
    """Remove association between project and file."""
    try:
        service = _get_service(db)
        result = service.disassociate_file_from_project(project_id, file_memory_entity_id)
        success = bool(result)
        return {
            "success": success,
        }
    except Exception as e:
        logger.error(f"MCP remove project file failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
