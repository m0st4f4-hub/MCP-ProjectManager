"""
Project template service for managing project templates.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from backend import models
from backend.schemas.project_template import ProjectTemplateCreate, ProjectTemplateUpdate
from backend.crud.project_templates import (
    create_project_template,
    get_project_template,
    get_project_template_by_name,
    get_project_templates,
    update_project_template,
    delete_project_template,
)
from .exceptions import EntityNotFoundError, ValidationError


class ProjectTemplateService:

    def __init__(self, db: AsyncSession):
        self.db = db

    def create_template(self, template: ProjectTemplateCreate) -> models.ProjectTemplate:
        """Create a new project template."""
        return create_project_template(self.db, template)

    def get_template(self, template_id: str) -> Optional[models.ProjectTemplate]:
        """Retrieve a single project template by ID."""
        return get_project_template(self.db, template_id)

    def get_template_by_name(self, name: str) -> Optional[models.ProjectTemplate]:
        """Retrieve a single project template by name."""
        return get_project_template_by_name(self.db, name)

    def get_templates(
        self, skip: int = 0, limit: int = 100
    ) -> List[models.ProjectTemplate]:
        """Retrieve multiple project templates."""
        return get_project_templates(
            self.db, skip, limit
        )

    def update_template(
        self, template_id: str, template_update: ProjectTemplateUpdate
    ) -> Optional[models.ProjectTemplate]:
        """Update a project template by ID."""
        return update_project_template(
            self.db, template_id, template_update
        )

    def delete_template(self, template_id: str) -> bool:
        """Delete a project template by ID."""
        return delete_project_template(self.db, template_id)
