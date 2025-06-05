"""
MCP Core Tools Router - Functionality for Project and Task MCP integration.
Provides MCP tool definitions.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import logging

from ....database import get_sync_db as get_db
from ....services.project_service import ProjectService
from ....services.task_service import TaskService
from ....services.audit_log_service import AuditLogService
from ....services.memory_service import MemoryService
from ....services.project_file_association_service import ProjectFileAssociationService
from ....services.user_role_service import UserRoleService
from ....services.rules_service import RulesService
from ....schemas.project import ProjectCreate
from ....schemas.task import TaskCreate
from ....schemas import AgentRuleCreate
from ....schemas.universal_mandate import UniversalMandateCreate
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


def get_project_file_service(
    db: Session = Depends(get_db_session),
) -> ProjectFileAssociationService:
    return ProjectFileAssociationService(db)


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
    skip: int = Query(0, ge=0, description="Number of records to skip."),
    limit: int = Query(100, gt=0, description="Maximum records to return."),
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
    skip: int = Query(0, ge=0, description="Number of records to skip."),
    limit: int = Query(100, gt=0, description="Maximum records to return."),
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
    "/mcp-tools/task/update",
    tags=["mcp-tools"],
    operation_id="update_task_tool",
)
async def mcp_update_task(
    project_id: str,
    task_number: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db_session)
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
                "updated_at": task.updated_at.isoformat() if task.updated_at else None
            }
        }
    except Exception as e:
        logger.error(f"MCP update task failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/task/delete",
    tags=["mcp-tools"],
    operation_id="delete_task_tool",
)
async def mcp_delete_task(
    project_id: str,
    task_number: int,
    db: Session = Depends(get_db_session)
):
    """MCP Tool: Delete a task."""
    try:
        task_service = TaskService(db)
        task = task_service.delete_task(
            project_id=project_id,
            task_number=task_number
        )
        audit_service = AuditLogService(db)
        audit_service.log_action(
            action="task_deleted",
            entity_type="task",
            entity_id=f"{project_id}-{task_number}",
            changes=None
        )

        return {
            "success": True,
            "task": {
                "project_id": task.project_id,
                "task_number": task.task_number,
                "title": task.title,
                "description": task.description,
                "status": task.status
            }
        }
    except Exception as e:
        logger.error(f"MCP delete task failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/project/add-file",
    tags=["mcp-tools"],
    operation_id="add_project_file_tool",
)
async def mcp_add_project_file(
    project_id: str,
    file_memory_entity_id: int,
    service: ProjectFileAssociationService = Depends(get_project_file_service),
):
    """MCP Tool: Associate a file (memory entity) with a project."""
    try:
        project_file = service.add_project_file_association(
            project_id=project_id,
            file_memory_entity_id=file_memory_entity_id
        )
        audit_service = AuditLogService(service.db)
        audit_service.log_action(
            action="project_file_added",
            entity_type="project_file",
            entity_id=f"{project_id}-{file_memory_entity_id}",
            changes={
                "project_id": project_id,
                "file_memory_entity_id": file_memory_entity_id
            }
        )
        return {"success": True, "project_file_id": project_file.id}
    except Exception as e:
        logger.error(f"MCP add project file failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/mcp-tools/project/file/list",
    tags=["mcp-tools"],
    operation_id="list_project_files_tool",
)
async def mcp_list_project_files(
    project_id: str,
    skip: int = 0,
    limit: int = 100,
    service: ProjectFileAssociationService = Depends(get_project_file_service),
):
    """MCP Tool: List files associated with a project."""
    try:
        project_files = service.get_project_file_associations(
            project_id=project_id,
            skip=skip,
            limit=limit
        )
        return {
            "success": True,
            "project_files": [
                {
                    "id": pf.id,
                    "project_id": pf.project_id,
                    "file_memory_entity_id": pf.file_memory_entity_id,
                    "created_at": pf.created_at.isoformat()
                }
                for pf in project_files
            ]
        }
    except Exception as e:
        logger.error(f"MCP list project files failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/project/remove-file",
    tags=["mcp-tools"],
    operation_id="remove_project_file_tool",
)
async def mcp_remove_project_file(
    project_id: str,
    file_memory_entity_id: int,
    service: ProjectFileAssociationService = Depends(get_project_file_service),
):
    """MCP Tool: Remove a file (memory entity) association from a project."""
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
        return {"success": True, "message": "Project file association removed successfully"}
    except Exception as e:
        logger.error(f"MCP remove project file failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/user-role/assign",
    tags=["mcp-tools"],
    operation_id="assign_role_tool",
)
async def mcp_assign_role(
    user_id: str,
    role_name: str,
    db: Session = Depends(get_db_session),
):
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
    except Exception as e:
        logger.error(f"MCP assign role failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/mcp-tools/user-role/list",
    tags=["mcp-tools"],
    operation_id="list_roles_tool",
)
async def mcp_list_roles(
    user_id: str,
    db: Session = Depends(get_db_session),
):
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
    except Exception as e:
        logger.error(f"MCP list roles failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/user-role/remove",
    tags=["mcp-tools"],
    operation_id="remove_role_tool",
)
async def mcp_remove_role(
    user_id: str,
    role_name: str,
    db: Session = Depends(get_db_session),
):
    """Remove a role from a user."""
    try:
        service = UserRoleService(db)
        success = service.remove_role_from_user(user_id, role_name)
        return {"success": success}
    except Exception as e:
        logger.error(f"MCP remove role failed: {e}")
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

        if hasattr(entity_data, "observations") and entity_data.observations:
            for obs_content in entity_data.observations:
                memory_service.add_observation_to_entity(
                    entity_id=entity.id,
                    observation=MemoryObservationCreate(
                        content=obs_content,
                        source="mcp_tool",
                    ),
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
        from_entity = memory_service.get_memory_entity_by_id(
            relation_data.from_entity_id
        )
        to_entity = memory_service.get_memory_entity_by_id(
            relation_data.to_entity_id
        )

        if not from_entity or not to_entity:
            raise HTTPException(
                status_code=404,
                detail="One or both entities not found",
            )

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


@router.get(
    "/mcp-tools/memory/get-content",
    tags=["mcp-tools"],
    operation_id="get_memory_content_tool",
)
async def mcp_get_memory_content(
    entity_id: int,
    memory_service: MemoryService = Depends(get_memory_service),
):
    """MCP Tool: Retrieve memory entity content."""
    try:
        content = memory_service.get_file_content(entity_id)
        return {"success": True, "content": content}
    except HTTPException as e:
        logger.error(
            f"MCP get memory content failed with HTTP exception: {e.detail}"
        )
        raise e
    except Exception as e:
        logger.error(f"MCP get memory content failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/mcp-tools/memory/get-metadata",
    tags=["mcp-tools"],
    operation_id="get_memory_metadata_tool",
)
async def mcp_get_memory_metadata(
    entity_id: int,
    memory_service: MemoryService = Depends(get_memory_service),
):
    """MCP Tool: Retrieve memory entity metadata."""
    try:
        metadata = memory_service.get_file_metadata(entity_id)
        return {"success": True, "metadata": metadata}
    except HTTPException as e:
        logger.error(
            f"MCP get memory metadata failed with HTTP exception: {e.detail}"
        )
        raise e
    except Exception as e:
        logger.error(f"MCP get memory metadata failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/mcp-tools/list",
    tags=["mcp-tools"],
    operation_id="list_mcp_tools_tool",
)
async def mcp_list_tools():
    """MCP Tool: List all available MCP tools."""
    try:
        tool_list = []
        for route in router.routes:
            if hasattr(route, "operation_id") and route.operation_id.endswith("_tool"):
                tool_info = {
                    "name": route.operation_id,
                    "path": route.path,
                    "method": list(route.methods)[0] if route.methods else "GET",
                    "description": route.summary or route.description or "No description available"
                }
                tool_list.append(tool_info)
        return {"success": True, "tools": tool_list}
    except Exception as e:
        logger.error(f"MCP list tools failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
@router.post(
    "/mcp-tools/rule/mandate/create",
    tags=["mcp-tools"],
    operation_id="create_mandate_tool",
)
async def mcp_create_mandate(
    mandate: UniversalMandateCreate,
    db: Session = Depends(get_db_session),
):
async def mcp_create_mandate(
    mandate: UniversalMandateCreate,
    db: Session = Depends(get_db_session),
):
    """MCP Tool: Create a new universal mandate."""
    try:
        rules_service = RulesService(db)
        new_mandate = rules_service.create_universal_mandate(mandate)
        audit_service = AuditLogService(db)
        audit_service.log_action(
            action="mandate_created",
            entity_type="universal_mandate",
            entity_id=new_mandate.id,
            changes=mandate.model_dump(exclude_unset=True)
        )
        return {"success": True, "mandate": new_mandate.model_dump()}
    except Exception as e:
        logger.error(f"MCP create mandate failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/mcp-tools/rule/agent/create",
    tags=["mcp-tools"],
    operation_id="create_agent_rule_tool",
)
async def mcp_create_agent_rule(
    rule: AgentRuleCreate,
    db: Session = Depends(get_db_session),
):
async def mcp_create_agent_rule(
    rule: AgentRuleCreate,
    db: Session = Depends(get_db_session),
):
    """MCP Tool: Create a new agent-specific rule."""
    try:
        rules_service = RulesService(db)
        new_rule = rules_service.create_agent_rule(rule)
        audit_service = AuditLogService(db)
        audit_service.log_action(
            action="agent_rule_created",
            entity_type="agent_rule",
            entity_id=new_rule.id,
            changes=rule.model_dump(exclude_unset=True)
        )
        return {"success": True, "rule": new_rule.model_dump()}
    except Exception as e:
        logger.error(f"MCP create agent rule failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
