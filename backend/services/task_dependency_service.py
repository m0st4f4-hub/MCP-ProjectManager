from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from .. import models, schemas
from typing import List, Optional
from uuid import UUID
from backend.crud.task_dependencies import create_task_dependency
from backend.crud.task_dependency_validation import is_self_dependency, is_circular_dependency


class TaskDependencyService:
    def __init__(self, db: Session):
        self.db = db

    def get_dependency(self, predecessor_task_project_id: UUID, predecessor_task_number: int, successor_task_project_id: UUID, successor_task_number: int) -> Optional[models.TaskDependency]:
        return self.db.query(models.TaskDependency).filter(
            models.TaskDependency.predecessor_task_project_id == str(
                predecessor_task_project_id),
            models.TaskDependency.predecessor_task_number == predecessor_task_number,
            models.TaskDependency.successor_task_project_id == str(
                successor_task_project_id),
            models.TaskDependency.successor_task_number == successor_task_number
        ).first()

    def get_dependencies_for_task(self, task_project_id: UUID, task_number: int) -> List[models.TaskDependency]:
        # Get dependencies where this task is either the predecessor or the successor
        return (
            self.db.query(models.TaskDependency)
            .filter(
                (models.TaskDependency.predecessor_task_project_id == str(task_project_id) and models.TaskDependency.predecessor_task_number == task_number) |
                (models.TaskDependency.successor_task_project_id == str(
                    task_project_id) and models.TaskDependency.successor_task_number == task_number)
            )
            .all()
        )

    def get_predecessor_tasks(self, task_project_id: UUID, task_number: int) -> List[models.TaskDependency]:
        # Get dependencies where this task is the successor (i.e., get its predecessors)
        return (
            self.db.query(models.TaskDependency)
            .options(joinedload(models.TaskDependency.predecessor_task))
            .filter(
                models.TaskDependency.successor_task_project_id == str(
                    task_project_id), models.TaskDependency.successor_task_number == task_number
            )
            .all()
        )

    def get_successor_tasks(self, task_project_id: UUID, task_number: int) -> List[models.TaskDependency]:
        # Get dependencies where this task is the predecessor (i.e., get its successors)
        return (
            self.db.query(models.TaskDependency)
            .options(joinedload(models.TaskDependency.successor_task))
            .filter(
                models.TaskDependency.predecessor_task_project_id == str(
                    task_project_id), models.TaskDependency.predecessor_task_number == task_number
            )
            .all()
        )

    def add_dependency(self, predecessor_task_project_id: UUID, predecessor_task_number: int, successor_task_project_id: UUID, successor_task_number: int) -> Optional[models.TaskDependency]:
        # Use the CRUD function for creation and validation
        from backend.schemas import TaskDependencyCreate
        task_dependency = TaskDependencyCreate(
            predecessor_project_id=str(predecessor_task_project_id),
            predecessor_task_number=predecessor_task_number,
            successor_project_id=str(successor_task_project_id),
            successor_task_number=successor_task_number,
            type=None  # or set appropriately if type is required
        )
        return create_task_dependency(self.db, task_dependency)

    def remove_dependency(self, predecessor_task_project_id: UUID, predecessor_task_number: int, successor_task_project_id: UUID, successor_task_number: int) -> bool:
        db_dependency = self.get_dependency(
            predecessor_task_project_id, predecessor_task_number,
            successor_task_project_id, successor_task_number
        )
        if db_dependency:
            self.db.delete(db_dependency)
            self.db.commit()
            return True
        return False
