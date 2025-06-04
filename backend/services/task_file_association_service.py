from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from typing import List, Optional
from uuid import UUID
# Import CRUD operations
from backend.crud.task_file_associations import (
    get_task_file_association,
    get_files_for_task,
    create_task_file_association,
    delete_task_file_association
)
# Import schema for TaskFileAssociationCreate
from ..schemas.file_association import TaskFileAssociationCreate


class TaskFileAssociationService:
    def __init__(self, db: Session):
        self.db = db

    def get_association(self, task_project_id: str, task_task_number: int, file_memory_entity_id: int) -> Optional[models.TaskFileAssociation]:
        # Delegate to CRUD
        return get_task_file_association(self.db, task_project_id, task_task_number, file_memory_entity_id)

    def get_files_for_task(self, task_project_id: str, task_task_number: int) -> List[models.TaskFileAssociation]:
        """
        Retrieve files associated with a task. Delegate to CRUD.
        """
        return get_files_for_task(self.db, task_project_id, task_task_number)

    def associate_file_with_task(self, task_project_id: str, task_task_number: int, file_memory_entity_id: int) -> Optional[models.TaskFileAssociation]:
        # Service layer should primarily orchestrate and call CRUD.
        # Validation for entity existence should ideally happen before this service call,
        # or be handled within the CRUD create function (which it now is for association existence).
        # Create schema and delegate to CRUD create function
        task_file_create_schema = schemas.TaskFileAssociationCreate(
            task_project_id=task_project_id,
            task_task_number=task_task_number,
            file_memory_entity_id=file_memory_entity_id
        )
        return create_task_file_association(self.db, task_file_create_schema)

    def disassociate_file_from_task(self, task_project_id: str, task_task_number: int, file_memory_entity_id: int) -> bool:
        # Delegate to CRUD delete function
        return delete_task_file_association(self.db, task_project_id, task_task_number, file_memory_entity_id)

    def associate_multiple_files_with_task(
        self,
        task_project_id: str,
        task_task_number: int,
        file_memory_entity_ids: List[int]
    ) -> List[models.TaskFileAssociation]:
        """Associate multiple files with a task."""
        created_associations = []
        for file_memory_entity_id in file_memory_entity_ids:
            # Check if association already exists to avoid duplicates
            existing_association = self.get_association(task_project_id, task_task_number, file_memory_entity_id)
            if not existing_association:
                association_schema = TaskFileAssociationCreate(
                    task_project_id=task_project_id,
                    task_task_number=task_task_number,
                    file_memory_entity_id=file_memory_entity_id
                )
                db_association = create_task_file_association(self.db, association_schema)
                created_associations.append(db_association)
        return created_associations
