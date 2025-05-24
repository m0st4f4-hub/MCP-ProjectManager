from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from .. import models, schemas
from typing import List, Optional
from uuid import UUID


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
        # Prevent a task from being dependent on itself
        if (predecessor_task_project_id == successor_task_project_id and
                predecessor_task_number == successor_task_number):
            # Depending on service design, raise HTTPException or return None and let router handle it
            return None  # Indicate failure to add self-referential dependency

        # Prevent circular dependencies - This is a complex check and might require graph traversal logic
        # For simplicity in initial implementation, we might skip this or add a basic check.
        # A full check would involve traversing the dependency graph starting from the successor task.
        # If we encounter the predecessor task during traversal, it's a circular dependency.
        # This can be added later.

        # Check if the dependency already exists
        existing_dependency = self.get_dependency(
            predecessor_task_project_id, predecessor_task_number,
            successor_task_project_id, successor_task_number
        )
        if existing_dependency:
            return existing_dependency  # Dependency already exists

        # Optional: Check if both tasks exist before creating dependency
        # predecessor_task = self.db.query(models.Task).filter(models.Task.project_id == str(predecessor_task_project_id), models.Task.task_number == predecessor_task_number).first()
        # successor_task = self.db.query(models.Task).filter(models.Task.project_id == str(successor_task_project_id), models.Task.task_number == successor_task_number).first()
        # if not predecessor_task or not successor_task:
        #    return None # Or raise HTTPException

        db_dependency = models.TaskDependency(
            predecessor_task_project_id=str(predecessor_task_project_id),
            predecessor_task_number=predecessor_task_number,
            successor_task_project_id=str(successor_task_project_id),
            successor_task_number=successor_task_number
        )
        self.db.add(db_dependency)
        self.db.commit()
        self.db.refresh(db_dependency)
        return db_dependency

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
