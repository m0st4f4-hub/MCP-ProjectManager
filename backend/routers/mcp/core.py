"""
MCP Core Tools Router - Functionality for Project and Task MCP integration.
Provides MCP tool definitions.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
import json
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List, Dict, Any
import uuid
import logging
from functools import wraps
from collections import defaultdict
import asyncio

from ...database import get_db
from ...services.project_service import ProjectService
from ...services.task_service import TaskService
from ...services.audit_log_service import AuditLogService
from ...services.memory_service import MemoryService
from ...services.project_file_association_service import ProjectFileAssociationService
from ...services.project_template_service import ProjectTemplateService
from ...services.rules_service import RulesService
from ...services.agent_handoff_service import AgentHandoffService
from ...services.error_protocol_service import ErrorProtocolService
from ...services.verification_requirement_service import VerificationRequirementService
from ...services.exceptions import EntityNotFoundError
from ...schemas.project import ProjectCreate
from ...schemas.task import TaskCreate, TaskUpdate
from ...schemas.project_template import ProjectTemplateCreate
from ...schemas import AgentRuleCreate
from ...schemas.universal_mandate import UniversalMandateCreate
from ...schemas.memory import (
    MemoryEntityCreate,
    MemoryEntityUpdate,
    MemoryObservationCreate,
    MemoryRelationCreate
)
from ...schemas.workflow import WorkflowCreate
from ...schemas.api_responses import MetricsResponse, DataResponse
from ...schemas.agent_handoff_criteria import AgentHandoffCriteriaCreate
from ...schemas.error_protocol import ErrorProtocolCreate
from ...schemas.agent_verification_requirement import AgentVerificationRequirementCreate

from ...mcp_tools.forbidden_action_tools import (
    add_forbidden_action_tool,
    list_forbidden_actions_tool,
)
from ...mcp_tools.capability_tools import (
    create_capability_tool,
    list_capabilities_tool,
    delete_capability_tool,
)
from ...mcp_tools.verification_requirement_tools import (
    create_verification_requirement_tool,
    list_verification_requirements_tool,
    delete_verification_requirement_tool,
)
from ... import models

logger = logging.getLogger(__name__)
router = APIRouter(tags=["mcp-tools"])

# In-memory counters for tool usage
tool_counters: Dict[str, int] = defaultdict(int)


def track_tool_usage(name: str):
    """Decorator to increment tool usage counters."""

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            tool_counters[name] += 1
            result = await func(*args, **kwargs)
            # TODO: Re-enable event publishing when publisher service is available
            logger.debug(f"Tool usage tracked: {name}")
            return result

        return wrapper

    return decorator


@router.get("/mcp-tools/stream", tags=["mcp-tools"], include_in_schema=False)
async def mcp_tools_stream(request: Request):
    """Stream server events via Server-Sent Events."""
    # Event streaming temporarily disabled - publisher service not available
    # TODO: Re-enable when event publisher service is implemented
    
    async def event_generator():
        try:
            yield f"data: {json.dumps({'type': 'test', 'message': 'MCP tools working'})}\n\n"
            # TODO: Implement proper event streaming when publisher service is available
        except asyncio.CancelledError:
            pass

    return StreamingResponse(event_generator(), media_type="text/event-stream")


async def get_db_session():
    """Database session dependency."""
    async for db in get_db():
        yield db


def get_memory_service(db: AsyncSession = Depends(get_db_session)) -> MemoryService:
    return MemoryService(db)


def get_project_file_service(
    db: AsyncSession = Depends(get_db_session),
) -> ProjectFileAssociationService:
    return ProjectFileAssociationService(db)


def get_agent_handoff_service(
    db: AsyncSession = Depends(get_db_session),
) -> AgentHandoffService:
    return AgentHandoffService(db)


def get_error_protocol_service(
    db: AsyncSession = Depends(get_db_session),
) -> ErrorProtocolService:
    return ErrorProtocolService(db)


def get_verification_requirement_service(
    db: AsyncSession = Depends(get_db_session),
) -> VerificationRequirementService:
    return VerificationRequirementService(db)


@router.post(
    "/mcp-tools/project/create",
    tags=["mcp-tools"],
    operation_id="create_project_tool",
)
@track_tool_usage("create_project_tool")
async def mcp_create_project(
    project_data: ProjectCreate,
    db: AsyncSession = Depends(get_db_session)
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
@track_tool_usage("create_task_tool")
async def mcp_create_task(
    task_data: TaskCreate,
    db: AsyncSession = Depends(get_db_session)
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
@track_tool_usage("list_projects_tool")
async def mcp_list_projects(
    skip: int = Query(0, ge=0, description="Number of records to skip."),
    limit: int = Query(100, gt=0, description="Maximum records to return."),
    is_archived: Optional[bool] = None,
    db: AsyncSession = Depends(get_db_session)
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
@track_tool_usage("list_tasks_tool")
async def mcp_list_tasks(
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    agent_id: Optional[str] = None,
    skip: int = Query(0, ge=0, description="Number of records to skip."),
    limit: int = Query(100, gt=0, description="Maximum records to return."),
    db: AsyncSession = Depends(get_db_session)
):
    """MCP Tool: List tasks with filtering."""
    try:
        task_service = TaskService(db)
        tasks, _ = await task_service.get_tasks(
            project_id=uuid.UUID(project_id) if project_id else None,
            status=status,
            agent_id=agent_id,
            skip=skip,
            limit=limit,
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
    "/mcp-tools/task/update",
    tags=["mcp-tools"],
    operation_id="update_task_tool",
)
@track_tool_usage("update_task_tool")
async def mcp_update_task(
    project_id: str,
    task_number: int,
    task_update: TaskUpdate,
    db: AsyncSession = Depends(get_db_session)
):
    """MCP Tool: Update an existing task."""
    try:
        task_service = TaskService(db)
        task = task_service.update_task(
            project_id=project_id,
            task_number=task_number,
            task_update=task_update
        )
        audit_service = AuditLogService(db)
        audit_service.log_action(
            action="task_updated",
            entity_type="task",
            entity_id=f"{project_id}-{task_number}",
            changes=task_update.model_dump(exclude_unset=True)
        )

        return {
            "success": True,
            "task": {
                "project_id": task.project_id,
                "task_number": task.task_number,
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "agent_id": task.agent_id,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat() if task.updated_at else None
            }
        }
    except Exception as e:
        logger.error(f"MCP update task failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete(
    "/mcp-tools/task/delete",
    tags=["mcp-tools"],
    operation_id="delete_task_tool",
    response_model=DataResponse[bool],
)
@track_tool_usage("delete_task_tool")
async def mcp_delete_task(
    project_id: str,
    task_number: int,
    db: AsyncSession = Depends(get_db_session)
):
    """MCP Tool: Delete a task."""
    try:
        task_service = TaskService(db)
        success = task_service.delete_task(project_id, task_number)
        if not success:
            raise HTTPException(status_code=404, detail="Task not found")

        audit_service = AuditLogService(db)
        audit_service.log_action(
            action="task_deleted",
            entity_type="task",
            entity_id=f"{project_id}-{task_number}"
        )

        return DataResponse[bool](data=True, message="Task deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"MCP delete task failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/project/add-file",
    tags=["mcp-tools"],
    operation_id="add_project_file_tool",
)
@track_tool_usage("add_project_file_tool")
async def mcp_add_project_file(
    project_id: str,
    file_memory_entity_id: int,
    service: ProjectFileAssociationService = Depends(get_project_file_service),
):
    """MCP Tool: Associate a file (from memory) with a project."""
    try:
        association = service.add_file_to_project(project_id, file_memory_entity_id)
        return {
            "success": True,
            "association": {
                "project_id": association.project_id,
                "memory_entity_id": association.memory_entity_id,
                "associated_at": association.associated_at.isoformat(),
            },
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"MCP add project file failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/mcp-tools/project/file/list",
    tags=["mcp-tools"],
    operation_id="list_project_files_tool",
)
@track_tool_usage("list_project_files_tool")
async def mcp_list_project_files(
    project_id: str,
    skip: int = 0,
    limit: int = 100,
    service: ProjectFileAssociationService = Depends(get_project_file_service),
):
    """MCP Tool: List files associated with a project."""
    try:
        associations = await service.get_project_files(project_id, skip, limit)
        return {
            "success": True,
            "files": [
                {
                    "project_id": assoc.project_id,
                    "memory_entity_id": assoc.memory_entity_id,
                    "associated_at": assoc.associated_at.isoformat(),
                }
                for assoc in associations
            ],
        }
    except Exception as e:
        logger.error(f"MCP list project files failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete(
    "/mcp-tools/project/remove-file",
    tags=["mcp-tools"],
    operation_id="remove_project_file_tool",
    response_model=DataResponse[bool],
)
@track_tool_usage("remove_project_file_tool")
async def mcp_remove_project_file(
    project_id: str,
    file_memory_entity_id: int,
    service: ProjectFileAssociationService = Depends(get_project_file_service),
):
    """MCP Tool: Disassociate a file from a project."""
    try:
        service.remove_project_file_association(
            project_id=project_id,
            file_memory_entity_id=file_memory_entity_id
        )
        audit_service = AuditLogService(service.db)
        audit_service.log_action(
            action="project_file_removed",
            entity_type="project_file",
            entity_id=f"{project_id}-{file_memory_entity_id}",
            changes={
                "project_id": project_id,
                "file_memory_entity_id": file_memory_entity_id
            }
        )
        return {
            "success": True,
            "message": "Project file association removed successfully",
        }
    except Exception as e:
        logger.error(f"MCP remove project file failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/template/create",
    tags=["mcp-tools"],
    operation_id="create_template_tool",
)
async def mcp_create_template(
    template_data: ProjectTemplateCreate,
    db: AsyncSession = Depends(get_db_session),
):
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
    except Exception as e:
        logger.error(f"MCP create template failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/mcp-tools/templates/list",
    tags=["mcp-tools"],
    operation_id="list_templates_tool",
)
async def mcp_list_templates(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db_session),
):
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


@router.post(
    "/mcp-tools/template/delete",
    tags=["mcp-tools"],
    operation_id="delete_template_tool",
)
async def mcp_delete_template(
    template_id: str,
    db: AsyncSession = Depends(get_db_session),
):
    """MCP Tool: Delete a project template."""
    try:
        service = ProjectTemplateService(db)
        success = service.delete_template(template_id)
        if not success:
            raise HTTPException(status_code=404, detail="Template not found")
        return {"success": True, "template_id": template_id}
    except Exception as e:
        logger.error(f"MCP delete template failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/memory/add-entity",
    tags=["mcp-tools"],
    operation_id="add_memory_entity_tool",
)
@track_tool_usage("add_memory_entity_tool")
async def mcp_add_memory_entity(
    entity_data: MemoryEntityCreate,
    memory_service: MemoryService = Depends(get_memory_service)
):
    """MCP Tool: Add a new entity to memory."""
    try:
        entity = memory_service.create_entity(entity_data)
        return {
            "success": True,
            "entity": {
                "id": entity.id,
                "name": entity.name,
                "type": entity.type,
                "metadata": entity.metadata,
                "created_at": entity.created_at.isoformat(),
                "updated_at": entity.updated_at.isoformat()
            }
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"MCP add memory entity failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/memory/update-entity",
    tags=["mcp-tools"],
    operation_id="update_memory_entity_tool",
)
@track_tool_usage("update_memory_entity_tool")
async def mcp_update_memory_entity(
    entity_id: int,
    entity_update: MemoryEntityUpdate,
    memory_service: MemoryService = Depends(get_memory_service)
):
    """MCP Tool: Update an existing memory entity."""
    try:
        entity = memory_service.update_entity(entity_id, entity_update)
        if not entity:
            raise HTTPException(status_code=404, detail="Entity not found")
        return {
            "success": True,
            "entity": {
                "id": entity.id,
                "name": entity.name,
                "type": entity.type,
                "metadata": entity.metadata,
                "created_at": entity.created_at.isoformat(),
                "updated_at": entity.updated_at.isoformat()
            }
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"MCP update memory entity failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/memory/add-observation",
    tags=["mcp-tools"],
    operation_id="add_memory_observation_tool",
)
@track_tool_usage("add_memory_observation_tool")
async def mcp_add_memory_observation(
    entity_id: int,
    observation_data: MemoryObservationCreate,
    memory_service: MemoryService = Depends(get_memory_service)
):
    """MCP Tool: Add an observation to a memory entity."""
    try:
        observation = memory_service.create_memory_observation(
            entity_id,
            observation_data,
        )
        audit_service = AuditLogService(memory_service.db)
        audit_service.log_action(
            action="memory_observation_added",
            entity_type="memory_observation",
            entity_id=observation.id,
            changes=observation_data.model_dump(exclude_unset=True)
        )
        return {"success": True, "observation_id": observation.id}
    except Exception as e:
        logger.error(f"MCP add memory observation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/memory/add-relation",
    tags=["mcp-tools"],
    operation_id="add_memory_relation_tool",
)
@track_tool_usage("add_memory_relation_tool")
async def mcp_add_memory_relation(
    relation_data: MemoryRelationCreate,
    memory_service: MemoryService = Depends(get_memory_service)
):
    """MCP Tool: Add a relation between two memory entities."""
    try:
        relation = memory_service.create_relation(relation_data)
        return {
            "success": True,
            "relation": {
                "id": relation.id,
                "source_entity_id": relation.source_entity_id,
                "target_entity_id": relation.target_entity_id,
                "type": relation.type,
                "metadata": relation.metadata,
                "created_at": relation.created_at.isoformat()
            }
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"MCP add memory relation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/mcp-tools/memory/search",
    tags=["mcp-tools"],
    operation_id="search_memory_tool",
)
@track_tool_usage("search_memory_tool")
async def mcp_search_memory(
    query: str,
    limit: int = 10,
    memory_service: MemoryService = Depends(get_memory_service)
):
    """MCP Tool: Search memory for entities matching a query."""
    try:
        results = memory_service.search_entities(query, limit)
        return {
            "success": True,
            "results": [
                {
                    "id": entity.id,
                    "name": entity.name,
                    "type": entity.type,
                    "metadata": entity.metadata,
                    "score": score
                }
                for entity, score in results
            ]
        }
    except Exception as e:
        logger.error(f"MCP search memory failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/mcp-tools/memory/search-graph",
    tags=["mcp-tools"],
    operation_id="search_graph_tool",
)
async def mcp_search_graph(
    query: str,
    limit: int = 10,
    memory_service: MemoryService = Depends(get_memory_service),
):
    """MCP Tool: Search memory graph."""
    try:
        results = memory_service.search_memory_entities(query, limit=limit)
        return {
            "success": True,
            "results": [
                {
                    "id": r.id,
                    "type": r.type,
                    "name": r.name,
                    "description": r.description,
                }
                for r in results
            ],
        }
    except Exception as e:
        logger.error(f"MCP search graph failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/mcp-tools/memory/get-content",
    tags=["mcp-tools"],
    operation_id="get_memory_content_tool",
)
@track_tool_usage("get_memory_content_tool")
async def mcp_get_memory_content(
    entity_id: int,
    memory_service: MemoryService = Depends(get_memory_service),
):
    """MCP Tool: Get the content of a memory entity."""
    try:
        content = memory_service.get_memory_entity_content(entity_id)
        if content is None:
            raise HTTPException(
                status_code=404,
                detail="Memory entity content not found",
            )
        return {"success": True, "content": content}
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.error(f"MCP get memory content failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/mcp-tools/memory/get-metadata",
    tags=["mcp-tools"],
    operation_id="get_memory_metadata_tool",
)
@track_tool_usage("get_memory_metadata_tool")
async def mcp_get_memory_metadata(
    entity_id: int,
    memory_service: MemoryService = Depends(get_memory_service),
):
    """MCP Tool: Get the metadata of a memory entity."""
    try:
        metadata = memory_service.get_memory_entity_metadata(entity_id)
        if metadata is None:
            raise HTTPException(
                status_code=404,
                detail="Memory entity metadata not found",
            )
        return {"success": True, "metadata": metadata}
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.error(f"MCP get memory metadata failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/mcp-tools/list",
    tags=["mcp-tools"],
    operation_id="list_mcp_tools_tool",
)
@track_tool_usage("list_mcp_tools_tool")
async def mcp_list_tools():
    """MCP Tool: List all available MCP tools."""
    tools = []
    for route in router.routes:
        if hasattr(route, "name") and route.name.startswith("mcp_"):
            description = (
                route.description.split('\n')[0]
                if route.description
                else "No description"
            )
            tools.append({
                "name": route.name,
                "path": route.path,
                "description": description,
            })
    return {"success": True, "tools": tools}


@router.post(
    "/mcp-tools/rule/mandate/create",
    tags=["mcp-tools"],
    operation_id="create_mandate_tool",
)
@track_tool_usage("create_mandate_tool")
async def mcp_create_mandate(
    mandate: UniversalMandateCreate,
    db: AsyncSession = Depends(get_db_session),
):
    """MCP Tool: Create a new universal mandate."""
    try:
        rules_service = RulesService(db)
        created_mandate = rules_service.create_universal_mandate(mandate)
        return {
            "success": True,
            "mandate": {
                "id": created_mandate.id,
                "name": created_mandate.name,
                "description": created_mandate.description,
                "rules": created_mandate.rules,
                "created_at": created_mandate.created_at.isoformat(),
            },
        }
    except Exception as e:
        logger.error(f"MCP create mandate failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/mcp-tools/rule/mandate/list",
    tags=["mcp-tools"],
    operation_id="list_mandates_tool",
)
async def mcp_list_mandates(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db_session),
):
    """MCP Tool: List universal mandates."""
    try:
        query = db.query(models.UniversalMandate)
        if active_only:
            query = query.filter(models.UniversalMandate.is_active.is_(True))
        mandates = query.order_by(models.UniversalMandate.priority.desc()).all()
        return {
            "success": True,
            "mandates": [
                {
                    "id": m.id,
                    "title": m.title,
                    "description": m.description,
                    "priority": m.priority,
                    "is_active": m.is_active,
                }
                for m in mandates
            ],
        }
    except Exception as e:
        logger.error(f"MCP list mandates failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete(
    "/mcp-tools/rule/mandate/delete",
    tags=["mcp-tools"],
    operation_id="delete_mandate_tool",
)
async def mcp_delete_mandate(
    mandate_id: str,
    db: AsyncSession = Depends(get_db_session),
):
    """MCP Tool: Delete a universal mandate."""
    try:
        mandate = (
            db.query(models.UniversalMandate)
            .filter(models.UniversalMandate.id == mandate_id)
            .first()
        )
        if not mandate:
            raise HTTPException(status_code=404, detail="Mandate not found")
        db.delete(mandate)
        db.commit()
        AuditLogService(db).log_action(
            action="universal_mandate_deleted",
            entity_type="universal_mandate",
            entity_id=mandate_id,
            changes={},
        )
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"MCP delete mandate failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/rule/agent/create",
    tags=["mcp-tools"],
    operation_id="create_agent_rule_tool",
)
@track_tool_usage("create_agent_rule_tool")
async def mcp_create_agent_rule(
    rule: AgentRuleCreate,
    db: AsyncSession = Depends(get_db_session),
):
    """MCP Tool: Create a new agent rule."""
    try:
        rules_service = RulesService(db)
        created_rule = rules_service.create_agent_rule(rule)
        return {
            "success": True,
            "rule": {
                "id": created_rule.id,
                "agent_id": created_rule.agent_id,
                "rule": created_rule.rule,
                "created_at": created_rule.created_at.isoformat(),
            },
        }
    except Exception as e:
        logger.error(f"MCP create agent rule failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/handoff/create",
    tags=["mcp-tools"],
    operation_id="create_handoff_criteria_tool",
)
@track_tool_usage("create_handoff_criteria_tool")
async def mcp_create_handoff_criteria(
    criteria: AgentHandoffCriteriaCreate,
    service: AgentHandoffService = Depends(get_agent_handoff_service),
):
    """MCP Tool: Create new agent handoff criteria."""
    try:
        created_criteria = service.create_criteria(criteria)
        return {
            "success": True,
            "criteria": {
                "id": created_criteria.id,
                "agent_role_id": created_criteria.agent_role_id,
                "handoff_to_agent_role_id": created_criteria.handoff_to_agent_role_id,
                "priority": created_criteria.priority,
                "criteria_config": created_criteria.criteria_config,
                "created_at": created_criteria.created_at.isoformat(),
                "updated_at": created_criteria.updated_at.isoformat()
            }
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"MCP create handoff criteria tool failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/mcp-tools/handoff/list",
    tags=["mcp-tools"],
    operation_id="list_handoff_criteria_tool",
)
@track_tool_usage("list_handoff_criteria_tool")
async def mcp_list_handoff_criteria(
    agent_role_id: Optional[str] = Query(None),
    service: AgentHandoffService = Depends(get_agent_handoff_service),
):
    """MCP Tool: List agent handoff criteria."""
    try:
        criteria_list = (
            service.get_criteria_by_agent_role(agent_role_id)
            if agent_role_id
            else service.get_all_criteria()
        )
        return {
            "success": True,
            "criteria": [
                {
                    "id": c.id,
                    "agent_role_id": c.agent_role_id,
                    "handoff_to_agent_role_id": c.handoff_to_agent_role_id,
                    "priority": c.priority,
                    "criteria_config": c.criteria_config,
                    "created_at": c.created_at.isoformat(),
                    "updated_at": c.updated_at.isoformat()
                }
                for c in criteria_list
            ]
        }
    except Exception as e:
        logger.error(f"MCP list handoff criteria tool failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete(
    "/mcp-tools/handoff/delete",
    tags=["mcp-tools"],
    operation_id="delete_handoff_criteria_tool",
    response_model=DataResponse[bool],
)
@track_tool_usage("delete_handoff_criteria_tool")
async def mcp_delete_handoff_criteria(
    criteria_id: str,
    service: AgentHandoffService = Depends(get_agent_handoff_service),
):
    """MCP Tool: Delete agent handoff criteria."""
    try:
        success = service.delete_criteria(criteria_id)
        if not success:
            raise HTTPException(status_code=404, detail="Handoff criteria not found")
        return DataResponse[bool](data=True, message="Handoff criteria deleted successfully")
    except Exception as e:
        logger.error(f"MCP delete handoff criteria tool failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/error-protocol/add",
    tags=["mcp-tools"],
    operation_id="add_error_protocol_tool",
)
@track_tool_usage("add_error_protocol_tool")
async def mcp_add_error_protocol(
    role_id: str,
    protocol: ErrorProtocolCreate,
    service: ErrorProtocolService = Depends(get_error_protocol_service),
):
    """MCP Tool: Add an error protocol to an agent role."""
    try:
        created = service.add_protocol(role_id, protocol)
        return {
            "success": True,
            "protocol": {
                "id": created.id,
                "agent_role_id": created.agent_role_id,
                "error_type": created.error_type,
                "protocol": created.protocol,
                "priority": created.priority,
                "is_active": created.is_active,
                "created_at": created.created_at.isoformat(),
            },
        }
    except Exception as e:
        logger.error(f"MCP add error protocol failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/mcp-tools/error-protocol/list",
    tags=["mcp-tools"],
    operation_id="list_error_protocols_tool",
)
@track_tool_usage("list_error_protocols_tool")
async def mcp_list_error_protocols(
    role_id: Optional[str] = Query(None),
    service: ErrorProtocolService = Depends(get_error_protocol_service),
):
    """MCP Tool: List error protocols."""
    try:
        items = service.list_protocols(role_id)
        return {
            "success": True,
            "protocols": [
                {
                    "id": p.id,
                    "agent_role_id": p.agent_role_id,
                    "error_type": p.error_type,
                    "protocol": p.protocol,
                    "priority": p.priority,
                    "is_active": p.is_active,
                    "created_at": p.created_at.isoformat(),
                }
                for p in items
            ],
        }
    except Exception as e:
        logger.error(f"MCP list error protocols failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete(
    "/mcp-tools/error-protocol/remove",
    tags=["mcp-tools"],
    operation_id="remove_error_protocol_tool",
    response_model=DataResponse[bool],
)
@track_tool_usage("remove_error_protocol_tool")
async def mcp_remove_error_protocol(
    protocol_id: str,
    service: ErrorProtocolService = Depends(get_error_protocol_service),
):
    """MCP Tool: Remove an error protocol."""
    try:
        success = service.remove_protocol(protocol_id)
        if not success:
            raise HTTPException(status_code=404, detail="Error protocol not found")
        return DataResponse[bool](data=True, message="Error protocol removed")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"MCP remove error protocol failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/forbidden-action/create",
    tags=["mcp-tools"],
    operation_id="create_forbidden_action_tool",
)
@track_tool_usage("create_forbidden_action_tool")
async def mcp_create_forbidden_action(
    agent_role_id: str,
    action: str,
    reason: Optional[str] = None,
    db: AsyncSession = Depends(get_db_session),
):
    """MCP Tool: Create a forbidden action for an agent role."""
    try:
        return await add_forbidden_action_tool(
            agent_role_id=agent_role_id,
            action=action,
            reason=reason,
            db=db,
        )
    except Exception as e:
        logger.error(f"MCP create forbidden action failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/mcp-tools/forbidden-action/list",
    tags=["mcp-tools"],
    operation_id="list_forbidden_actions_tool",
)
@track_tool_usage("list_forbidden_actions_tool")
async def mcp_list_forbidden_actions(
    agent_role_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db_session),
):
    """MCP Tool: List forbidden actions for agent roles."""
    try:
        return await list_forbidden_actions_tool(agent_role_id, db)
    except Exception as e:
        logger.error(f"MCP list forbidden actions failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/verification-requirement/create",
    tags=["mcp-tools"],
    operation_id="create_verification_requirement_tool",
)
@track_tool_usage("create_verification_requirement_tool")
async def mcp_create_verification_requirement(
    agent_role_id: str,
    requirement: str,
    description: Optional[str] = None,
    is_mandatory: bool = True,
    db: AsyncSession = Depends(get_db_session),
):
    """MCP Tool: Create a verification requirement for an agent role."""
    try:
        from ...mcp_tools.verification_requirement_tools import (
            create_verification_requirement_tool,
        )

        return await create_verification_requirement_tool(
            agent_role_id=agent_role_id,
            requirement=requirement,
            description=description,
            is_mandatory=is_mandatory,
            db=db,
        )
    except Exception as e:
        logger.error(f"MCP create verification requirement failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/mcp-tools/verification-requirement/list",
    tags=["mcp-tools"],
    operation_id="list_verification_requirements_tool",
)
@track_tool_usage("list_verification_requirements_tool")
async def mcp_list_verification_requirements(
    agent_role_id: Optional[str] = Query(None, description="Filter by agent role ID."),
    db: AsyncSession = Depends(get_db_session),
):
    """MCP Tool: List agent verification requirements."""
    try:
        rules_service = RulesService(db)
        verification_requirements = rules_service.list_agent_verification_requirements(agent_role_id)
        return {
            "success": True,
            "verification_requirements": [vr.model_dump(mode='json') for vr in verification_requirements]
        }
    except Exception as e:
        logger.error(f"MCP list verification requirements failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete(
    "/mcp-tools/verification-requirement/delete",
    tags=["mcp-tools"],
    operation_id="delete_verification_requirement_tool",
)
async def mcp_delete_verification_requirement(
    requirement_id: str,
    db: AsyncSession = Depends(get_db_session),
):
    """MCP Tool: Delete a verification requirement."""
    try:
        from ...mcp_tools.verification_requirement_tools import (
            delete_verification_requirement_tool,
        )

        return await delete_verification_requirement_tool(requirement_id, db)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"MCP delete verification requirement failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mcp-tools/metrics", tags=["mcp-tools"], operation_id="mcp_tools_metrics")
async def mcp_tools_metrics() -> MetricsResponse:
    """Return usage metrics for MCP tools."""
    return MetricsResponse(metrics=dict(tool_counters))
