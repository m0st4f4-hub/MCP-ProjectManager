# Task ID: <taskId>  # Agent Role: ImplementationSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import or_, func
from .. import models
from typing import List, Optional
import uuid
from sqlalchemy.exc import IntegrityError
from sqlalchemy.future import select  # Import specific schema classes from their files
from ..schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectMemberCreate,
    ProjectFileAssociationCreate,
    Project  # Import schema for ProjectTemplate
)
from ..schemas.project_template import ProjectTemplate  # Import task and project member schemas for template population
from ..schemas.task import TaskCreate
from ..schemas.project import ProjectMemberCreate  # Import CRUD operations
from backend.crud.projects import (
    get_project,
    get_project_by_name,
    get_projects,
    create_project,
    update_project,
    delete_project,
    add_project_member,
    remove_project_member,
    get_project_members,
    get_tasks_by_project
)  # Import file association CRUD from the correct module
from backend.crud.project_file_associations import (
    associate_file_with_project,
    disassociate_file_from_project,
    get_project_files,
    get_project_file_association
)  # Import Project Templates
from backend.crud import project_templates as project_template_crud  # Import Task CRUD to create tasks from template
from backend.crud import tasks as tasks_crud  # Import Project Member CRUD to add members from template
from backend.crud import project_members as project_members_crud  # Import service utilities
from .utils import service_transaction
from .exceptions import (
    EntityNotFoundError,
    DuplicateEntityError,
    ValidationError  # Import service utilities
)
from .utils import service_transaction
from .exceptions import EntityNotFoundError, DuplicateEntityError, ValidationError


class ProjectService:
    def __init__(self, db: Session):
        self.db = db
    
        # Convert to async method and use await
    async def get_project(
        self, project_id: str, is_archived: Optional[bool] = False
        ) -> models.Project:
        """
        Retrieve a project by ID.

        Args:
            project_id: The project ID
            is_archived: Filter by archived status

        Returns:
            The project object

        Raises:
        EntityNotFoundError: If the project is not found
        """
        # Await the async CRUD call
        project = await get_project(self.db, project_id, is_archived)
        if not project:
            raise EntityNotFoundError("Project", project_id)
        return project  # Convert to async method and use await
    async def get_project_by_name(
        self, name: str, is_archived: Optional[bool] = False
        ) -> Optional[models.Project]:  # Delegate to CRUD and await
        return await get_project_by_name(self.db, name, is_archived)  # Convert to async method and use await
    async def get_projects(
        self,
        skip: int = 0,
        limit: Optional[int] = 100,
        search: Optional[str] = None,
        status: Optional[str] = None,
        is_archived: Optional[bool] = False,
    ) -> List[models.Project]:
        """Retrieve projects with optional pagination and filters."""
        return await get_projects(
            self.db,
            skip=skip,
            limit=limit,
            search=search,
            status=status,
            is_archived=is_archived,
        )
    async def create_project(
        self, project: ProjectCreate, created_by_user_id: Optional[str] = None
        ) -> models.Project:
        """
        Create a new project, optionally using a template.
        """  # Check if project name already exists (await the async method)
        existing_project = await self.get_project_by_name(project.name, is_archived=None)
        if existing_project:
            raise DuplicateEntityError("Project", project.name)

        template_data = None
        if project.template_id:  
            # Fetch the template data (await the async CRUD call)
            template = await project_template_crud.get_project_template(
                self.db, project.template_id
            )
            if not template:
                raise EntityNotFoundError("ProjectTemplate", project.template_id)
            template_data = template.template_data
        
        # Use transaction context manager
        async with service_transaction(self.db, "create_project") as tx_db:
            # Create the basic project first (await the async CRUD call)
            db_project = await create_project(tx_db, project, created_by=created_by_user_id)
            
            # If template data exists, use it to populate the project
            if template_data:
                try:
                    # Example: Create default tasks from template_data
                    default_tasks = template_data.get("default_tasks", [])
                    for task_data in default_tasks:
                        # Assuming task_data is compatible with TaskCreate schema structure
                        task_create_schema = TaskCreate(**task_data)
                        # Await the async CRUD call
                        await tasks_crud.create_task(
                            tx_db, project_id=db_project.id, task=task_create_schema
                        )  # Example: Add default members from template_data
                    default_members = template_data.get("default_members", [])
                    for member_data in default_members:
                        member_create_schema = ProjectMemberCreate(
                            **member_data, project_id=db_project.id
                        )  # Await the async CRUD call
                        await project_members_crud.add_project_member(tx_db, member_create_schema)  # Add created_by_user to members if not already included
                    if created_by_user_id and default_members:
                        user_is_member = any(m.get("user_id") == created_by_user_id for m in default_members)
                        if not user_is_member:
                            owner_member = ProjectMemberCreate(
                                project_id=db_project.id,
                                user_id=created_by_user_id,
                                role="owner"
                            )  # Await the async CRUD call
                            await project_members_crud.add_project_member(tx_db, owner_member)
                except Exception as e:  # Convert any internal exceptions to service exceptions
                    if isinstance(e, (EntityNotFoundError, DuplicateEntityError, ValidationError)):
                        raise
                    raise ValidationError(f"Error creating project from template: {str(e)}")  # Use selectinload to eagerly load necessary relationships including nested ones  # We need project_members and the user associated with each project member  # Query using the transaction session (tx_db)
            stmt = select(models.Project).where(models.Project.id == db_project.id).options(
                selectinload(models.Project.project_members).selectinload(models.ProjectMember.user),
                selectinload(models.Project.tasks)  # Also load tasks
            )
            result = await tx_db.execute(stmt)
            db_project_loaded = result.scalar_one_or_none()

            if db_project_loaded is None:  # This should not happen if create_project succeeded, but handle defensively
                raise EntityNotFoundError("Project", db_project.id)  # Manually extract data into a dictionary to ensure no session access after return
            project_data = {
                "id": str(db_project_loaded.id),  # Ensure UUID is string
                "name": db_project_loaded.name,
                "description": db_project_loaded.description,
                "is_archived": db_project_loaded.is_archived,
                "created_at": db_project_loaded.created_at,
                "updated_at": db_project_loaded.updated_at,
                "task_count": db_project_loaded.task_count,  # Should be loaded integer  # Manually extract project_members and their users
                "project_members": [
                    {
                        "id": str(member.id),  # Assuming ProjectMember has an ID
                        "project_id": str(member.project_id),
                        "user_id": str(member.user_id),
                        "role": member.role,
                        "created_at": member.created_at,
                        "updated_at": member.updated_at,
                        "user": {  # Extract user details needed by ProjectMember schema
                            "id": str(member.user.id),  # Assuming User has an ID
                            "username": member.user.username,
                            "email": member.user.email,  # Include email as it's in User schema
                            "full_name": member.user.full_name,
                            "disabled": member.user.disabled,  # Do NOT include User relationships here unless explicitly needed and loaded
                        } if member.user else None,  # Do NOT include Project relationship here (circular)
                    } for member in db_project_loaded.project_members
                ],  # Project schema does NOT include tasks list, only task_count.  # So, no need to extract tasks list here.
            }  # Create the Pydantic model from the dictionary
            project_pydantic = Project(**project_data)  # Return the Pydantic model after the transaction ends
            return project_pydantic  # Convert to async method and use await
    async def update_project(
        self, project_id: str, project_update: ProjectUpdate
        ) -> models.Project:
        """
        Update a project by ID.

        Args:
        project_id: The project ID
        project_update: The update data

        Returns:
        The updated project

        Raises:
        EntityNotFoundError: If the project is not found
        DuplicateEntityError: If the new name already exists
        ValidationError: If the update data is invalid
        """  # Check if project exists (await the async method)
        existing_project = await self.get_project(project_id, is_archived=None)
        if not existing_project:
            raise EntityNotFoundError("Project", project_id)  # Check for name conflict if name is being changed (await the async method)
        if project_update.name and project_update.name != existing_project.name:
            name_conflict = await self.get_project_by_name(project_update.name, is_archived=None)
            if name_conflict:
                raise DuplicateEntityError("Project", project_update.name)  # Use transaction context manager (assuming it handles async)
        async with service_transaction(self.db, "update_project") as tx_db:
            try:  # Await the async CRUD call
                updated_project = await update_project(tx_db, project_id, project_update)
                if not updated_project:  # This case should ideally be caught by the initial get_project check,  # but keep for safety
                    raise EntityNotFoundError("Project", project_id)  # Refresh the updated project (await the refresh)
                await tx_db.refresh(updated_project)
                return updated_project
            except ValueError as e:  # Convert ValueError to ValidationError
                raise ValidationError(str(e))
            except Exception as e:  # Convert any other exceptions to service exceptions
                if isinstance(e, (EntityNotFoundError, DuplicateEntityError, ValidationError)):
                    raise
                raise ValidationError(f"Error updating project: {str(e)}")  # Convert to async method and use await
    async def delete_project(self, project_id: str) -> models.Project:
        """
        Delete a project by ID.

        Args:
        project_id: The project ID

        Returns:
        The deleted project

        Raises:
        EntityNotFoundError: If the project is not found
        """  # Check if project exists (await the async method)
        existing_project = await self.get_project(project_id, is_archived=None)
        if not existing_project:
            raise EntityNotFoundError("Project", project_id)  # Use transaction context manager (assuming it handles async)
        async with service_transaction(self.db, "delete_project") as tx_db:
            # Await the async CRUD call
            deleted_project = await delete_project(tx_db, project_id)
            if not deleted_project:
                # This case should ideally be caught by the initial get_project check,
                # but keep for safety
                raise EntityNotFoundError("Project", project_id)
            return deleted_project  # Convert to async method and use await
    async def add_member_to_project(
        self, project_id: str, user_id: str, role: str
        ) -> Optional[models.ProjectMember]:  # Delegate to CRUD and await  # Create the schema object here or expect it as input if service is higher level
        project_member_schema = ProjectMemberCreate(project_id=project_id, user_id=user_id, role=role)
        return await add_project_member(self.db, project_member_schema)  # Convert to async method and use await
    async def remove_member_from_project(
        self, project_id: str, user_id: str
        ) -> bool:  # Delegate to CRUD and await
        return await remove_project_member(self.db, project_id, user_id)  # Convert to async method and use await
    async def get_project_members(self, project_id: str) -> List[models.ProjectMember]:  # Delegate to CRUD and await
        return await get_project_members(self.db, project_id)  # Convert to async method and use await
    async def associate_file_with_project(
        self, project_id: str, file_memory_entity_id: int
        ) -> Optional[models.ProjectFileAssociation]:  # Delegate to CRUD in project_file_associations and await
        return await associate_file_with_project(self.db, project_id, file_memory_entity_id)  # Convert to async method and use await
    async def disassociate_file_from_project(
        self, project_id: str, file_memory_entity_id: int
        ) -> bool:  # Delegate to CRUD in project_file_associations and await
        return await disassociate_file_from_project(self.db, project_id, file_memory_entity_id)  # Convert to async method and use await
    async def get_project_files(self, project_id: str) -> List[models.ProjectFileAssociation]:  # Delegate to CRUD in project_file_associations and await
        return await get_project_files(self.db, project_id)  # Convert to async method and use await
    async def get_project_file_association(self, project_id: str, file_memory_entity_id: int) -> Optional[models.ProjectFileAssociation]:  # Delegate to CRUD in project_file_associations and await
        return await get_project_file_association(self.db, project_id, file_memory_entity_id)  # Convert to async method and use await
    async def get_tasks_by_project(self, project_id: str, search: Optional[str] = None, status: Optional[str] = None, is_archived: Optional[bool] = False) -> List[models.Task]:  # Delegate to CRUD and await
        return await get_tasks_by_project(self.db, project_id, search, status, is_archived)
