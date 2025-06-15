"""CRUD operations for Project Templates."""

from sqlalchemy.orm import Session
from typing import List, Optional
from backend import models
from backend.schemas.project_template import (
    ProjectTemplateCreate,
    ProjectTemplateUpdate
)


def create_project_template(db: Session, template: ProjectTemplateCreate) -> models.ProjectTemplate:
    """Create a new project template."""
    db_template = models.ProjectTemplate(**template.model_dump())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


def get_project_template(db: Session, template_id: str) -> Optional[models.ProjectTemplate]:
    """Retrieve a single project template by ID."""
    return db.query(models.ProjectTemplate).filter(models.ProjectTemplate.id == template_id).first()


def get_project_template_by_name(db: Session, name: str) -> Optional[models.ProjectTemplate]:
    """Retrieve a single project template by name."""
    return db.query(models.ProjectTemplate).filter(models.ProjectTemplate.name == name).first()


def get_project_templates(db: Session, skip: int = 0, limit: int = 100) -> List[models.ProjectTemplate]:
    """Retrieve multiple project templates."""
    return db.query(models.ProjectTemplate).offset(skip).limit(limit).all()


def update_project_template(db: Session, template_id: str, template_update: ProjectTemplateUpdate) -> Optional[models.ProjectTemplate]:
    """Update a project template by ID."""
    db_template = get_project_template(db, template_id)
    if db_template:
        update_data = template_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_template, key, value)
            db.commit()
            db.refresh(db_template)
            return db_template


def delete_project_template(db: Session, template_id: str) -> bool:
            """Delete a project template by ID."""
            db_template = get_project_template(db, template_id)
            if db_template:
                db.delete(db_template)
                db.commit()
                return True
            return False
