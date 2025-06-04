from sqlalchemy.orm import Session, joinedload
from .. import models
from backend.schemas.comment import CommentCreate, CommentUpdate
from typing import List, Optional
import uuid
import json  # Import json for details field handling  # Import async equivalents and necessary functions
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.future import select as async_select  # Use async_select for clarity
from sqlalchemy.orm import joinedload as async_joinedload  # Use async_joinedload for clarity  # Import the memory crud operations
from . import (
    memory as memory_crud  # Keep for now, might need async conversion later
)
# Import validation helpers
# Assume these are now async based on previous checks in task_validation.py
from .comment_validation import (
    task_exists,
    project_exists,
    author_exists  # Function to get a single comment by ID  # Convert to async function and use AsyncSession
)


async def get_comment(db: AsyncSession, comment_id: str) -> Optional[models.Comment]:
    """Retrieve a single comment by its ID."""  # Use async execute with select
    result = await db.execute(select(models.Comment).filter(models.Comment.id == comment_id))  # Use .scalar_one_or_none() for a single result
    return result.scalar_one_or_none()  # Function to get comments by task  # Convert to async function and use AsyncSession


async def get_comments_by_task(
db: AsyncSession,
task_project_id: uuid.UUID,
task_task_number: int,
skip: int = 0,
limit: int = 100
) -> List[models.Comment]:
    """Retrieve multiple comments for a specific task with pagination."""  # Eagerly load author (User)  # Use async execute with select, options, filter, order_by, offset, and limit
    result = await db.execute(
    select(models.Comment)
    .options(async_joinedload(models.Comment.author))
    .filter(models.Comment.task_project_id == str(task_project_id), models.Comment.task_task_number == task_task_number)
    .offset(skip)
    .limit(limit)
    )  # Use .scalars().all() for multiple results
    return result.scalars().all()  # Function to create a new comment  # Convert to async function and use AsyncSession


async def create_comment(db: AsyncSession, comment_create: CommentCreate) -> models.Comment:
    """Create a new comment entry."""  # Validate existence of associated entities
    if comment_create.task_project_id and comment_create.task_task_number is not None:  # Await the async validation function calls
        if not await task_exists(db, comment_create.task_project_id, comment_create.task_task_number):
            raise ValueError(f"Task {comment_create.task_project_id}/{comment_create.task_task_number} not found.")
    elif comment_create.project_id:  # Await the async validation function calls
        if not await project_exists(db, comment_create.project_id):
            raise ValueError(f"Project {comment_create.project_id} not found.")
    else:  # Comment must be associated with either a task or a project
        raise ValueError("Comment must be associated with a task or a project.")  # Await the async validation function call
    if not await author_exists(db, comment_create.author_id):
        raise ValueError(f"Author with ID {comment_create.author_id} not found.")

    db_comment_entry = models.Comment(
    id=str(uuid.uuid4()),
    task_project_id=str(comment_create.task_project_id) if comment_create.task_project_id else None,
    task_task_number=comment_create.task_task_number if comment_create.task_task_number is not None else None,
    project_id=str(comment_create.project_id) if comment_create.project_id else None,
    author_id=comment_create.author_id,
    content=comment_create.content
    )
    db.add(db_comment_entry)  # Await commit and refresh
    await db.commit()
    await db.refresh(db_comment_entry)  # Refresh author relationship (Await the async refresh)
    await db.refresh(db_comment_entry, attribute_names=['author'])
    return db_comment_entry  # Function to update a comment by ID  # Convert to async function and use AsyncSession


async def update_comment(db: AsyncSession, comment_id: str, comment_update: CommentUpdate) -> Optional[models.Comment]:
    """Update a comment by ID."""  # Await the async function call
    db_comment = await get_comment(db, comment_id)
    if db_comment:
        update_data = comment_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_comment, key, value)  # Await commit and refresh
            await db.commit()
            await db.refresh(db_comment)  # Refresh author relationship (Await the async refresh)
            await db.refresh(db_comment, attribute_names=['author'])
            return db_comment
        return None  # Function to delete a comment by ID  # Convert to async function and use AsyncSession
async def delete_comment(db: AsyncSession, comment_id: str) -> bool:
        """Delete a comment by ID."""  # Await the async function call
        db_comment = await get_comment(db, comment_id)
        if db_comment:  # Await the async delete operation
            await db.delete(db_comment)  # Await commit
            await db.commit()
            return True
        return False
