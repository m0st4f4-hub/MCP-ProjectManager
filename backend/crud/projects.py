from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from backend import models, schemas
from backend.schemas.project import ProjectCreate, ProjectUpdate, Project, ProjectMemberCreate, ProjectFileAssociationCreate
from backend.schemas.memory import MemoryEntityCreate, MemoryEntityUpdate
from backend.models.project import Project as ProjectModel
from fastapi import HTTPException
import uuid
from typing import Optional, List

# from backend import schemas
# from backend.schemas.project_member import ProjectMemberCreate
# from backend.schemas.project_file_association import ProjectFileAssociationCreate

# Import the memory crud operations
from . import memory as memory_crud

# Import validation helpers
from .project_validation import project_name_exists


def get_project(db: Session, project_id: str, is_archived: Optional[bool] = False):
    query = db.query(models.Project).filter(models.Project.id == project_id)
    if is_archived is not None:
        query = query.filter(models.Project.is_archived == is_archived)
    project = query.first()
    if project:
        # Calculate total task count (only non-archived tasks for an active project view)
        task_query = db.query(func.count()).filter(
            models.Task.project_id == project_id)
        project.task_count = task_query.scalar() or 0
    return project


def get_project_by_name(db: Session, name: str, is_archived: Optional[bool] = False):
    query = db.query(models.Project).filter(models.Project.name == name)
    if is_archived is not None:
        query = query.filter(models.Project.is_archived == is_archived)
    project = query.first()
    if project:
        # Calculate total task count (only non-archived tasks for an active project view)
        task_query = db.query(func.count()).filter(
            models.Task.project_id == project.id)
        project.task_count = task_query.scalar() or 0
    return project


def get_projects(db: Session, skip: int = 0, search: Optional[str] = None, status: Optional[str] = None, is_archived: Optional[bool] = False):
    query = db.query(models.Project)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Project.name.ilike(search_term),
                models.Project.description.ilike(search_term)
            )
        )
    # Status filtering logic would go here if Project model had a status field
    # if status:
    #     query = query.filter(models.Project.status == status) # Example

    if is_archived is not None:
        query = query.filter(models.Project.is_archived == is_archived)

    projects = query.order_by(models.Project.name).offset(skip).all()

    # Calculate task counts for each project
    for project_item in projects:
        task_query = db.query(func.count()).filter(
            models.Task.project_id == project_item.id)
        project_item.task_count = task_query.scalar() or 0

    return projects


def create_project(db: Session, project: ProjectCreate):
    # Use the imported ProjectCreate directly

    # Check if a project with the same name already exists
    existing_project = get_project_by_name(db, project.name)
    if existing_project:
        raise ValueError(f"Project with name '{project.name}' already exists")

    db_project = ProjectModel(id=str(uuid.uuid4()), name=project.name, description=project.description)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    # Create a corresponding MemoryEntity for the project
    # from backend.schemas import MemoryEntityCreate # Removed import from __init__
    memory_entity_data = MemoryEntityCreate(
        type="project",
        name=db_project.name,
        description=db_project.description,
        metadata_={
            "project_id": db_project.id,
            "created_at": db_project.created_at.isoformat()
        },
        entity_type="project"
    )
    memory_crud.create_memory_entity(db=db, entity=memory_entity_data)

    return db_project


def update_project(db: Session, project_id: str, project_update: ProjectUpdate):
    db_project = get_project(db, project_id, is_archived=None)
    if db_project:
        update_data = project_update.model_dump(exclude_unset=True)
        # Use the validation helper to check for duplicate project name
        if "name" in update_data and update_data["name"] != db_project.name:
            if project_name_exists(db, name=update_data["name"], exclude_project_id=project_id):
                raise ValueError(
                    f"Project name '{update_data["name"]}' already exists")

        # Update the project in the database
        for key, value in update_data.items():
            setattr(db_project, key, value)
        db.commit()
        db.refresh(db_project)

        # Update the corresponding MemoryEntity
        memory_entity = memory_crud.get_entity_by_name(db, name=db_project.name)
        if memory_entity:
            # Only update description for now, can expand later
            memory_update_data = MemoryEntityUpdate(description=db_project.description)
            memory_crud.update_memory_entity(db, entity_id=memory_entity.id, entity_update=memory_update_data)

    return db_project


def delete_project(db: Session, project_id: str):
    db_project = get_project(db, project_id, is_archived=None)
    if db_project:
        # Print number of tasks deleted (for test expectations)
        task_count = db.query(models.Task).filter(
            models.Task.project_id == project_id).count()
        print(
            f"[CRUD delete_project] Deleted {task_count} tasks associated with project_id: {project_id}")
        project_data_to_return = Project.model_validate(db_project)

        # Get the corresponding MemoryEntity by name before deleting the project
        memory_entity = memory_crud.get_entity_by_name(db, name=db_project.name)

        # Delete the project from the database
        db.delete(db_project)
        db.commit()

        # Delete the corresponding MemoryEntity and its relations/observations
        if memory_entity:
            memory_crud.delete_memory_entity(db, entity_id=memory_entity.id)

        return project_data_to_return
    return None


def add_project_member(db: Session, project_member: ProjectMemberCreate):
    """Add a member to a project."""
    db_project_member = models.ProjectMember(**project_member.model_dump())
    db.add(db_project_member)
    db.commit()
    db.refresh(db_project_member)
    return db_project_member


def remove_project_member(
    db: Session, project_id: str, user_id: str
):
    db_project_member = (
        db.query(models.ProjectMember)
        .filter(
            models.ProjectMember.project_id == project_id,
            models.ProjectMember.user_id == user_id,
        )
        .first()
    )
    if db_project_member:
        db.delete(db_project_member)
        db.commit()
        return True
    return False


def get_project_members(db: Session, project_id: str):
    return (
        db.query(models.ProjectMember)
        .filter(models.ProjectMember.project_id == project_id)
        .all()
    )


def get_tasks_by_project(
    db: Session, project_id: str, search: Optional[str] = None, status: Optional[str] = None, is_archived: Optional[bool] = False
):
    query = db.query(models.Task).filter(models.Task.project_id == project_id)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Task.title.ilike(search_term),
                models.Task.description.ilike(search_term),
            )
        )
    if status:
        query = query.filter(models.Task.status == status) # Assuming Task model has a status field

    if is_archived is not None:
         query = query.filter(models.Task.is_archived == is_archived)

    return query.all()
