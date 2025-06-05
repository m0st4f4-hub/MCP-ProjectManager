from sqlalchemy.orm import Session, joinedload
from .. import models
from typing import List, Optional, Union
import uuid
# Import specific schema classes from their files
from ..schemas.comment import CommentCreate, CommentUpdate
# Import CRUD operations
from backend.crud.comments import (
    get_comment,
    get_comments_by_task,
    create_comment,
    update_comment,
    delete_comment
)


class CommentService:
    def __init__(self, db: Session):
        self.db = db

    def get_comment(self, comment_id: str) -> Optional[models.Comment]:
        """Fetch a single comment.

        :param comment_id: Identifier of the comment
        :returns: The ``Comment`` object or ``None``
        """
        return get_comment(self.db, comment_id)

    def get_comments_by_task(self, task_project_id: Union[str, uuid.UUID], task_number: int) -> List[models.Comment]:
        """Return comments for a specific task.

        :param task_project_id: Project ID of the task
        :param task_number: Task number
        :returns: List of associated ``Comment`` objects
        """
        return get_comments_by_task(self.db, task_project_id, task_number)

    def create_comment(self, comment_create: CommentCreate) -> models.Comment:
        """Create a new comment.

        :param comment_create: Comment data
        :returns: The created ``Comment``
        """
        return create_comment(self.db, comment_create)

    def update_comment(self, comment_id: str, comment_update: CommentUpdate) -> Optional[models.Comment]:
        """Update an existing comment.

        :param comment_id: Identifier of the comment
        :param comment_update: Fields to update
        :returns: The updated ``Comment`` or ``None``
        """
        return update_comment(self.db, comment_id, comment_update)

    def delete_comment(self, comment_id: str) -> bool:
        """Remove a comment.

        :param comment_id: Identifier of the comment
        :returns: ``True`` if deleted
        """
        return delete_comment(self.db, comment_id)
