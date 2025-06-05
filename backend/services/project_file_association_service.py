from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from typing import List, Optional
from backend.crud.project_file_associations import (
    get_project_file_association,
    get_project_files,
    create_project_file_association,
    delete_project_file_association
)
from ..schemas.project import ProjectFileAssociationCreate


class ProjectFileAssociationService:
    def __init__(self, db: Session):
        self.db = db

    def get_association(self, project_id: str, file_memory_entity_id: int):
        """Retrieve a single project-file association."""
        return get_project_file_association(self.db, project_id, file_memory_entity_id)

    def get_files_for_project(self, project_id: str, skip: int = 0, limit: int = 100):
        """List files linked to a project."""
        return get_project_files(self.db, project_id, skip=skip, limit=limit)

    async def get_project_files(self, project_id: str):
        """Async wrapper for :meth:`get_files_for_project`."""
        return self.get_files_for_project(project_id)

    def associate_file_with_project(self, project_id: str, file_memory_entity_id: int):
        """Create an association between a project and a file."""
        project_file = ProjectFileAssociationCreate(
            project_id=project_id,
            file_memory_entity_id=file_memory_entity_id
        )
        return create_project_file_association(self.db, project_file)

    def disassociate_file_from_project(self, project_id: str, file_memory_entity_id: int):
        """Remove a file association from a project."""
        return delete_project_file_association(self.db, project_id, file_memory_entity_id)

    def associate_multiple_files_with_project(
        self,
        project_id: str,
        file_memory_entity_ids: List[int]
    ) -> List[models.ProjectFileAssociation]:
        """Associate several files with a project.

        :param project_id: Target project ID
        :param file_memory_entity_ids: List of file entity identifiers
        :returns: List of created ``ProjectFileAssociation`` records
        """
        created_associations = []
        for file_memory_entity_id in file_memory_entity_ids:  # Check if association already exists to avoid duplicates
            existing_association = self.get_association(project_id, file_memory_entity_id)
            if not existing_association:
                association_schema = ProjectFileAssociationCreate(
                    project_id=project_id,
                    file_memory_entity_id=file_memory_entity_id
                )
                db_association = create_project_file_association(self.db, association_schema)
                created_associations.append(db_association)
        return created_associations
