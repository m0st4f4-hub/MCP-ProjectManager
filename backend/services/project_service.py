# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from .. import models
from typing import List, Optional
import uuid

# Import specific schema classes from their files
from backend.schemas.project import ProjectCreate, ProjectUpdate, ProjectMemberCreate, ProjectFileAssociationCreate
# Import schema for ProjectTemplate
from backend.schemas.project_template import ProjectTemplate
# Import task and project member schemas for template population
from backend.schemas import task as task_schemas
from backend.schemas import project as project_schemas

# Import CRUD operations
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
)
# Import file association CRUD from the correct module
from backend.crud.project_file_associations import (
    associate_file_with_project,
    disassociate_file_from_project,
    get_files_for_project,
    get_project_file_association
)

# Import Project Templates
from backend.crud import project_templates as project_template_crud
# Import Task CRUD to create tasks from template
from backend.crud import tasks as tasks_crud
# Import Project Member CRUD to add members from template
from backend.crud import project_members as project_members_crud

# Import service utilities
from backend.services.utils import service_transaction
from backend.services.exceptions import EntityNotFoundError, DuplicateEntityError, ValidationError

# Import service utilities
from backend.services.utils import service_transaction
from backend.services.exceptions import EntityNotFoundError, DuplicateEntityError, ValidationError


class ProjectService:
    def __init__(self, db: Session):
        self.db = db

    def get_project(
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
        project = get_project(self.db, project_id, is_archived)
        if not project:
            raise EntityNotFoundError("Project", project_id)
        return project

    def get_project_by_name(
        self, name: str, is_archived: Optional[bool] = False
    ) -> Optional[models.Project]:
        # Delegate to CRUD
        return get_project_by_name(self.db, name, is_archived)

    def get_projects(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        status: Optional[str] = None,
        is_archived: Optional[bool] = False
    ) -> List[models.Project]:
        # Delegate to CRUD
        return get_projects(self.db, skip, search, status, is_archived)

    def create_project(
        self, project: ProjectCreate, created_by_user_id: Optional[str] = None
    ) -> models.Project:
        """Create a new project, optionally using a template."""
        
        # Check if project name already exists
        existing_project = self.get_project_by_name(project.name, is_archived=None)
        if existing_project:
            raise DuplicateEntityError("Project", project.name)
        
        template_data = None
        if project.template_id:
            # Fetch the template data
            template = project_template_crud.get_project_template(
                self.db, project.template_id
            )
            if not template:
                raise EntityNotFoundError("ProjectTemplate", project.template_id)
            template_data = template.template_data

        # Use transaction context manager
        with service_transaction(self.db, "create_project") as tx_db:
            # Create the basic project first
            db_project = create_project(tx_db, project)

            # If template data exists, use it to populate the project
            if template_data:
                try:
                    # Example: Create default tasks from template_data
                    default_tasks = template_data.get("default_tasks", [])
                    for task_data in default_tasks:
                        # Assuming task_data is compatible with TaskCreate schema structure
                        task_create_schema = task_schemas.TaskCreate(**task_data)
                        tasks_crud.create_task(
                            tx_db, project_id=db_project.id, task=task_create_schema
                        )
                    
                    # Example: Add default members from template_data
                    default_members = template_data.get("default_members", [])
                    for member_data in default_members:
                        member_create_schema = project_schemas.ProjectMemberCreate(
                            **member_data, project_id=db_project.id
                        )
                        project_members_crud.add_project_member(tx_db, member_create_schema)
                    
                    # Add created_by_user to members if not already included
                    if created_by_user_id and default_members:
                        user_is_member = any(m.get("user_id") == created_by_user_id for m in default_members)
                        if not user_is_member:
                            owner_member = project_schemas.ProjectMemberCreate(
                                project_id=db_project.id,
                                user_id=created_by_user_id,
                                role="owner"
                            )
                            project_members_crud.add_project_member(tx_db, owner_member)
                except Exception as e:
                    # Convert any internal exceptions to service exceptions
                    if isinstance(e, (EntityNotFoundError, DuplicateEntityError, ValidationError)):
                        raise
                    raise ValidationError(f"Error creating project from template: {str(e)}")

            # Refresh the project to load the new tasks and members
            tx_db.refresh(db_project)
            
            return db_project

    def update_project(
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
        """
        # Check if project exists
        existing_project = get_project(self.db, project_id, is_archived=None)
        if not existing_project:
            raise EntityNotFoundError("Project", project_id)
            
        # Check for name conflict if name is being changed
        if project_update.name and project_update.name != existing_project.name:
            name_conflict = get_project_by_name(self.db, project_update.name, is_archived=None)
            if name_conflict:
                raise DuplicateEntityError("Project", project_update.name)
        
        # Use transaction context manager
        with service_transaction(self.db, "update_project") as tx_db:
            try:
                updated_project = update_project(tx_db, project_id, project_update)
                if not updated_project:
                    raise EntityNotFoundError("Project", project_id)
                return updated_project
            except ValueError as e:
                # Convert ValueError to ValidationError
                raise ValidationError(str(e))
            except Exception as e:
                # Convert any other exceptions to service exceptions
                if isinstance(e, (EntityNotFoundError, DuplicateEntityError, ValidationError)):
                    raise
                raise ValidationError(f"Error updating project: {str(e)}")

    def delete_project(self, project_id: str) -> models.Project:
        """
        Delete a project by ID.
        
        Args:
            project_id: The project ID
            
        Returns:
            The deleted project
            
        Raises:
            EntityNotFoundError: If the project is not found
        """
        # Check if project exists
        existing_project = get_project(self.db, project_id, is_archived=None)
        if not existing_project:
            raise EntityNotFoundError("Project", project_id)
        
        # Use transaction context manager
        with service_transaction(self.db, "delete_project") as tx_db:
            deleted_project = delete_project(tx_db, project_id)
            if not deleted_project:
                raise EntityNotFoundError("Project", project_id)
            return deleted_project

    def add_member_to_project(
        self, project_id: str, user_id: str, role: str
    ) -> Optional[models.ProjectMember]:
        # Delegate to CRUD
        # Create the schema object here or expect it as input if service is higher level
        project_member_schema = ProjectMemberCreate(project_id=project_id, user_id=user_id, role=role)
        return add_project_member(self.db, project_member_schema)

    def remove_member_from_project(
        self, project_id: str, user_id: str
    ) -> bool:
        # Delegate to CRUD
        return remove_project_member(self.db, project_id, user_id)

    def get_project_members(self, project_id: str) -> List[models.ProjectMember]:
        # Delegate to CRUD
        return get_project_members(self.db, project_id)

    def associate_file_with_project(
        self, project_id: str, file_memory_entity_id: int
    ) -> Optional[models.ProjectFileAssociation]:
        # Delegate to CRUD in project_file_associations
        return associate_file_with_project(self.db, project_id, file_memory_entity_id)

    def disassociate_file_from_project(
        self, project_id: str, file_memory_entity_id: int
    ) -> bool:
        # Delegate to CRUD in project_file_associations
        return disassociate_file_from_project(self.db, project_id, file_memory_entity_id)

    def get_project_files(self, project_id: str) -> List[models.ProjectFileAssociation]:
        # Delegate to CRUD in project_file_associations
        return get_files_for_project(self.db, project_id)

    def get_project_file_association(self, project_id: str, file_memory_entity_id: int) -> Optional[models.ProjectFileAssociation]:
        # Delegate to CRUD in project_file_associations
        return get_project_file_association(self.db, project_id, file_memory_entity_id)

    def get_tasks_by_project(self, project_id: str, search: Optional[str] = None, status: Optional[str] = None, is_archived: Optional[bool] = False) -> List[models.Task]:
        # Delegate to CRUD
        return get_tasks_by_project(self.db, project_id, search, status, is_archived)
