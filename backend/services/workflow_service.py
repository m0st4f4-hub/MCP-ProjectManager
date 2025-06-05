from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from .. import models
from ..schemas.workflow import WorkflowCreate
from ..crud import workflows as crud_workflows


class WorkflowService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_workflow(self, workflow: WorkflowCreate) -> models.Workflow:
        return await crud_workflows.create_workflow(self.db, workflow)

    async def get_workflows(self, skip: int = 0, limit: int = 100) -> List[models.Workflow]:
        return await crud_workflows.get_workflows(self.db, skip, limit)

    async def delete_workflow(self, workflow_id: str) -> bool:
        return await crud_workflows.delete_workflow(self.db, workflow_id)
