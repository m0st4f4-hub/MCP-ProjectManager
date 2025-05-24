from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from typing import List, Optional
from uuid import UUID


class TaskFileAssociationService:
    def __init__(self, db: Session):
        self.db = db

    def get_association(self, task_project_id: str, task_task_number: int, file_memory_entity_name: str) -> Optional[models.TaskFileAssociation]:
        return self.db.query(models.TaskFileAssociation).filter(
            models.TaskFileAssociation.task_project_id == task_project_id,
            models.TaskFileAssociation.task_task_number == task_task_number,
            models.TaskFileAssociation.file_memory_entity_name == file_memory_entity_name
        ).first()

    def get_files_for_task(self, task_project_id: str, task_task_number: int, skip: int = 0, limit: int = 100) -> List[models.TaskFileAssociation]:
        return (
            self.db.query(models.TaskFileAssociation)
            .filter(models.TaskFileAssociation.task_project_id == task_project_id, models.TaskFileAssociation.task_task_number == task_task_number)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def associate_file_with_task(self, task_project_id: str, task_task_number: int, file_memory_entity_name: str) -> Optional[models.TaskFileAssociation]:
        existing_association = self.get_association(
            task_project_id, task_task_number, file_memory_entity_name)
        if existing_association:
            return existing_association
        db_association = models.TaskFileAssociation(
            task_project_id=task_project_id, task_task_number=task_task_number, file_memory_entity_name=file_memory_entity_name)
        self.db.add(db_association)
        self.db.commit()
        self.db.refresh(db_association)
        return db_association

    def disassociate_file_from_task(self, task_project_id: str, task_task_number: int, file_memory_entity_name: str) -> bool:
        db_association = self.get_association(
            task_project_id, task_task_number, file_memory_entity_name)
        if db_association:
            self.db.delete(db_association)
            self.db.commit()
            return True
        return False
