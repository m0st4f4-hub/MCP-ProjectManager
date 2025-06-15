"""
Simple CRUD operations for comments in single-user mode.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import uuid
from datetime import datetime

from backend.models.comment import Comment
from backend.schemas.comment import CommentCreate, CommentUpdate


async def get_comment(db: AsyncSession, comment_id: str) -> Optional[Comment]:
    """Get a comment by ID."""
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    return result.scalar_one_or_none()


async def get_comments_by_task(db: AsyncSession, task_project_id: str, task_number: int, skip: int = 0, limit: int = 100) -> List[Comment]:
    """Get comments for a specific task."""
    result = await db.execute(
        select(Comment)
        .where(Comment.task_project_id == task_project_id)
        .where(Comment.task_task_number == task_number)
        .offset(skip)
        .limit(limit)
        .order_by(Comment.created_at)
    )
    return list(result.scalars().all())


async def create_comment(db: AsyncSession, comment: CommentCreate, task_project_id: str, task_number: int) -> Comment:
    """Create a new comment."""
    db_comment = Comment(
        id=str(uuid.uuid4()),
        content=comment.content,
        task_project_id=task_project_id,
        task_task_number=task_number,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(db_comment)
    await db.commit()
    await db.refresh(db_comment)
    return db_comment


async def update_comment(db: AsyncSession, comment_id: str, comment_update: CommentUpdate) -> Optional[Comment]:
    """Update a comment."""
    db_comment = await get_comment(db, comment_id)
    if not db_comment:
        return None
    
    if comment_update.content is not None:
        db_comment.content = comment_update.content
    
    db_comment.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(db_comment)
    return db_comment


async def delete_comment(db: AsyncSession, comment_id: str) -> bool:
    """Delete a comment."""
    db_comment = await get_comment(db, comment_id)
    if not db_comment:
        return False
    
    await db.delete(db_comment)
    await db.commit()
    return True