"""MCP Tools for managing workflows."""

from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import logging

from backend import models
from backend.schemas.workflow import WorkflowCreate

logger = logging.getLogger(__name__)


def _workflow_to_dict(workflow: models.Workflow) -> dict:
    return {
        "id": workflow.id,
        "name": workflow.name,
        "description": workflow.description,
        "workflow_type": workflow.workflow_type,
        "entry_criteria": workflow.entry_criteria,
        "success_criteria": workflow.success_criteria,
        "is_active": workflow.is_active,
        "created_at": workflow.created_at.isoformat(),
        "updated_at": workflow.updated_at.isoformat() if workflow.updated_at else None,
    }


async def create_workflow_tool(workflow_data: WorkflowCreate, db: Session) -> dict:
    """MCP Tool: Create a new workflow."""
    try:
        workflow = models.Workflow(
            name=workflow_data.name,
            description=workflow_data.description,
            workflow_type=workflow_data.workflow_type,
            entry_criteria=workflow_data.entry_criteria,
            success_criteria=workflow_data.success_criteria,
            is_active=workflow_data.is_active,
        )
        db.add(workflow)
        db.commit()
        db.refresh(workflow)
        return {"success": True, "workflow": _workflow_to_dict(workflow)}
    except Exception as e:
        logger.error(f"MCP create workflow failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def list_workflows_tool(
    workflow_type: Optional[str] = None,
    active_only: bool = False,
    db: Session = None,
) -> dict:
    """MCP Tool: List workflows."""
    try:
        query = db.query(models.Workflow)
        if workflow_type:
            query = query.filter(models.Workflow.workflow_type == workflow_type)
        if active_only:
            query = query.filter(models.Workflow.is_active.is_(True))
        workflows = query.all()
        return {
            "success": True,
            "workflows": [_workflow_to_dict(w) for w in workflows],
        }
    except Exception as e:
        logger.error(f"MCP list workflows failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def delete_workflow_tool(workflow_id: str, db: Session) -> dict:
    """MCP Tool: Delete a workflow by ID."""
    try:
        workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        db.delete(workflow)
        db.commit()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"MCP delete workflow failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
