from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func, select
from backend import models
from typing import List, Optional
from uuid import UUID
from backend.crud.task_dependencies import create_task_dependency
# Removed import that was causing issues
from backend.schemas.task_dependency import TaskDependencyCreate
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from ..services.exceptions import ValidationError

logger = logging.getLogger(__name__)

class TaskDependencyService:
    def __init__(self, db: Session):
        self.db = db

    def get_dependency(self, predecessor_task_project_id: UUID, predecessor_task_number: int, successor_task_project_id: UUID, successor_task_number: int) -> Optional[models.TaskDependency]:
        return self.db.query(models.TaskDependency).filter(
            models.TaskDependency.predecessor_task_project_id == str(predecessor_task_project_id),
            models.TaskDependency.predecessor_task_number == predecessor_task_number,
            models.TaskDependency.successor_task_project_id == str(successor_task_project_id),
            models.TaskDependency.successor_task_number == successor_task_number
        ).first()

    def get_dependencies_for_task(self, task_project_id: UUID, task_number: int) -> List[models.TaskDependency]:
        # Get dependencies where this task is either the predecessor or the successor
        return (
            self.db.query(models.TaskDependency)
            .filter(
                (models.TaskDependency.predecessor_task_project_id == str(task_project_id) and 
                 models.TaskDependency.predecessor_task_number == task_number) |
                (models.TaskDependency.successor_task_project_id == str(task_project_id) and 
                 models.TaskDependency.successor_task_number == task_number)
            )
            .all()
        )

    def get_predecessor_tasks(self, task_project_id: UUID, task_number: int) -> List[models.TaskDependency]:
        # Get dependencies where this task is the successor (i.e., get its predecessors)
        return (
            self.db.query(models.TaskDependency)
            .options(joinedload(models.TaskDependency.predecessor_task))
            .filter(
                models.TaskDependency.successor_task_project_id == str(task_project_id), 
                models.TaskDependency.successor_task_number == task_number
            )
            .all()
        )

    def get_successor_tasks(self, task_project_id: UUID, task_number: int) -> List[models.TaskDependency]:
        # Get dependencies where this task is the predecessor (i.e., get its successors)
        return (
            self.db.query(models.TaskDependency)
            .options(joinedload(models.TaskDependency.successor_task))
            .filter(
                models.TaskDependency.predecessor_task_project_id == str(task_project_id), 
                models.TaskDependency.predecessor_task_number == task_number
            )
            .all()
        )

    async def add_dependency(self, predecessor_task_project_id: UUID, predecessor_task_number: int, successor_task_project_id: UUID, successor_task_number: int, dependency_type: str) -> Optional[models.TaskDependency]:
        # Use the CRUD function for creation and validation
        task_dependency = TaskDependencyCreate(
            predecessor_project_id=str(predecessor_task_project_id),
            predecessor_task_number=predecessor_task_number,
            successor_project_id=str(successor_task_project_id),
            successor_task_number=successor_task_number,
            dependency_type=dependency_type
        )
        
        # Check for self-dependency
        if self._is_self_dependency(task_dependency):
            logger.error("Self-dependency detected: Service Layer Check.")
            raise ValidationError("A task cannot be dependent on itself")
        
        # Check for circular dependency
        if await self._is_circular_dependency(task_dependency):
            logger.error("Circular dependency detected: Service Layer Check.")
            raise ValidationError("Circular dependency detected")
        
        # Create the dependency in the database
        db_task_dependency = await create_task_dependency(self.db, task_dependency)
        await self.db.commit()
        await self.db.refresh(db_task_dependency)

        logger.info(f"Added task dependency from {predecessor_task_project_id}/{predecessor_task_number} to {successor_task_project_id}/{successor_task_number}")
        return db_task_dependency
        
    def _is_self_dependency(self, task_dependency: TaskDependencyCreate) -> bool:
        """Check if a task dependency is a self-dependency."""
        return (
            task_dependency.predecessor_project_id == task_dependency.successor_project_id and
            task_dependency.predecessor_task_number == task_dependency.successor_task_number
        )
        
    async def _is_circular_dependency(self, task_dependency: TaskDependencyCreate) -> bool:
        """Check if adding this dependency would create a circular dependency."""
        # This is a simplified check for immediate circularity (A -> B and B -> A).
        # A full implementation would need to traverse the dependency graph.
        # Simple check: Does the successor task already depend on the predecessor task?
        result = await self.db.execute(
            select(models.TaskDependency).filter(
                models.TaskDependency.predecessor_project_id == task_dependency.successor_project_id,
                models.TaskDependency.predecessor_task_number == task_dependency.successor_task_number,
                models.TaskDependency.successor_project_id == task_dependency.predecessor_project_id,
                models.TaskDependency.successor_task_number == task_dependency.predecessor_task_number
            )
        )
        existing_dependency = result.first()
        return existing_dependency is not None

    def remove_dependency(self, predecessor_task_project_id: UUID, predecessor_task_number: int, successor_task_project_id: UUID, successor_task_number: int) -> bool:
        # Assuming a function exists in CRUD to delete by these identifiers
        # You'll likely need to fetch the TaskDependency first to get its ID
        # For now, a simplified version:
        dependency_to_remove = (
            self.db.query(models.TaskDependency)
            .filter(
                models.TaskDependency.predecessor_project_id == str(predecessor_task_project_id),
                models.TaskDependency.predecessor_task_number == predecessor_task_number,
                models.TaskDependency.successor_project_id == str(successor_task_project_id),
                models.TaskDependency.successor_task_number == successor_task_number
            )
            .first()
        )

        if dependency_to_remove:
            self.db.delete(dependency_to_remove)
            self.db.commit()
            logger.info(f"Removed task dependency from {predecessor_task_project_id}/{predecessor_task_number} to {successor_task_project_id}/{successor_task_number}")
            return True
        return False


async def create_task_dependency(
    db: AsyncSession,
    task_dependency: TaskDependencyCreate
):
    """Create a new task dependency in the database."""
    # Ensure field names match the TaskDependency model
    db_task_dependency = models.TaskDependency(
        predecessor_project_id=task_dependency.predecessor_project_id,
        predecessor_task_number=task_dependency.predecessor_task_number,
        successor_project_id=task_dependency.successor_project_id,
        successor_task_number=task_dependency.successor_task_number,
        dependency_type=task_dependency.dependency_type  # Use dependency_type from the schema
    )
    db.add(db_task_dependency)
    # await db.commit()  # Commit and refresh should be handled by the caller (e.g., service method)
    # await db.refresh(db_task_dependency)
    # logger.info(f"Created task dependency: {db_task_dependency.predecessor_project_id}/{db_task_dependency.predecessor_task_number} -> {db_task_dependency.successor_project_id}/{db_task_dependency.successor_task_number}")
    return db_task_dependency


# Function to get task dependencies by dependent task ID
def get_task_dependencies_by_dependent_id(db: Session, dependent_task_id: int):
    logger.info(f"Getting task dependencies for dependent task ID: {dependent_task_id}")
    return (
        db.query(models.TaskDependency)
        .filter(models.TaskDependency.dependent_task_id == dependent_task_id)
        .all()
    )


# Function to get task dependencies by dependency task ID
def get_task_dependencies_by_dependency_id(db: Session, dependency_task_id: int):
    logger.info(f"Getting tasks that depend on task ID: {dependency_task_id}")
    return (
        db.query(models.TaskDependency)
        .filter(models.TaskDependency.dependency_task_id == dependency_task_id)
        .all()
    )


# Function to delete a task dependency
def delete_task_dependency(
    db: Session,
    dependent_task_id: int,
    dependency_task_id: int
):
    logger.info(f"Deleting task dependency: {dependent_task_id} depends on {dependency_task_id}")
    db_task_dependency = (
        db.query(models.TaskDependency)
        .filter(
            models.TaskDependency.dependent_task_id == dependent_task_id,
            models.TaskDependency.dependency_task_id == dependency_task_id
        )
        .first()
    )
    if db_task_dependency:
        db.delete(db_task_dependency)
        db.commit()
        logger.info("Task dependency deleted successfully.")
    return db_task_dependency  # Returns the deleted object or None
