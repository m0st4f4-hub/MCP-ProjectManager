from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from .. import models
from typing import List, Optional
from uuid import UUID
from backend.crud.task_dependencies import create_task_dependency
from backend.crud.task_dependency_validation import is_self_dependency, is_circular_dependency
from backend.schemas.task_dependency import TaskDependencyCreate
import logging

logger = logging.getLogger(__name__)

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
        task_dependency = TaskDependencyCreate(
            predecessor_project_id=str(predecessor_task_project_id),
            predecessor_task_number=predecessor_task_number,
            successor_project_id=str(successor_task_project_id),
            successor_task_number=successor_task_number,
        )

        # Check for self-dependency
        if is_self_dependency(task_dependency):
            logger.error("Self-dependency detected.")
            return None # Or raise a specific exception

        # Check for circular dependency
        if is_circular_dependency(self.db, task_dependency):
            logger.error("Circular dependency detected.")
            return None # Or raise a specific exception

        # Create the dependency in the database
        db_task_dependency = create_task_dependency(self.db, task_dependency)

        logger.info(f"Added task dependency from {predecessor_task_project_id}/{predecessor_task_number} to {successor_task_project_id}/{successor_task_number}")
        return db_task_dependency

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

def create_task_dependency(
    db: Session,
    task_dependency: TaskDependencyCreate
):
    logger.info(f"Creating task dependency: {task_dependency.dependent_task_id} depends on {task_dependency.dependency_task_id}")
    db_task_dependency = models.TaskDependency(
        dependent_task_id=task_dependency.dependent_task_id,
        dependency_task_id=task_dependency.dependency_task_id,
        # Add other fields as necessary
    )
    db.add(db_task_dependency)
    db.commit()
    db.refresh(db_task_dependency)
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
    return db_task_dependency # Returns the deleted object or None

# Helper function to check for self-dependency
def is_self_dependency(task_dependency: TaskDependencyCreate) -> bool:
    return (
        task_dependency.dependent_task_id == task_dependency.dependency_task_id
    )

# Helper function to check for circular dependency
def is_circular_dependency(db: Session, task_dependency: TaskDependencyCreate) -> bool:
    # This requires a more complex graph traversal algorithm
    # For a simple check, we can at least prevent immediate circularity A -> B -> A
    # A full implementation would need to traverse the dependency graph

    # Simple check: Does the dependency task already depend on the dependent task?
    existing_dependency = (
        db.query(models.TaskDependency)
        .filter(
            models.TaskDependency.dependent_task_id == task_dependency.dependency_task_id,
            models.TaskDependency.dependency_task_id == task_dependency.dependent_task_id
        )
        .first()
    )
    return existing_dependency is not None
