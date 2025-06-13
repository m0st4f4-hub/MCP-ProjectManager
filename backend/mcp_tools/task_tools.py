"""
MCP Tools for Task Management.
"""

from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import logging

from services.task_service import TaskService
from backend import schemas

logger = logging.getLogger(__name__)


async def create_task_tool(
    task_data: schemas.TaskCreate,
    db: Session
) -> dict:
    """MCP Tool: Create a new task."""
    try:
        task_service = TaskService(db)
        task = task_service.create_task(task_data)
        
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
    skip: int = 0,
    limit: int = 100,
    db: Session = None
) -> dict:
    """MCP Tool: List tasks with filtering."""
    try:
        task_service = TaskService(db)
        # Simplified version - returning empty list for now
        
        return {
            "success": True,
            "tasks": []
        }
    except Exception as e:
        logger.error(f"MCP list tasks failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
