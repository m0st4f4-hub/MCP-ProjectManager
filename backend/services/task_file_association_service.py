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

# Import validation helpers (if needed for service-specific checks, but aiming to push to CRUD)
# from backend.crud.task_file_association_validation import file_entity_exists, task_entity_exists


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
