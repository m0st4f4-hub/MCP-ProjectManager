from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from typing import List, Optional
import uuid

# Import the memory crud operations
from . import memory as memory_crud
# Import validation helpers
from .comment_validation import task_exists, project_exists, author_exists

# Function to get a single comment by ID
def get_comment(db: Session, comment_id: str) -> Optional[models.Comment]:
    return db.query(models.Comment).filter(models.Comment.id == comment_id).first()

# Function to get comments by task
def get_comments_by_task(
    db: Session,
    task_project_id: uuid.UUID,
    task_number: int,
    skip: int = 0,
    limit: int = 100
) -> List[models.Comment]:
    # Eagerly load author (User)
    return (
        db.query(models.Comment)
        .options(joinedload(models.Comment.author))
        .filter(models.Comment.task_project_id == str(task_project_id), models.Comment.task_task_number == task_number)
        .offset(skip)
        .limit(limit)
        .all()
    )

# Function to create a new comment
def create_comment(db: Session, comment_create: schemas.CommentCreate) -> models.Comment:
    # Validate existence of associated entities
    if comment_create.task_project_id and comment_create.task_task_number is not None:
        if not task_exists(db, comment_create.task_project_id, comment_create.task_task_number):
            raise ValueError(f"Task {comment_create.task_project_id}/{comment_create.task_task_number} not found.")
    elif comment_create.project_id:
         if not project_exists(db, comment_create.project_id):
              raise ValueError(f"Project {comment_create.project_id} not found.")
    else:
         # Comment must be associated with either a task or a project
         raise ValueError("Comment must be associated with a task or a project.")

    if not author_exists(db, comment_create.author_id):
        raise ValueError(f"Author with ID {comment_create.author_id} not found.")

    db_comment_entry = models.Comment(
        id=str(uuid.uuid4()),
        task_project_id=str(comment_create.task_project_id) if comment_create.task_project_id else None,
        task_task_number=comment_create.task_task_number if comment_create.task_task_number is not None else None,
        project_id=str(comment_create.project_id) if comment_create.project_id else None,
        author_id=comment_create.author_id,
        content=comment_create.content
    )
    db.add(db_comment_entry)
    db.commit()
    db.refresh(db_comment_entry)
    # Refresh author relationship
    db.refresh(db_comment_entry, attribute_names=['author'])
    return db_comment_entry

# Function to update a comment by ID
def update_comment(db: Session, comment_id: str, comment_update: schemas.CommentUpdate) -> Optional[models.Comment]:
    db_comment = get_comment(db, comment_id)
    if db_comment:
        update_data = comment_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_comment, key, value)
        db.commit()
        db.refresh(db_comment)
        # Refresh author relationship
        db.refresh(db_comment, attribute_names=['author'])
        return db_comment
    return None

# Function to delete a comment by ID
def delete_comment(db: Session, comment_id: str) -> bool:
    db_comment = get_comment(db, comment_id)
    if db_comment:
        db.delete(db_comment)
        db.commit()
        return True
    return False
