from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from .. import models
from ..schemas.workflow import WorkflowCreate


async def create_workflow(db: AsyncSession, workflow: WorkflowCreate) -> models.Workflow:
    db_workflow = models.Workflow(
        name=workflow.name,
        description=workflow.description,
        workflow_type=workflow.workflow_type,
        entry_criteria=workflow.entry_criteria,
        success_criteria=workflow.success_criteria,
        is_active=workflow.is_active,
    )
    db.add(db_workflow)
    await db.commit()
    await db.refresh(db_workflow)
    return db_workflow


async def get_workflows(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[models.Workflow]:
    result = await db.execute(select(models.Workflow).offset(skip).limit(limit))
    return result.scalars().all()


async def get_workflow(db: AsyncSession, workflow_id: str) -> Optional[models.Workflow]:
    result = await db.execute(select(models.Workflow).filter(models.Workflow.id == workflow_id))
    return result.scalar_one_or_none()


async def delete_workflow(db: AsyncSession, workflow_id: str) -> bool:
    workflow = await get_workflow(db, workflow_id)
    if not workflow:
        return False
    await db.delete(workflow)
    await db.commit()
    return True
