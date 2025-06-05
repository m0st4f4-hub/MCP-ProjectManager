"""
MCP Tools for Task Management.
"""

from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import logging

from backend.services.task_service import TaskService
from backend.services.project_service import ProjectService
from backend.services.audit_log_service import AuditLogService
from backend import schemas

logger = logging.getLogger(__name__)


async def create_task_tool(
    task_data: schemas.TaskCreate,
    db: Session
) -> dict:
    """MCP Tool: Create a new task."""
    try:
    task_service = TaskService(db)
    project_service = ProjectService(db)  # Verify project exists
    project = project_service.get_project(task_data.project_id)
    if not project:
    raise HTTPException(status_code=404, detail="Project not found")

    task = task_service.create_task(task_data)  # Log to audit
    audit_service = AuditLogService(db)
    audit_service.log_action(
    action="task_created",
    entity_type="task",
    entity_id=f"{task.project_id}-{task.task_number}",
    changes={"title": task.title, "project_id": task.project_id}
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


async def list_tasks_tool(
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    agent_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = None
) -> dict:
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


async def update_task_tool(
    project_id: str,
    task_number: int,
    task_update: schemas.TaskUpdate,
    db: Session
) -> dict:
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


async def delete_task_tool(
    project_id: str,
    task_number: int,
    db: Session
) -> dict:
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
