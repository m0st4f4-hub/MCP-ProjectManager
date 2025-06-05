from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models
from ..schemas.workflow import WorkflowCreate, WorkflowUpdate


class WorkflowService:
    """Service layer for Workflow CRUD operations."""

    def __init__(self, db: Session):
        self.db = db

    def create_workflow(self, workflow: WorkflowCreate) -> models.Workflow:
        db_workflow = models.Workflow(**workflow.model_dump())
        self.db.add(db_workflow)
        self.db.commit()
        self.db.refresh(db_workflow)
        return db_workflow

    def get_workflow(self, workflow_id: str) -> Optional[models.Workflow]:
        return (
            self.db.query(models.Workflow)
            .filter(models.Workflow.id == workflow_id)
            .first()
        )

    def get_workflows(self, skip: int = 0, limit: int = 100) -> List[models.Workflow]:
        return (
            self.db.query(models.Workflow)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_workflow(
        self, workflow_id: str, workflow_update: WorkflowUpdate
    ) -> Optional[models.Workflow]:
        db_workflow = self.get_workflow(workflow_id)
        if not db_workflow:
            return None
        update_data = workflow_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_workflow, key, value)
        self.db.commit()
        self.db.refresh(db_workflow)
        return db_workflow

    def delete_workflow(self, workflow_id: str) -> bool:
        db_workflow = self.get_workflow(workflow_id)
        if not db_workflow:
            return False
        self.db.delete(db_workflow)
        self.db.commit()
        return True
