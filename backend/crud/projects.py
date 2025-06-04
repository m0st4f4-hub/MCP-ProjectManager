from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_, func, select, delete
from backend import models
from backend import schemas
from backend.schemas import Project
from backend.models.project import Project as ProjectModel
from backend.models.task import Task
import uuid
from typing import Optional
from .project_validation import project_name_exists
import logging
from sqlalchemy.orm import joinedload
from datetime import datetime, timezone

# Uncomment MemoryEntity related imports
from backend.schemas.memory import MemoryEntityCreate, MemoryEntityUpdate
from backend.crud import memory as memory_crud


logger = logging.getLogger(__name__)


async def get_project(db: AsyncSession, project_id: str,
                        is_archived: Optional[bool] = False):
    stmt = select(ProjectModel).filter(ProjectModel.id == project_id)
    if is_archived is not None:
        stmt = stmt.filter(ProjectModel.is_archived == is_archived)
    # Add joinedload for tasks to calculate count more efficiently
    stmt = stmt.options(joinedload(ProjectModel.tasks))

    result = await db.execute(stmt)
    project = result.scalars().first()

    if project:
        # Calculate task count from the loaded tasks
        # Filter for non-archived tasks if the project itself is not archived
        # (assuming this is the display rule)
        project.task_count = (
            sum(1 for task in project.tasks if not task.is_archived)
            if project.tasks else 0
        )
        project.completed_task_count = (
            sum(1 for task in project.tasks if task.status == "completed" and not task.is_archived)
            if project.tasks else 0
        )
        # This approach loads all tasks, which might be inefficient for
        # projects with many tasks. A better approach is to use a scalar
        # subquery for the count within the initial query. However, this
        # requires more significant changes to the query structure. For now,
        # let's keep the joinedload and calculate in Python, and note that
        # a scalar subquery would be a performance optimization for very
        # large numbers of tasks per project.
        # If we were to use a scalar subquery for count:
        # task_count_subquery = select(func.count(Task.id)).where(
        #     Task.project_id == ProjectModel.id).label("task_count")
        # stmt = select(ProjectModel, task_count_subquery).filter(...)
        # stmt = stmt.select_from(ProjectModel)
        # result = await db.execute(stmt)
        # for project_row in result:
        #     project_obj, task_count = project_row
        #     project_obj.task_count = task_count
        #     projects.append(project_obj)
        # Assuming project_obj is the ProjectModel instance

    return project


async def get_project_by_name(db: AsyncSession, name: str,
                              is_archived: Optional[bool] = False):
    stmt = select(ProjectModel).filter(ProjectModel.name == name)
    if is_archived is not None:
        stmt = stmt.filter(ProjectModel.is_archived == is_archived)
    
    # Add joinedload for tasks to calculate count more efficiently
    stmt = stmt.options(joinedload(ProjectModel.tasks))

    result = await db.execute(stmt)
    # Debug logging to inspect the result and scalars()
    logger.debug(
        " [projects.py > get_project_by_name] Executed query."
        f" Result type: {type(result)}, result: {result!r}"
    )

    scalars_result = result.scalars()
    logger.debug(
        " [projects.py > get_project_by_name] Called scalars()."
        f" Scalars result type: {type(scalars_result)}, scalars_result: {scalars_result!r}"
    )

    if scalars_result is None:
        logger.error(
            " [projects.py > get_project_by_name] scalars_result is"
            " unexpectedly None!"
        )
        return None  # Or raise an appropriate error if None is not expected

    try:
        project = scalars_result.first()
    except TypeError as e:
        logger.error(
            " [projects.py > get_project_by_name] TypeError when"
            f" awaiting scalars_result.first(): {e!r}"
        )
        logger.error(
            " [projects.py > get_project_by_name] Type of"
            f" scalars_result was: {type(scalars_result)}"
        )  # Re-raise the exception after logging
        raise e

    logger.debug(
        " [projects.py > get_project_by_name] Called first()."
        f" Project result type: {type(project)}, project: {project!r}"
    )

    if project:
        # Calculate task count from the loaded tasks
        # Filter for non-archived tasks if the project itself is
        # not archived (assuming this is the display rule)
        project.task_count = (
            sum(1 for task in project.tasks if not task.is_archived)
            if project.tasks else 0
        )
        project.completed_task_count = (
            sum(1 for task in project.tasks if task.status == "completed" and not task.is_archived)
            if project.tasks else 0
        )

    return project

async def get_project_by_name_async(db: AsyncSession, name: str,
                                    is_archived: Optional[bool] = False):
                        """Asynchronous version of get_project_by_name."""
                        stmt = select(ProjectModel).filter(ProjectModel.name == name)
                        if is_archived is not None:
                            stmt = stmt.filter(ProjectModel.is_archived == is_archived)
                            # Add joinedload for tasks to calculate count more efficiently
                            stmt = stmt.options(joinedload(ProjectModel.tasks))

                            result = await db.execute(stmt)
                            project = result.scalars().first()
                            if project:
                                # Calculate total task count (only non-archived tasks
                                # for an active project view)
                                # Filter for non-archived tasks if the project itself is
                                # not archived (assuming this is the display rule)
                                project.task_count = (
                                    sum(1 for task in project.tasks
                                        if not task.is_archived)
                                    if project.tasks else 0
                                )
                                project.completed_task_count = (
                                    sum(1 for task in project.tasks if task.status == "completed" and not task.is_archived)
                                    if project.tasks else 0
                                )
                                return project


async def get_projects(db: AsyncSession, skip: int = 0,
                        search: Optional[str] = None, status: Optional[str] = None,
                        is_archived: Optional[bool] = False):
    stmt = select(ProjectModel)
    
    if search:
        search_term = f"%{search}%"
        stmt = stmt.filter(
            or_(
                ProjectModel.name.ilike(search_term),
                ProjectModel.description.ilike(search_term),
            )
        )
    
    # Status filtering logic would go here if Project model
    # had a status field
    # if status:
    #     stmt = stmt.filter(ProjectModel.status == status)
    
    if is_archived is not None:
        stmt = stmt.filter(ProjectModel.is_archived == is_archived)
    
    # Add joinedload for tasks to calculate count more efficiently
    stmt = stmt.options(joinedload(ProjectModel.tasks))
    # Apply offset and order_by
    stmt = stmt.order_by(ProjectModel.name).offset(skip)

    result = await db.execute(stmt)
    print(
        " [projects.py > get_projects] Type of result"
        f" before scalars().all(): {type(result)}, result: {result!r}"
    )
    projects = result.scalars().unique().all()
    print(
        " [projects.py > get_projects] Type of projects"
        f" after scalars().all(): {type(projects)}, projects: {projects!r}"
    )
    
    # Calculate task counts for each project from the loaded tasks
    for project_item in projects:
        # Filter for non-archived tasks if the project
        # itself is not archived (assuming this is the display rule)
        project_item.task_count = (
            sum(1 for task in project_item.tasks
                if not task.is_archived)
            if project_item.tasks else 0
        )
        project_item.completed_task_count = (
            sum(1 for task in project_item.tasks if task.status == "completed" and not task.is_archived)
            if project_item.tasks else 0
        )

    return projects


async def create_project(db: AsyncSession, project: schemas.ProjectCreate, created_by: Optional[str] = None):
                                            # Use the imported ProjectCreate directly
                                            # Check if a project with the same name already
                                            # exists (await the async function)
                                            existing_project = await get_project_by_name(db, project.name)
                                            if existing_project:
                                                raise ValueError(
                                                    f"Project with name '{project.name}'"
                                                    " already exists"
                                                )

                                            db_project = ProjectModel(
                                                id=str(uuid.uuid4()),
                                                name=project.name,
                                                description=project.description,
                                                created_by=created_by)
                                            db.add(db_project)
                                            await db.commit()
                                            await db.refresh(db_project)

                                            # Uncomment MemoryEntity creation
                                            memory_entity_data = MemoryEntityCreate(
                                                type="project",
                                                name=db_project.name,
                                                description=db_project.description,
                                                metadata_={
                                                    "project_id": db_project.id,
                                                    "created_at":
                                                        db_project.created_at.isoformat()
                                                },
                                                entity_type="project"
                                            )
                                            await memory_crud.create_memory_entity(
                                                db=db,
                                                entity=memory_entity_data)

                                            return db_project


async def update_project(db: AsyncSession, project_id: str,
                          project_update: schemas.ProjectUpdate):
    db_project = await get_project(db, project_id, is_archived=None)
    if db_project:
        update_data = project_update.model_dump(exclude_unset=True)
        
        # Use the validation helper to check for duplicate project name (await the async function)
        if ("name" in update_data and update_data["name"] != db_project.name):
            if await project_name_exists(
                db,
                name=update_data["name"],
                exclude_project_id=project_id
            ):
                raise ValueError(
                    f"Project name '{update_data['name']}' already exists")
        
        # Update the project in the database
        for key, value in update_data.items():
            setattr(db_project, key, value)
        db_project.updated_at = datetime.now(timezone.utc)  # Ensure timezone-aware datetime
        await db.commit()
        await db.refresh(db_project)

        # Update MemoryEntity
        memory_entity = await memory_crud.get_entity_by_name(
            db, name=db_project.name)
        if memory_entity:
            memory_update_data = MemoryEntityUpdate(
                description=db_project.description)
            await memory_crud.update_memory_entity(
                db,
                entity_id=memory_entity.id,
                entity_update=memory_update_data)

        return db_project
    return None


async def delete_project(db: AsyncSession, project_id: str):
    db_project = await get_project(db, project_id, is_archived=None)
    if db_project:
        # Print number of tasks deleted (for test expectations)
        # - Convert to async count
        task_count_stmt = select(func.count()).filter(
            Task.project_id == project_id)
        task_count_result = await db.execute(task_count_stmt)
        task_count = task_count_result.scalar() or 0

        # Actually delete the associated tasks first
        if task_count > 0:
            delete_tasks_stmt = delete(Task).filter(Task.project_id == project_id)
            await db.execute(delete_tasks_stmt)

        print(
            "[CRUD delete_project] Deleted"
            f" {task_count} tasks associated with project_id: {project_id}"
        )
        # Assuming Project schema validation works with async model
        project_data_to_return = Project.model_validate(db_project)
        # Get the corresponding MemoryEntity by name before deleting the project
        memory_entity = await memory_crud.get_entity_by_name(
            db, name=db_project.name)
        # Delete the project from the database
        await db.delete(db_project)
        await db.commit()
        # await db.refresh(db_project)
        # Attempt to refresh the deleted object to ensure session is updated

        # Delete MemoryEntity if it exists
        if memory_entity:
            await memory_crud.delete_memory_entity(
                db, entity_id=memory_entity.id)

        return project_data_to_return
    return None


async def add_project_member(db: AsyncSession, project_member: schemas.ProjectMemberCreate):
                                                        """Add a member to a project."""
                                                        db_project_member = models.ProjectMember(**project_member.model_dump())
                                                        db.add(db_project_member)
                                                        await db.commit()
                                                        await db.refresh(db_project_member)
                                                        return db_project_member


async def remove_project_member(
                                                    db: AsyncSession, project_id: str, user_id: str
                                                    ):
                                                        stmt = select(models.ProjectMember).filter(
                                                            models.ProjectMember.project_id == project_id,
                                                            models.ProjectMember.user_id == user_id,
                                                        )
                                                        result = await db.execute(stmt)
                                                        db_project_member = await result.scalars().first()

                                                        if db_project_member:
                                                            await db.delete(db_project_member)
                                                            await db.commit()
                                                            return True
                                                        return False


async def get_project_members(db: AsyncSession, project_id: str):
                                                        stmt = select(models.ProjectMember).filter(models.ProjectMember.project_id == project_id)
                                                        result = await db.execute(stmt)
                                                        return await result.scalars().all()


async def get_tasks_by_project(
                                                    db: AsyncSession, project_id: str,
                                                    search: Optional[str] = None,
                                                    status: Optional[str] = None,
                                                    is_archived: Optional[bool] = False
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
                                                            stmt = stmt.filter(models.Task.status == status)
                                                            # Assuming Task model has a status field

                                                        if is_archived is not None:
                                                            stmt = stmt.filter(models.Task.is_archived == is_archived)

                                                        result = await db.execute(stmt)
                                                        return await result.scalars().all()
