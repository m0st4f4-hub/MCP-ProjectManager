from sqlalchemy.orm import Session, joinedload
# from .. import models, schemas
from .. import models
from typing import List, Optional, Union
import uuid

# Import specific schema classes from their files
from backend.schemas.comment import CommentCreate, CommentUpdate

# Import CRUD operations
from backend.crud.comments import (
    get_comment,
    get_comments_by_task,
    create_comment,
    update_comment,
    delete_comment
)

# No longer need to import validation helpers in service; CRUD handles it
# from backend.crud.comment_validation import some_validation_function


class CommentService:
    def __init__(self, db: Session):
        self.db = db

    def get_comment(self, comment_id: str) -> Optional[models.Comment]:
        # Delegate to CRUD
        return get_comment(self.db, comment_id)

    def get_comments_by_task(self, task_project_id: Union[str, uuid.UUID], task_number: int) -> List[models.Comment]:
        """
        Retrieve comments for a task. Delegate to CRUD.
        """
        return get_comments_by_task(self.db, task_project_id, task_number)

    def create_comment(self, comment_create: CommentCreate) -> models.Comment:
        # Service layer orchestrates data preparation and calls CRUD.
        # Validation is now handled in the CRUD layer.

        # The schema should be fully prepared *before* calling the service function.
        # The service now just passes the schema to CRUD.

        # Delegate to CRUD create function
        return create_comment(self.db, comment_create)

    def update_comment(self, comment_id: str, comment_update: CommentUpdate) -> Optional[models.Comment]:
        # Delegate to CRUD update function
        return update_comment(self.db, comment_id, comment_update)

    def delete_comment(self, comment_id: str) -> bool:
        # Delegate to CRUD delete function
        return delete_comment(self.db, comment_id)
