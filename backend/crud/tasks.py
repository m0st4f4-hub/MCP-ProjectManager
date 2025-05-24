from sqlalchemy.orm import Session
from sqlalchemy import and_
from .. import models, schemas
from typing import List, Optional


def create_task(db: Session, task: schemas.TaskCreate, agent_id: Optional[str] = None) -> models.Task:
    """Create a new task for a given project."""
    # Get the next task number for this project
    max_task_number = db.query(models.Task).filter(
        models.Task.project_id == task.project_id
    ).with_entities(models.Task.task_number).order_by(
        models.Task.task_number.desc()
    ).first()
    
    next_task_number = 1 if not max_task_number else max_task_number[0] + 1
    
    # If agent_name is provided in the task schema, get the agent by name
    if task.agent_name:
        from . import agents as crud_agents
        agent = crud_agents.get_agent_by_name(db, name=task.agent_name)
        if agent:
            agent_id = agent.id
    
    db_task = models.Task(
        project_id=task.project_id,
        task_number=next_task_number,
        title=task.title,
        description=task.description,
        status=task.status,
        is_archived=task.is_archived,
        agent_id=agent_id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def get_task(db: Session, task_id: str) -> Optional[models.Task]:
    """Get a single task by ID."""
    return db.query(models.Task).filter(models.Task.id == task_id).first()


def get_tasks(db: Session, project_id: str, skip: int = 0, limit: int = 100) -> List[models.Task]:
    """Get multiple tasks for a project."""
    return db.query(models.Task).filter(
        models.Task.project_id == project_id
    ).offset(skip).limit(limit).all()


def get_task_by_project_and_number(db: Session, project_id: str, task_number: int) -> Optional[models.Task]:
    """Get a single task by project ID and task number."""
    return db.query(models.Task).filter(
        and_(
            models.Task.project_id == project_id,
            models.Task.task_number == task_number
        )
    ).first()


def update_task(db: Session, task_id: str, task: schemas.TaskUpdate) -> Optional[models.Task]:
    """Update a task by ID."""
    db_task = get_task(db, task_id)
    if db_task:
        if task.title is not None:
            db_task.title = task.title
        if task.description is not None:
            db_task.description = task.description
        if task.status is not None:
            db_task.status = task.status
        if task.agent_name is not None:
            from . import agents as crud_agents
            agent = crud_agents.get_agent_by_name(db, name=task.agent_name)
            db_task.agent_id = agent.id if agent else None
        db.commit()
        db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: str) -> Optional[models.Task]:
    """Delete a task by ID."""
    db_task = get_task(db, task_id)
    if db_task:
        db.delete(db_task)
        db.commit()
    return db_task


def delete_task_by_project_and_number(db: Session, project_id: str, task_number: int) -> bool:
    """Delete a task by project ID and task number."""
    db_task = get_task_by_project_and_number(db, project_id, task_number)
    if db_task:
        db.delete(db_task)
        db.commit()
        return True
    return False


def update_task_by_project_and_number(
    db: Session,
    project_id: str,
    task_number: int,
    task: schemas.TaskUpdate
) -> Optional[models.Task]:
    """Update a task by project ID and task number."""
    db_task = get_task_by_project_and_number(db, project_id, task_number)
    if db_task:
        if task.title is not None:
            db_task.title = task.title
        if task.description is not None:
            db_task.description = task.description
        if task.status is not None:
            db_task.status = task.status
        if task.is_archived is not None:
            db_task.is_archived = task.is_archived
        if task.agent_id is not None:
            db_task.agent_id = task.agent_id
        db.commit()
        db.refresh(db_task)
    return db_task
