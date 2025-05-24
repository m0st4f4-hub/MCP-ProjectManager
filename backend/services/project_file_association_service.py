from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from typing import List, Optional
from backend.crud.project_file_associations import (
    get_project_file_association,
    get_project_files,
    create_project_file_association,
    delete_project_file_association
)


class ProjectFileAssociationService:
    def __init__(self, db: Session):
        self.db = db

    def get_association(self, project_id: str, file_memory_entity_id: int):
        return get_project_file_association(self.db, project_id, file_memory_entity_id)

    def get_files_for_project(self, project_id: str, skip: int = 0, limit: int = 100):
        return get_project_files(self.db, project_id, skip=skip, limit=limit)

    def associate_file_with_project(self, project_id: str, file_memory_entity_id: int):
        from backend.schemas import ProjectFileAssociationCreate
        project_file = ProjectFileAssociationCreate(
            project_id=project_id,
            file_memory_entity_id=file_memory_entity_id
        )
        return create_project_file_association(self.db, project_file)

    def disassociate_file_from_project(self, project_id: str, file_memory_entity_id: int):
        return delete_project_file_association(self.db, project_id, file_memory_entity_id)
