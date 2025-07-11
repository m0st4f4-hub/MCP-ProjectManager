from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from .. import models  # from .. import models, schemas  # Removed schema import
from schemas.task import TaskCreate, TaskUpdate
from typing import List, Optional, Union
from enums import TaskStatusEnum
from sqlalchemy.ext.asyncio import AsyncSession  # Import AsyncSession  # Import validation helpers
from .task_validation import (
    project_exists,
    agent_exists  # Import select for async queries
)
from sqlalchemy import select


async def create_task(db: AsyncSession, project_id: str, task: TaskCreate, agent_id: Optional[str] = None) -> models.Task:
    """Create a new task for a given project.

    Includes pessimistic locking to prevent race conditions during task number assignment.
    """  # Validate that the project exists
    if not await project_exists(db, project_id):
        raise ValueError(f"Project with ID {project_id} not found.")  # Get the next task number for this project, with pessimistic lock  # Lock the rows for the specific project to prevent other concurrent transactions  # from querying the max task number before this transaction commits.  # Use async SQLAlchemy syntax with select and await db.execute
    max_task_number_result = await db.execute(
    select(func.max(models.Task.task_number))
    .filter(models.Task.project_id == project_id)
    .with_for_update()
    )
    max_task_number = max_task_number_result.scalar_one_or_none()

    next_task_number = (max_task_number or 0) + 1
    
    # If agent_name is provided in the task schema, get the agent by name and validate existence
    agent_id_to_assign = agent_id  # Start with passed agent_id
    if hasattr(task, 'agent_name') and task.agent_name:
        from . import agents as crud_agents
        agent = await crud_agents.get_agent_by_name(db, name=task.agent_name)
        if not agent:
            raise ValueError(f"Agent with name '{task.agent_name}' not found.")
        agent_id_to_assign = agent.id  # Use agent ID found by name
    
    # If agent_id is provided (either initially or found by name), validate existence
    if agent_id_to_assign and not await agent_exists(db, agent_id_to_assign):
        raise ValueError(f"Agent with ID {agent_id_to_assign} not found.")

    db_task = models.Task(
        project_id=project_id,
        task_number=next_task_number,
        title=task.title,
        description=task.description,
        status=task.status if isinstance(task.status, TaskStatusEnum) else task.status,
        agent_id=agent_id_to_assign,
        assigned_to=task.assigned_to,
        start_date=task.start_date,
        due_date=task.due_date
        # is_archived defaults to False in model, don't need to set explicitly
    )
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    return db_task


async def get_task(db: AsyncSession, project_id: str, task_number: int) -> Optional[models.Task]:
    """Get a single task by project ID and task number."""
    # Use async SQLAlchemy syntax with select and await db.execute
    # Use the existing get_task_by_project_and_number function
    return await get_task_by_project_and_number(db, project_id, task_number)


async def get_tasks(db: AsyncSession, project_id: str, skip: int = 0, limit: int = 100) -> List[models.Task]:
    """Get multiple tasks for a project."""
    # Use async SQLAlchemy syntax with select and await db.execute
    from sqlalchemy import select
    result = await db.execute(select(models.Task).filter(
        models.Task.project_id == project_id
    ).offset(skip).limit(limit))
    return result.scalars().all()


async def get_task_by_project_and_number(db: AsyncSession, project_id: str, task_number: int) -> Optional[models.Task]:
    """Get a single task by project ID and task number."""
    # Use async SQLAlchemy syntax with select and await db.execute
    from sqlalchemy import select
    result = await db.execute(select(models.Task).filter(
        and_(
            models.Task.project_id == project_id,
            models.Task.task_number == task_number
        )
    ))
    return result.scalar_one_or_none()


async def update_task(db: AsyncSession, project_id: str, task_number: int, task: TaskUpdate) -> Optional[models.Task]:
    """Update a task by project ID and task number."""
    db_task = await get_task_by_project_and_number(db, project_id, task_number)
    if db_task:
        # If agent_id is provided directly in update, validate existence
        if task.agent_id is not None:
            if not await agent_exists(db, task.agent_id):
                raise ValueError(f"Agent with ID {task.agent_id} not found.")
            db_task.agent_id = task.agent_id

        if task.title is not None:
            db_task.title = task.title
        if task.description is not None:
            db_task.description = task.description
        if task.status is not None:
            db_task.status = task.status if isinstance(task.status, TaskStatusEnum) else task.status
        if task.assigned_to is not None:
            db_task.assigned_to = task.assigned_to
        if task.start_date is not None:
            db_task.start_date = task.start_date
        if task.due_date is not None:
            db_task.due_date = task.due_date

        await db.commit()
        await db.refresh(db_task)
        return db_task
    return None


async def delete_task(db: AsyncSession, project_id: str, task_number: int) -> Optional[models.Task]:
    """Delete a task by project ID and task number."""
    db_task = await get_task_by_project_and_number(db, project_id, task_number)
    if db_task:
        await db.delete(db_task)
        await db.commit()
        return db_task
    return None


async def delete_task_by_project_and_number(db: AsyncSession, project_id: str, task_number: int) -> bool:
    """Delete a task by project ID and task number."""
    db_task = await get_task_by_project_and_number(db, project_id, task_number)
    if db_task:
        await db.delete(db_task)
        await db.commit()
        return True
    return False


async def update_task_by_project_and_number(
    db: AsyncSession,
    project_id: str,
    task_number: int,
    task: TaskUpdate
) -> Optional[models.Task]:
    """Update a task by project ID and task number."""
    db_task = await get_task_by_project_and_number(db, project_id, task_number)
    if db_task:
        # Handle agent update: If agent_id is provided directly in update, validate existence
        if task.agent_id is not None:
            if not await agent_exists(db, task.agent_id):
                raise ValueError(f"Agent with ID {task.agent_id} not found.")
            db_task.agent_id = task.agent_id

        if task.title is not None:
            db_task.title = task.title
        if task.description is not None:
            db_task.description = task.description
        if task.status is not None:
            db_task.status = task.status if isinstance(task.status, TaskStatusEnum) else task.status
        if task.assigned_to is not None:
            db_task.assigned_to = task.assigned_to
        if task.start_date is not None:
            db_task.start_date = task.start_date
        if task.due_date is not None:
            db_task.due_date = task.due_date

        await db.commit()
        await db.refresh(db_task)
        return db_task


async def get_all_tasks(
    db: AsyncSession,
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
    from sqlalchemy import select, or_
    
    query = select(models.Task)
    
    # Apply filters
    if project_id:
        query = query.filter(models.Task.project_id == project_id)
    
    if agent_id:
        query = query.filter(models.Task.agent_id == agent_id)
    
    if agent_name:
        # Join with Agent table to filter by name
        query = query.join(models.Agent).filter(models.Agent.name == agent_name)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(or_(
            models.Task.title.ilike(search_term),
            models.Task.description.ilike(search_term),
        ))
    
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
        else:
            # Default sort by created_at descending if sort_by is invalid
            query = query.order_by(models.Task.created_at.desc())
    else:
        # Default sort by created_at descending if sort_by is not provided
        query = query.order_by(models.Task.created_at.desc())
    
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

async def archive_task(db: AsyncSession, project_id: str, task_number: int) -> Optional[models.Task]:
    """Archive a task by project ID and task number."""
    db_task = await get_task_by_project_and_number(db, project_id, task_number)
    if db_task:
        db_task.is_archived = True
        await db.commit()
        await db.refresh(db_task)
        return db_task

async def unarchive_task(db: AsyncSession, project_id: str, task_number: int) -> Optional[models.Task]:
    """Unarchive a task by project ID and task number."""
    db_task = await get_task_by_project_and_number(db, project_id, task_number)
    if db_task:
        db_task.is_archived = False
        await db.commit()
        await db.refresh(db_task)
        return db_task
