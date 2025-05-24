from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional


def create_task(db: Session, task: schemas.TaskCreate, project_id: str) -> models.Task:
    # Add logic to create a task for a given project
    pass


def get_task(db: Session, task_id: str) -> Optional[models.Task]:
    # Add logic to get a single task by ID
    pass


def get_tasks(db: Session, project_id: str, skip: int = 0, limit: int = 100) -> List[models.Task]:
    # Add logic to get multiple tasks for a project
    pass


def get_task_by_project_and_number(db: Session, project_id: str, task_number: int) -> Optional[models.Task]:
    # Add logic to get a single task by project ID and task number
    pass


def update_task(db: Session, task_id: str, task: schemas.TaskUpdate) -> Optional[models.Task]:
    # Add logic to update a task by ID
    pass


def delete_task(db: Session, task_id: str) -> Optional[models.Task]:
    # Add logic to delete a task by ID
    pass
