from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from typing import List, Optional
import uuid


class CommentService:
    def __init__(self, db: Session):
        self.db = db

    def get_comment(self, comment_id: str, db: Session) -> Optional[models.Comment]:
        return self.db.query(models.Comment).filter(models.Comment.id == comment_id).first()

    def get_comments_by_task(self, task_project_id: uuid.UUID, task_number: int, skip: int = 0, limit: int = 100) -> List[models.Comment]:
        # Eagerly load author (User)
        return (
            self.db.query(models.Comment)
            .options(joinedload(models.Comment.author))
            .filter(models.Comment.task_project_id == str(task_project_id), models.Comment.task_number == task_number)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create_comment(self, comment_create: schemas.CommentCreate, author_id: str) -> models.Comment:
        db_comment = models.Comment(
            id=str(uuid.uuid4()),
            task_project_id=str(comment_create.task_project_id),
            task_number=comment_create.task_number,
            author_id=author_id,
            content=comment_create.content
        )
        self.db.add(db_comment)
        self.db.commit()
        self.db.refresh(db_comment)
        # Refresh author relationship
        self.db.refresh(db_comment, attribute_names=['author'])
        return db_comment

    def update_comment(self, comment_id: str, comment_update: schemas.CommentUpdate) -> Optional[models.Comment]:
        db_comment = self.get_comment(comment_id)
        if db_comment:
            update_data = comment_update.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_comment, key, value)
            self.db.commit()
            self.db.refresh(db_comment)
            # Refresh author relationship
            self.db.refresh(db_comment, attribute_names=['author'])
            return db_comment
        return None

    def delete_comment(self, comment_id: str) -> bool:
        db_comment = self.get_comment(comment_id)
        if db_comment:
            self.db.delete(db_comment)
            self.db.commit()
            return True
        return False
