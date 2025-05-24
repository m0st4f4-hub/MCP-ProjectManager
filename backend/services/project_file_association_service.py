from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from typing import List, Optional


class ProjectFileAssociationService:
    def __init__(self, db: Session):
        self.db = db

    def get_association(self, project_id: str, file_memory_entity_name: str) -> Optional[models.ProjectFileAssociation]:
        return self.db.query(models.ProjectFileAssociation).filter(
            models.ProjectFileAssociation.project_id == project_id,
            models.ProjectFileAssociation.file_memory_entity_name == file_memory_entity_name
        ).first()

    def get_files_for_project(self, project_id: str, skip: int = 0, limit: int = 100) -> List[models.ProjectFileAssociation]:
        return (
            self.db.query(models.ProjectFileAssociation)
            .filter(models.ProjectFileAssociation.project_id == project_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def associate_file_with_project(self, project_id: str, file_memory_entity_name: str) -> Optional[models.ProjectFileAssociation]:
        existing_association = self.get_association(project_id, file_memory_entity_name)
        if existing_association:
            return existing_association
        db_association = models.ProjectFileAssociation(
            project_id=project_id, file_memory_entity_name=file_memory_entity_name)
        self.db.add(db_association)
        self.db.commit()
        self.db.refresh(db_association)
        return db_association

    def disassociate_file_from_project(self, project_id: str, file_memory_entity_name: str) -> bool:
        db_association = self.get_association(project_id, file_memory_entity_name)
        if db_association:
            self.db.delete(db_association)
            self.db.commit()
            return True
        return False
