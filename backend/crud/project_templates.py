"""CRUD operations for Project Templates."""

from sqlalchemy.orm import Session
from typing import List, Optional

from backend.models.project_template import ProjectTemplate as ProjectTemplateModel
from backend.schemas.project_template import (
    ProjectTemplateCreate,
    ProjectTemplateUpdate
)


def create_project_template(db: Session, template: ProjectTemplateCreate) -> ProjectTemplateModel:
    """Create a new project template."""
    db_template = ProjectTemplateModel(
    name=template.name,
    description=template.description,
    template_data=template.template_data
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


def get_project_template(db: Session, template_id: str) -> Optional[ProjectTemplateModel]:
    """Retrieve a single project template by ID."""
    return db.query(ProjectTemplateModel).filter(ProjectTemplateModel.id == template_id).first()


def get_project_template_by_name(db: Session, name: str) -> Optional[ProjectTemplateModel]:
    """Retrieve a single project template by name."""
    return db.query(ProjectTemplateModel).filter(ProjectTemplateModel.name == name).first()


def get_project_templates(db: Session, skip: int = 0, limit: int = 100) -> List[ProjectTemplateModel]:
    """Retrieve multiple project templates."""
    return db.query(ProjectTemplateModel).offset(skip).limit(limit).all()


def update_project_template(db: Session, template_id: str, template_update: ProjectTemplateUpdate) -> Optional[ProjectTemplateModel]:
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
