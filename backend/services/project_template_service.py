"""
Project template service for managing project templates.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from models.project_template import ProjectTemplate
from schemas.project_template import ProjectTemplateCreate, ProjectTemplateUpdate
from crud import project_templates as project_template_crud
from .exceptions import EntityNotFoundError, ValidationError


class ProjectTemplateService:

    def __init__(self, db: AsyncSession):
        self.db = db

    def create_template(self, template: ProjectTemplateCreate) -> ProjectTemplate:
        """Create a new project template."""
        return project_template_crud.create_project_template(self.db, template)

    def get_template(self, template_id: str) -> Optional[ProjectTemplate]:
        """Retrieve a single project template by ID."""
        return project_template_crud.get_project_template(self.db, template_id)

    def get_template_by_name(self, name: str) -> Optional[ProjectTemplate]:
        """Retrieve a single project template by name."""
        return project_template_crud.get_project_template_by_name(self.db, name)

    def get_templates(
        self, skip: int = 0, limit: int = 100
    ) -> List[ProjectTemplate]:
        """Retrieve multiple project templates."""
        return project_template_crud.get_project_templates(
            self.db, skip, limit
        )

    def update_template(
        self, template_id: str, template_update: ProjectTemplateUpdate
    ) -> Optional[ProjectTemplate]:
        """Update a project template by ID."""
        return project_template_crud.update_project_template(
            self.db, template_id, template_update
        )

    def delete_template(self, template_id: str) -> bool:
        """Delete a project template by ID."""
        return project_template_crud.delete_project_template(self.db, template_id)
