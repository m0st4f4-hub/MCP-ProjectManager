# Task ID: <taskId>  # Agent Role: ImplementationSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

"""
MCP Core Tools Router - Functionality for Project and Task MCP integration.
Provides MCP tool definitions.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import logging
import json

from ....database import get_sync_db as get_db
from ....services.project_service import ProjectService
from ....services.task_service import TaskService
from ....services.audit_log_service import AuditLogService
from ....services.memory_service import MemoryService
from ....schemas.project import ProjectCreate
from ....schemas.task import TaskCreate
from ....schemas.memory import (
    MemoryEntityCreate,
    MemoryEntityUpdate,
    MemoryObservationCreate,
    MemoryRelationCreate
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["mcp-tools"])


def get_db_session():
    """Database session dependency."""
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()


def get_memory_service(db: Session = Depends(get_db_session)) -> MemoryService:
    return MemoryService(db)


@router.post(
    "/mcp-tools/project/create",
    tags=["mcp-tools"],
    operation_id="create_project_tool",
)
async def mcp_create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db_session)
):
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


@router.post(
    "/mcp-tools/task/create",
    tags=["mcp-tools"],
    operation_id="create_task_tool",
)
async def mcp_create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db_session)
):
    """MCP Tool: Create a new task."""
    try:
        task_service = TaskService(db)
        project_service = ProjectService(db)
        project = project_service.get_project(task_data.project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        task = task_service.create_task(task_data)
        audit_service = AuditLogService(db)
        audit_service.log_action(
            action="task_created",
            entity_type="task",
            entity_id=f"{task.project_id}-{task.task_number}",
            changes={
                "title": task.title,
                "project_id": task.project_id
            }
        )

        return {
            "success": True,
            "task": {
                "project_id": task.project_id,
                "task_number": task.task_number,
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "created_at": task.created_at.isoformat()
            }
        }
    except Exception as e:
        logger.error(f"MCP create task failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/mcp-tools/projects/list",
    tags=["mcp-tools"],
    operation_id="list_projects_tool",
)
async def mcp_list_projects(
    skip: int = 0,
    limit: int = 100,
    is_archived: Optional[bool] = None,
    db: Session = Depends(get_db_session)
):
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


@router.get(
    "/mcp-tools/tasks/list",
    tags=["mcp-tools"],
    operation_id="list_tasks_tool",
)
async def mcp_list_tasks(
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    agent_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db_session)
):
    """MCP Tool: List tasks with filtering."""
    try:
        task_service = TaskService(db)
        tasks = task_service.get_tasks(
            project_id=project_id,
            status=status,
            agent_id=agent_id,
            skip=skip,
            limit=limit
        )
        return {
            "success": True,
            "tasks": [
                {
                    "project_id": t.project_id,
                    "task_number": t.task_number,
                    "title": t.title,
                    "description": t.description,
                    "status": t.status,
                    "agent_id": t.agent_id,
                    "created_at": t.created_at.isoformat()
                }
                for t in tasks
            ]
        }
    except Exception as e:
        logger.error(f"MCP list tasks failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/memory/add-entity",
    tags=["mcp-tools"],
    operation_id="add_memory_entity_tool",
)
async def mcp_add_memory_entity(
    entity_data: MemoryEntityCreate,
    memory_service: MemoryService = Depends(get_memory_service)
):
    """MCP Tool: Add entity to knowledge graph."""
    try:
        entity = memory_service.create_memory_entity(entity=entity_data)
        
        if hasattr(entity_data, 'observations') and entity_data.observations:
            for obs_content in entity_data.observations:
                memory_service.add_observation_to_entity(
                    entity_id=entity.id,
                    observation=MemoryObservationCreate(content=obs_content, source="mcp_tool")
                )

        return {
            "success": True,
            "entity": {
                "id": entity.id,
                "name": entity.name,
                "type": entity.type,
                "description": entity.description
            }
        }
    except HTTPException as e:
        logger.error(f"MCP add memory entity failed with HTTP exception: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"MCP add memory entity failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/memory/update-entity",
    tags=["mcp-tools"],
    operation_id="update_memory_entity_tool",
)
async def mcp_update_memory_entity(
    entity_id: int,
    entity_update: MemoryEntityUpdate,
    memory_service: MemoryService = Depends(get_memory_service)
):
    """MCP Tool: Update an existing memory entity."""
    try:
        entity = memory_service.get_memory_entity_by_id(entity_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Entity not found")

        updated_entity = memory_service.update_memory_entity(
            entity_id=entity_id,
            update=entity_update
        )

        return {
            "success": True,
            "entity": {
                "id": updated_entity.id,
                "name": updated_entity.name,
                "type": updated_entity.type,
                "description": updated_entity.description
            }
        }
    except Exception as e:
        logger.error(f"MCP update memory entity failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/memory/add-observation",
    tags=["mcp-tools"],
    operation_id="add_memory_observation_tool",
)
async def mcp_add_memory_observation(
    entity_id: int,
    observation_data: MemoryObservationCreate,
    memory_service: MemoryService = Depends(get_memory_service)
):
    """MCP Tool: Add observation to entity."""
    try:
        entity = memory_service.get_memory_entity_by_id(entity_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Entity not found")

        observation = memory_service.add_observation_to_entity(
            entity_id=entity_id,
            observation=observation_data
        )

        return {
            "success": True,
            "observation": {
                "id": observation.id,
                "content": observation.content,
                "source": observation.source
            }
        }
    except Exception as e:
        logger.error(f"MCP add memory observation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/memory/add-relation",
    tags=["mcp-tools"],
    operation_id="add_memory_relation_tool",
)
async def mcp_add_memory_relation(
    relation_data: MemoryRelationCreate,
    memory_service: MemoryService = Depends(get_memory_service)
):
    """MCP Tool: Add relation to knowledge graph."""
    try:
        from_entity = memory_service.get_memory_entity_by_id(relation_data.from_entity_id)
        to_entity = memory_service.get_memory_entity_by_id(relation_data.to_entity_id)

        if not from_entity or not to_entity:
            raise HTTPException(status_code=404, detail="One or both entities not found")

        relation = memory_service.create_memory_relation(relation=relation_data)

        return {
            "success": True,
            "relation": {
                "id": relation.id,
                "from_entity_id": relation.from_entity_id,
                "to_entity_id": relation.to_entity_id,
                "relation_type": relation.relation_type
            }
        }
    except HTTPException as e:
        logger.error(f"MCP add memory relation failed with HTTP exception: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"MCP add memory relation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/mcp-tools/memory/search",
    tags=["mcp-tools"],
    operation_id="search_memory_tool",
)
async def mcp_search_memory(
    query: str,
    limit: int = 10,
    memory_service: MemoryService = Depends(get_memory_service)
):
    """MCP Tool: Search memory entities."""
    try:
        results = memory_service.search_memory_entities(query, limit=limit)

        return {
            "success": True,
            "results": [
                {
                    "id": r.id,
                    "type": r.type,
                    "name": r.name,
                    "description": r.description
                } for r in results
            ]
        }
    except Exception as e:
        logger.error(f"MCP search memory failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
