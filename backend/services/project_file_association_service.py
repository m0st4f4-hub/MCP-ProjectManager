from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from backend import models, schemas
from backend.crud.project_file_associations import (
    create_project_file_association,
    get_project_file_association,
    get_project_file_associations_by_project,
    delete_project_file_association
)
from backend.schemas.project import ProjectFileAssociationCreate
from .exceptions import EntityNotFoundError

class ProjectFileAssociationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_association(self, project_id: str, file_memory_entity_id: int):
        return await get_project_file_association(self.db, project_id, file_memory_entity_id)

    async def get_files_for_project(
        self, project_id: str, skip: int = 0, limit: Optional[int] = 100
    ):
        return await get_project_file_associations_by_project(self.db, project_id, skip=skip, limit=limit)

    async def get_project_files(
        self, project_id: str, skip: int = 0, limit: Optional[int] = 100
    ):
        """Async wrapper for get_files_for_project with pagination."""
        return await self.get_files_for_project(project_id, skip=skip, limit=limit)

    async def associate_file_with_project(self, project_id: str, file_memory_entity_id: int):
        project_file = schemas.project.ProjectFileAssociationCreate(
            project_id=project_id,
            file_memory_entity_id=file_memory_entity_id
        )
        return await create_project_file_association(self.db, project_file)

    async def disassociate_file_from_project(self, project_id: str, file_memory_entity_id: int):
        return await delete_project_file_association(self.db, project_id, file_memory_entity_id)

    async def associate_multiple_files_with_project(
        self,
        project_id: str,
        file_memory_entity_ids: List[int]
    ) -> List[models.ProjectFileAssociation]:
        """Associate multiple files with a project."""
        created_associations = []
        for file_memory_entity_id in file_memory_entity_ids:  # Check if association already exists to avoid duplicates
            existing_association = await self.get_association(project_id, file_memory_entity_id)
            if not existing_association:
                association_schema = schemas.project.ProjectFileAssociationCreate(
                    project_id=project_id,
                    file_memory_entity_id=file_memory_entity_id
                )
                db_association = await create_project_file_association(self.db, association_schema)
                created_associations.append(db_association)
        return created_associations
