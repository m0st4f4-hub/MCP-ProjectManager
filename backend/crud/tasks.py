from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from .. import models
# from .. import models, schemas # Removed schema import
from backend.schemas.task import TaskCreate, TaskUpdate
from typing import List, Optional, Union
from backend.enums import TaskStatusEnum

# Import validation helpers
from .task_validation import project_exists, agent_exists


def create_task(db: Session, project_id: str, task: TaskCreate, agent_id: Optional[str] = None) -> models.Task:
    """Create a new task for a given project.

    Includes pessimistic locking to prevent race conditions during task number assignment.
    """
    # Validate that the project exists
    if not project_exists(db, project_id):
        raise ValueError(f"Project with ID {project_id} not found.")

    # Get the next task number for this project, with pessimistic lock
    # Lock the rows for the specific project to prevent other concurrent transactions
    # from querying the max task number before this transaction commits.
    max_task_number_result = db.query(func.max(models.Task.task_number)).filter(
        models.Task.project_id == project_id
    ).with_for_update().first()
    
    max_task_number = max_task_number_result[0] if max_task_number_result and max_task_number_result[0] is not None else 0
    next_task_number = max_task_number + 1
    
    # If agent_name is provided in the task schema, get the agent by name and validate existence
    agent_id_to_assign = agent_id # Start with passed agent_id
    if task.agent_name:
        from . import agents as crud_agents
        agent = crud_agents.get_agent_by_name(db, name=task.agent_name)
        if not agent:
             raise ValueError(f"Agent with name '{task.agent_name}' not found.")
        agent_id_to_assign = agent.id # Use agent ID found by name

    # If agent_id is provided (either initially or found by name), validate existence
    if agent_id_to_assign and not agent_exists(db, agent_id_to_assign):
         raise ValueError(f"Agent with ID {agent_id_to_assign} not found.")

    db_task = models.Task(
        project_id=project_id,
        task_number=next_task_number,
        title=task.title,
        description=task.description,
        status=task.status if isinstance(task.status, TaskStatusEnum) else task.status,
        is_archived=task.is_archived,
        agent_id=agent_id_to_assign # Use the validated agent_id
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


def update_task(db: Session, task_id: str, task: TaskUpdate) -> Optional[models.Task]:
    """Update a task by ID."""
    db_task = get_task(db, task_id)
    if db_task:
        # Handle agent update: if agent_name is provided, find agent ID and validate
        if task.agent_name is not None:
            from . import agents as crud_agents
            agent = crud_agents.get_agent_by_name(db, name=task.agent_name)
            if not agent:
                 raise ValueError(f"Agent with name '{task.agent_name}' not found.")
            db_task.agent_id = agent.id
        # If agent_id is provided directly in update, validate existence
        elif task.agent_id is not None:
             if not agent_exists(db, task.agent_id):
                  raise ValueError(f"Agent with ID {task.agent_id} not found.")
             db_task.agent_id = task.agent_id

        if task.title is not None:
            db_task.title = task.title
        if task.description is not None:
            db_task.description = task.description
        if task.status is not None:
            db_task.status = task.status if isinstance(task.status, models.TaskStatusEnum) else task.status

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
    task: TaskUpdate
) -> Optional[models.Task]:
    """Update a task by project ID and task number."""
    db_task = get_task_by_project_and_number(db, project_id, task_number)
    if db_task:
        # Handle agent update: if agent_name is provided, find agent ID and validate
        if task.agent_name is not None:
            from . import agents as crud_agents
            agent = crud_agents.get_agent_by_name(db, name=task.agent_name)
            if not agent:
                 raise ValueError(f"Agent with name '{task.agent_name}' not found.")
            db_task.agent_id = agent.id
        # If agent_id is provided directly in update, validate existence
        elif task.agent_id is not None:
             if not agent_exists(db, task.agent_id):
                  raise ValueError(f"Agent with ID {task.agent_id} not found.")
             db_task.agent_id = task.agent_id

        if task.title is not None:
            db_task.title = task.title
        if task.description is not None:
            db_task.description = task.description
        if task.status is not None:
            db_task.status = task.status if isinstance(task.status, models.TaskStatusEnum) else task.status
        if task.is_archived is not None:
            db_task.is_archived = task.is_archived

        db.commit()
        db.refresh(db_task)
    return db_task


def get_all_tasks(
    db: Session,
    project_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    agent_id: Optional[str] = None,
    agent_name: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[Union[str, TaskStatusEnum]] = None,
    is_archived: Optional[bool] = False,
    sort_by: Optional[str] = None,
    sort_direction: Optional[str] = None
) -> List[models.Task]:
    """Get tasks with optional filters and sorting."""
    query = db.query(models.Task)

    if project_id:
        query = query.filter(models.Task.project_id == project_id)

    if agent_id:
        query = query.filter(models.Task.agent_id == agent_id)

    if agent_name:
        # This would require joining with the agents table or looking up the agent ID first
        # For simplicity, let's assume for now that agent_id is preferred or name lookup is done before calling this.
        # If we need agent name filtering here, we'll need to add a join.
        pass # TODO: Implement agent_name filtering if needed

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Task.title.ilike(search_term),
                models.Task.description.ilike(search_term),
            )
        )

    if status:
        status_value = status.value if isinstance(status, TaskStatusEnum) else status
        query = query.filter(models.Task.status == status_value)

    if is_archived is not None:
        query = query.filter(models.Task.is_archived == is_archived)

    # Add sorting
    if sort_by:
        sort_column = getattr(models.Task, sort_by, None)
        if sort_column:
            if sort_direction == "desc":
                query = query.order_by(sort_column.desc())
            else:
                query = query.order_by(sort_column)
        # else: TODO: Handle invalid sort_by column?

    query = query.offset(skip).limit(limit)

    return query.all()

def archive_task(db: Session, project_id: str, task_number: int) -> Optional[models.Task]:
    """Archive a task by project ID and task number."""
    db_task = get_task_by_project_and_number(db, project_id, task_number)
    if db_task:
        db_task.is_archived = True
        db.commit()
        db.refresh(db_task)
    return db_task

def unarchive_task(db: Session, project_id: str, task_number: int) -> Optional[models.Task]:
    """Unarchive a task by project ID and task number."""
    db_task = get_task_by_project_and_number(db, project_id, task_number)
    if db_task:
        db_task.is_archived = False
        db.commit()
        db.refresh(db_task)
    return db_task
