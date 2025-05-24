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

# Import CRUD for Project Templates
from backend.crud import project_templates as project_template_crud
# Import Task CRUD to create tasks from template
from backend.crud import tasks as tasks_crud
# Import Project Member CRUD to add members from template
from backend.crud import project_members as project_members_crud

# No need to import validation helpers in service, they are used in CRUD
# from backend.crud.project_validation import project_name_exists


class ProjectService:
    def __init__(self, db: Session):
        self.db = db

    def get_project(
        self, project_id: str, is_archived: Optional[bool] = False
    ) -> Optional[models.Project]:
        # Delegate to CRUD
        return get_project(self.db, project_id, is_archived)

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
        template_data = None
        if project.template_id:
            # Fetch the template data
            template = project_template_crud.get_project_template(
                self.db, project.template_id
            )
            if not template:
                raise ValueError(f"Project template with ID {project.template_id} not found.")
            template_data = template.template_data

        # Create the basic project first
        db_project = create_project(self.db, project)

        # If template data exists, use it to populate the project
        if template_data:
            # Example: Create default tasks from template_data
            default_tasks = template_data.get("default_tasks", [])
            for task_data in default_tasks:
                # Assuming task_data is compatible with TaskCreate schema structure (title, description, status, etc.)
                task_create_schema = task_schemas.TaskCreate(**task_data)
                # Need to import TaskCreate and the tasks crud/service
                tasks_crud.create_task(
                    self.db, project_id=db_project.id, task=task_create_schema
                )
            
            # Example: Add default members from template_data
            default_members = template_data.get("default_members", [])
            for member_data in default_members:
                # Assuming member_data has 'user_id' and 'role'
                # Need to import ProjectMemberCreate and project_members crud/service
                member_create_schema = project_schemas.ProjectMemberCreate(**member_data, project_id=db_project.id)
                project_members_crud.add_project_member(self.db, member_create_schema)
            
            # Add created_by_user to members if not already included and template specifies default members
            if created_by_user_id and default_members:
                 user_is_member = any(m.get("user_id") == created_by_user_id for m in default_members)
                 if not user_is_member:
                     # Add the user who created the project as a default member (e.g., with 'owner' role)
                     # You might need a specific schema/logic for adding the owner
                     # For now, just a placeholder or assume owner is added by default project creation
                     pass # TODO: Implement adding creator as default member if needed

        # Refresh the project to load the new tasks and members
        self.db.refresh(db_project)

        return db_project

    def update_project(
        self, project_id: str, project_update: ProjectUpdate
    ) -> Optional[models.Project]:
        # Delegate to CRUD
        return update_project(self.db, project_id, project_update)

    def delete_project(self, project_id: str) -> bool:
        # Delegate to CRUD
        return delete_project(self.db, project_id)

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
