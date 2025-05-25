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

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


async def get_project(db: AsyncSession, project_id: str, is_archived: Optional[bool] = False):
    stmt = select(models.Project).filter(models.Project.id == project_id)
    if is_archived is not None:
        stmt = stmt.filter(models.Project.is_archived == is_archived)
    result = await db.execute(stmt)
    project = result.scalars().first()
    if project:
        # Calculate total task count (only non-archived tasks for an active project view)
        task_query = select(func.count()).filter(
            models.Task.project_id == project_id)
        task_count_result = await db.execute(task_query)
        project.task_count = task_count_result.scalar() or 0
    return project


async def get_project_by_name(db: AsyncSession, name: str, is_archived: Optional[bool] = False):
    stmt = select(models.Project).filter(models.Project.name == name)
    if is_archived is not None:
        stmt = stmt.filter(models.Project.is_archived == is_archived)
    result = await db.execute(stmt)
    project = result.scalars().first()
    if project:
        # Calculate total task count (only non-archived tasks for an active project view)
        task_query = select(func.count()).filter(
            models.Task.project_id == project.id)
        task_count_result = await db.execute(task_query)
        project.task_count = task_count_result.scalar() or 0
    return project


async def get_projects(db: AsyncSession, skip: int = 0, search: Optional[str] = None, status: Optional[str] = None, is_archived: Optional[bool] = False):
    stmt = select(models.Project)
    if search:
        search_term = f"%{search}%"
        stmt = stmt.filter(
            or_(
                models.Project.name.ilike(search_term),
                models.Project.description.ilike(search_term)
            )
        )
    # Status filtering logic would go here if Project model had a status field
    # if status:
    #     stmt = stmt.filter(models.Project.status == status) # Example

    if is_archived is not None:
        stmt = stmt.filter(models.Project.is_archived == is_archived)

    # Apply offset and order_by
    stmt = stmt.order_by(models.Project.name).offset(skip)
    
    result = await db.execute(stmt)
    projects = result.scalars().all()

    # Calculate task counts for each project asynchronously
    for project_item in projects:
        task_query = select(func.count()).filter(
            models.Task.project_id == project_item.id)
        task_count_result = await db.execute(task_query)
        project_item.task_count = task_count_result.scalar() or 0

    return projects


async def create_project(db: AsyncSession, project: ProjectCreate):
    # Use the imported ProjectCreate directly

    # Check if a project with the same name already exists (await the async function)
    existing_project = await get_project_by_name(db, project.name)
    if existing_project:
        raise ValueError(f"Project with name '{project.name}' already exists")

    db_project = ProjectModel(id=str(uuid.uuid4()), name=project.name, description=project.description)
    db.add(db_project)
    await db.commit() # Await commit
    await db.refresh(db_project) # Await refresh

    # Create a corresponding MemoryEntity for the project (assuming memory_crud is async)
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
    # Assuming create_memory_entity is async
    await memory_crud.create_memory_entity(db=db, entity=memory_entity_data)

    return db_project


async def update_project(db: AsyncSession, project_id: str, project_update: ProjectUpdate):
    # Await get_project
    db_project = await get_project(db, project_id, is_archived=None)
    if db_project:
        update_data = project_update.model_dump(exclude_unset=True)
        # Use the validation helper to check for duplicate project name (await the async function)
        if "name" in update_data and update_data["name"] != db_project.name:
            if await project_name_exists(db, name=update_data["name"], exclude_project_id=project_id):
                raise ValueError(
                    f"Project name '{update_data["name"]}' already exists")

        # Update the project in the database
        for key, value in update_data.items():
            setattr(db_project, key, value)
        await db.commit() # Await commit
        await db.refresh(db_project) # Await refresh

        # Update the corresponding MemoryEntity (assuming memory_crud is async)
        # Await get_entity_by_name
        memory_entity = await memory_crud.get_entity_by_name(db, name=db_project.name)
        if memory_entity:
            # Only update description for now, can expand later
            memory_update_data = MemoryEntityUpdate(description=db_project.description)
            # Assuming update_memory_entity is async
            await memory_crud.update_memory_entity(db, entity_id=memory_entity.id, entity_update=memory_update_data)

    return db_project


async def delete_project(db: AsyncSession, project_id: str):
    # Await get_project
    db_project = await get_project(db, project_id, is_archived=None)
    if db_project:
        # Print number of tasks deleted (for test expectations) - Convert to async count
        task_count_stmt = select(func.count()).filter(
            models.Task.project_id == project_id)
        task_count_result = await db.execute(task_count_stmt)
        task_count = task_count_result.scalar() or 0

        print(
            f"[CRUD delete_project] Deleted {task_count} tasks associated with project_id: {project_id}")
        
        # Assuming Project schema validation works with async model
        project_data_to_return = Project.model_validate(db_project)

        # Get the corresponding MemoryEntity by name before deleting the project (await the async function)
        memory_entity = await memory_crud.get_entity_by_name(db, name=db_project.name)

        # Delete the project from the database
        await db.delete(db_project) # Await delete
        await db.commit() # Await commit

        # Delete the corresponding MemoryEntity and its relations/observations (assuming memory_crud is async)
        if memory_entity:
            await memory_crud.delete_memory_entity(db, entity_id=memory_entity.id)

        return project_data_to_return
    return None


async def add_project_member(db: AsyncSession, project_member: ProjectMemberCreate):
    """Add a member to a project."""
    db_project_member = models.ProjectMember(**project_member.model_dump())
    db.add(db_project_member)
    await db.commit() # Await commit
    await db.refresh(db_project_member) # Await refresh
    return db_project_member


async def remove_project_member(
    db: AsyncSession, project_id: str, user_id: str
):
    stmt = select(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == user_id,
    )
    result = await db.execute(stmt)
    db_project_member = result.scalars().first()
    
    if db_project_member:
        await db.delete(db_project_member) # Await delete
        await db.commit() # Await commit
        return True
    return False


async def get_project_members(db: AsyncSession, project_id: str):
    stmt = select(models.ProjectMember).filter(models.ProjectMember.project_id == project_id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_tasks_by_project(
    db: AsyncSession, project_id: str, search: Optional[str] = None, status: Optional[str] = None, is_archived: Optional[bool] = False
):
    stmt = select(models.Task).filter(models.Task.project_id == project_id)

    if search:
        search_term = f"%{search}%"
        stmt = stmt.filter(
            or_(
                models.Task.title.ilike(search_term),
                models.Task.description.ilike(search_term),
            )
        )
    if status:
        stmt = stmt.filter(models.Task.status == status) # Assuming Task model has a status field

    if is_archived is not None:
         stmt = stmt.filter(models.Task.is_archived == is_archived)

    result = await db.execute(stmt)
    return result.scalars().all()
