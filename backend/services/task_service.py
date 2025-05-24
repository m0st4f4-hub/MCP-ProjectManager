# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from sqlalchemy.orm import Session
from .. import models
import datetime
from typing import List, Optional, Union
from uuid import UUID

# Import specific schema classes from their files
from backend.schemas.task import TaskCreate, TaskUpdate

# Import the TaskStatusEnum
from backend.enums import TaskStatusEnum

# Import service utilities
from backend.services.utils import service_transaction
from backend.services.exceptions import EntityNotFoundError, ValidationError, DuplicateEntityError

# Import CRUD operations for tasks
from backend.crud.tasks import (
    get_task as crud_get_task,
    get_tasks as crud_get_tasks,
    get_all_tasks as crud_get_all_tasks,
    create_task as crud_create_task,
    update_task_by_project_and_number as crud_update_task,
    delete_task_by_project_and_number as crud_delete_task,
    archive_task as crud_archive_task,
    unarchive_task as crud_unarchive_task,
    # get_next_task_number_for_project # This logic is now handled within crud_create_task
)

# Import other relevant services for related entities
# Assuming these services exist and are refactored
from backend.services.task_dependency_service import TaskDependencyService # For dependencies
from backend.services.task_file_association_service import TaskFileAssociationService # For file associations
from backend.services.comment_service import CommentService # For comments
# from backend.services.project_service import ProjectService # Project checks handled in task CRUD
# from backend.services.agent_service import AgentService # Agent checks handled in task CRUD


class TaskService:
    def __init__(self, db: Session):
        self.db = db
        # Initialize other services if needed for orchestration
        self.dependency_service = TaskDependencyService(db)
        self.file_association_service = TaskFileAssociationService(db)
        self.comment_service = CommentService(db)

    def get_task(
        self, project_id: UUID, task_number: int,
        is_archived: Optional[bool] = False
    ) -> models.Task:
        """
        Get a task by project ID and task number.
        
        Args:
            project_id: The project ID
            task_number: The task number
            is_archived: Filter by archived status
            
        Returns:
            The task
            
        Raises:
            EntityNotFoundError: If the task is not found
        """
        task = crud_get_task(self.db, project_id=str(project_id), task_number=task_number, is_archived=is_archived)
        if not task:
            raise EntityNotFoundError("Task", f"Project: {project_id}, Number: {task_number}")
        return task

    def get_tasks_by_project(
        self,
        project_id: UUID,
        skip: int = 0,
        agent_id: Optional[str] = None,
        agent_name: Optional[str] = None,
        search: Optional[str] = None,
        status: Optional[Union[str, TaskStatusEnum]] = None,
        is_archived: Optional[bool] = False,
        limit: Optional[int] = None,
        sort_by: Optional[str] = None,
        sort_direction: Optional[str] = None
    ) -> List[models.Task]:
        # Delegate to CRUD
        return crud_get_tasks(
            self.db, project_id=str(project_id), skip=skip, limit=limit,
            agent_id=agent_id, agent_name=agent_name, search=search,
            status=status, is_archived=is_archived, sort_by=sort_by,
            sort_direction=sort_direction
        )

    def get_all_tasks(
        self,
        project_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
        agent_id: Optional[str] = None,
        agent_name: Optional[str] = None,
        search: Optional[str] = None,
        status: Optional[Union[str, TaskStatusEnum]] = None,
        is_archived: Optional[bool] = False,
        sort_by: Optional[str] = None,
        sort_direction: Optional[str] = None
    ) -> List[models.Task]:
        # Delegate to CRUD
        # Convert project_id to string if it exists before passing to crud
        project_id_str = str(project_id) if project_id else None
        return crud_get_all_tasks(
            self.db, project_id=project_id_str, skip=skip, limit=limit,
            agent_id=agent_id, agent_name=agent_name, search=search,
            status=status, is_archived=is_archived, sort_by=sort_by,
            sort_direction=sort_direction
        )

    # Removed get_next_task_number_for_project as it's handled in CRUD create

    def create_task(
        self,
        project_id: UUID,
        task: TaskCreate,
        agent_id: Optional[str] = None
    ) -> models.Task:
        """
        Create a new task for a project.
        
        Args:
            project_id: The project ID
            task: The task data
            agent_id: Optional agent ID to assign
            
        Returns:
            The created task
            
        Raises:
            EntityNotFoundError: If the project or agent is not found
            ValidationError: If the task data is invalid
        """
        try:
            # Use transaction context manager
            with service_transaction(self.db, "create_task") as tx_db:
                try:
                    # CRUD function handles task numbering and validation
                    db_task = crud_create_task(tx_db, project_id=str(project_id), task=task, agent_id=agent_id)
                    return db_task
                except ValueError as e:
                    # Convert ValueError to ValidationError
                    raise ValidationError(str(e))
        except Exception as e:
            # Convert any other exceptions to service exceptions
            if isinstance(e, (EntityNotFoundError, ValidationError)):
                raise
            # If it's a database-specific error about foreign key constraints
            if "foreign key constraint" in str(e).lower():
                raise EntityNotFoundError("Project or Agent", f"Project: {project_id}, Agent: {agent_id}")
            raise ValidationError(f"Error creating task: {str(e)}")

    def update_task(
        self,
        project_id: UUID,
        task_number: int,
        task_update: TaskUpdate,
    ) -> models.Task:
        """
        Update a task by project ID and task number.
        
        Args:
            project_id: The project ID
            task_number: The task number
            task_update: The update data
            
        Returns:
            The updated task
            
        Raises:
            EntityNotFoundError: If the task is not found
            ValidationError: If the update data is invalid
        """
        # Check if task exists
        existing_task = crud_get_task(self.db, project_id=str(project_id), task_number=task_number)
        if not existing_task:
            raise EntityNotFoundError("Task", f"Project: {project_id}, Number: {task_number}")
        
        # Use transaction context manager
        with service_transaction(self.db, "update_task") as tx_db:
            try:
                updated_task = crud_update_task(
                    tx_db, project_id=str(project_id), task_number=task_number, task=task_update
                )
                if not updated_task:
                    raise EntityNotFoundError("Task", f"Project: {project_id}, Number: {task_number}")
                return updated_task
            except ValueError as e:
                # Convert ValueError to ValidationError
                raise ValidationError(str(e))
            except Exception as e:
                # Convert any other exceptions to service exceptions
                if isinstance(e, (EntityNotFoundError, ValidationError)):
                    raise
                raise ValidationError(f"Error updating task: {str(e)}")

    def delete_task(self, project_id: UUID, task_number: int) -> models.Task:
        """
        Delete a task by project ID and task number.
        
        Args:
            project_id: The project ID
            task_number: The task number
            
        Returns:
            The deleted task data
            
        Raises:
            EntityNotFoundError: If the task is not found
        """
        # Check if task exists
        existing_task = crud_get_task(self.db, project_id=str(project_id), task_number=task_number)
        if not existing_task:
            raise EntityNotFoundError("Task", f"Project: {project_id}, Number: {task_number}")
        
        # Store task data for return
        from backend.schemas.task import Task
        task_data = Task.model_validate(existing_task)
        
        # Use transaction context manager
        with service_transaction(self.db, "delete_task") as tx_db:
            success = crud_delete_task(tx_db, project_id=str(project_id), task_number=task_number)
            if not success:
                raise EntityNotFoundError("Task", f"Project: {project_id}, Number: {task_number}")
            
            # Return the task data that was deleted
            return existing_task

    def archive_task(
        self,
        project_id: UUID,
        task_number: int
    ) -> Optional[models.Task]:
        # Delegate to CRUD archive function
        return crud_archive_task(self.db, project_id=str(project_id), task_number=task_number)

    def unarchive_task(
        self,
        project_id: UUID,
        task_number: int
    ) -> Optional[models.Task]:
        # Delegate to CRUD unarchive function
        return crud_unarchive_task(self.db, project_id=str(project_id), task_number=task_number)

    def add_dependency(
        self,
        predecessor_project_id: UUID,
        predecessor_task_number: int,
        successor_project_id: UUID,
        successor_task_number: int
    ) -> Optional[models.TaskDependency]:
        # Delegate to TaskDependencyService
        return self.dependency_service.add_dependency(
            predecessor_project_id, predecessor_task_number,
            successor_project_id, successor_task_number
        )

    def remove_dependency(
        self,
        predecessor_project_id: UUID,
        predecessor_task_number: int,
        successor_project_id: UUID,
        successor_task_number: int
    ) -> bool:
        # Delegate to TaskDependencyService
        return self.dependency_service.remove_dependency(
            predecessor_project_id, predecessor_task_number,
            successor_project_id, successor_task_number
        )

    def get_task_dependencies(
        self, project_id: UUID, task_number: int
    ) -> List[models.TaskDependency]:
        # Delegate to TaskDependencyService
        return self.dependency_service.get_task_dependencies(
            project_id, task_number
        )

    def update_task_status(
        self,
        project_id: UUID,
        task_number: int,
        # Explicitly type status as TaskStatusEnum for clarity in this function
        status: TaskStatusEnum
    ) -> Optional[models.Task]:
        # Delegate to CRUD update function
        task_update = TaskUpdate(status=status)
        return self.update_task(project_id, task_number, task_update)

    def assign_task_to_agent(
        self,
        project_id: UUID,
        task_number: int,
        agent_id: str
    ) -> Optional[models.Task]:
        # Delegate to CRUD update function
        task_update = TaskUpdate(agent_id=agent_id)
        return self.update_task(project_id, task_number, task_update)

    def unassign_task(
        self,
        project_id: UUID,
        task_number: int
    ) -> Optional[models.Task]:
        # Delegate to CRUD update function
        task_update = TaskUpdate(agent_id=None) # Assuming setting agent_id to None unassigns
        return self.update_task(project_id, task_number, task_update)

    def associate_file_with_task(
        self,
        project_id: UUID,
        task_number: int,
        file_memory_entity_id: int
    ) -> Optional[models.TaskFileAssociation]:
        # Delegate to TaskFileAssociationService
        # Assuming the service takes project_id, task_number and file_memory_entity_id
        return self.file_association_service.associate_file_with_task(
             task_project_id=str(project_id), task_task_number=task_number, file_memory_entity_id=file_memory_entity_id
        )

    def disassociate_file_from_task(
        self,
        project_id: UUID,
        task_number: int,
        file_memory_entity_id: int
    ) -> bool:
        # Delegate to TaskFileAssociationService
        return self.file_association_service.disassociate_file_from_task(
             task_project_id=project_id, task_task_number=task_number, file_memory_entity_id=file_memory_entity_id
        )

    def get_task_files(
        self, project_id: UUID, task_number: int
    ) -> List[models.TaskFileAssociation]:
        # Delegate to TaskFileAssociationService
        return self.file_association_service.get_files_for_task(
            task_project_id=project_id, task_task_number=task_number
        )

    def add_comment_to_task(
        self,
        project_id: UUID,
        task_number: int,
        author_id: str,
        content: str
    ) -> Optional[models.Comment]:
        # Delegate to CommentService
        # Assuming CommentService.create_comment takes task_project_id, task_task_number, author_id, content
        return self.comment_service.create_comment(
            task_project_id=project_id, task_task_number=task_number, author_id=author_id, content=content
        )

    def get_task_comments(
        self,
        project_id: UUID,
        task_number: int,
        sort_by: Optional[str] = 'created_at',
        sort_direction: Optional[str] = 'asc'
    ) -> List[models.Comment]:
        # Delegate to CommentService
        return self.comment_service.get_comments_by_task(
            task_project_id=project_id, task_task_number=task_number,
            sort_by=sort_by, sort_direction=sort_direction
        )

    def get_files_for_task(self, task_project_id: UUID, task_task_number: int, sort_by: Optional[str] = None, sort_direction: Optional[str] = None, filename: Optional[str] = None) -> List[models.TaskFileAssociation]:
        # Delegate to TaskFileAssociationService
        return self.file_association_service.get_files_for_task(
            task_project_id=str(task_project_id), task_task_number=task_task_number,
            sort_by=sort_by, sort_direction=sort_direction, filename=filename
        )

    def get_dependencies_for_task(self, task_project_id: UUID, task_task_number: int, sort_by: Optional[str] = None, sort_direction: Optional[str] = None, dependency_type: Optional[str] = None) -> List[models.TaskDependency]:
        # Delegate to TaskDependencyService
        return self.dependency_service.get_task_dependencies(
            task_project_id=str(task_project_id), task_task_number=task_task_number,
            sort_by=sort_by, sort_direction=sort_direction, dependency_type=dependency_type
        )

    def get_predecessor_tasks(self, task_project_id: UUID, task_task_number: int, sort_by: Optional[str] = None, sort_direction: Optional[str] = None, dependency_type: Optional[str] = None) -> List[models.TaskDependency]:
        # Delegate to TaskDependencyService
        return self.dependency_service.get_predecessor_tasks(
            task_project_id=str(task_project_id), task_task_number=task_task_number,
            sort_by=sort_by, sort_direction=sort_direction, dependency_type=dependency_type
        )

    def get_successor_tasks(self, task_project_id: UUID, task_task_number: int, sort_by: Optional[str] = None, sort_direction: Optional[str] = None, dependency_type: Optional[str] = None) -> List[models.TaskDependency]:
        # Delegate to TaskDependencyService
        return self.dependency_service.get_successor_tasks(
            task_project_id=str(task_project_id), task_task_number=task_task_number,
            sort_by=sort_by, sort_direction=sort_direction, dependency_type=dependency_type
        )
