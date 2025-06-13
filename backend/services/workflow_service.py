from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from backend import models
from schemas.workflow import WorkflowCreate, WorkflowUpdate


class WorkflowService:
    """Service layer for project workflows."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_workflow(self, workflow: WorkflowCreate) -> models.Workflow:
        db_workflow = models.Workflow(**workflow.model_dump())
        self.db.add(db_workflow)
        await self.db.commit()
        await self.db.refresh(db_workflow)
        return db_workflow

    async def get_workflow(self, workflow_id: str) -> Optional[models.Workflow]:
        result = await self.db.execute(
            select(models.Workflow).filter(models.Workflow.id == workflow_id)
        )
        return result.scalar_one_or_none()

    async def get_workflow_by_name(self, name: str) -> Optional[models.Workflow]:
        result = await self.db.execute(
            select(models.Workflow).filter(models.Workflow.name == name)
        )
        return result.scalar_one_or_none()

    async def get_workflows(self, skip: int = 0, limit: int = 100) -> List[models.Workflow]:
        result = await self.db.execute(
            select(models.Workflow).offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def update_workflow(
        self, workflow_id: str, workflow_update: WorkflowUpdate
    ) -> Optional[models.Workflow]:
        db_workflow = await self.get_workflow(workflow_id)
        if not db_workflow:
            return None
        update_data = workflow_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_workflow, key, value)
        await self.db.commit()
        await self.db.refresh(db_workflow)
        return db_workflow

    async def delete_workflow(self, workflow_id: str) -> bool:
        db_workflow = await self.get_workflow(workflow_id)
        if not db_workflow:
            return False
        await self.db.delete(db_workflow)
        await self.db.commit()
        return True
