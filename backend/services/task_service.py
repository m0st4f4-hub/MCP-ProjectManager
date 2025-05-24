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
    ) -> Optional[models.Task]:
        # Delegate to CRUD
        return crud_get_task(self.db, project_id=str(project_id), task_number=task_number, is_archived=is_archived)

    def get_tasks_by_project(
        self,
        project_id: UUID,
        skip: int = 0,
        agent_id: Optional[str] = None,
        agent_name: Optional[str] = None,
        search: Optional[str] = None,
        status: Optional[str] = None,
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
        status: Optional[str] = None,
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
        # Delegate to CRUD create function. CRUD handles task numbering and validation.
        return crud_create_task(self.db, project_id=str(project_id), task=task, agent_id=agent_id)

    def update_task(
        self,
        project_id: UUID,
        task_number: int,
        task_update: TaskUpdate,
    ) -> Optional[models.Task]:
        # Use the correct CRUD function for composite key
        return crud_update_task(
            self.db, project_id=str(project_id), task_number=task_number, task=task_update
        )

    def delete_task(self, project_id: UUID, task_number: int) -> bool:
        # Use the correct CRUD function for composite key
        return crud_delete_task(self.db, project_id=str(project_id), task_number=task_number)

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
        self, project_id: UUID, task_number: int, status: str
    ) -> Optional[models.Task]:
        # Delegate to CRUD update function (or a specific CRUD status update if exists)
        # For now, use the generic update_task
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
             task_project_id=project_id, task_task_number=task_number, file_memory_entity_id=file_memory_entity_id
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
            task_project_id=task_project_id, task_task_number=task_task_number,
            sort_by=sort_by, sort_direction=sort_direction, filename=filename
        )

    def get_dependencies_for_task(self, task_project_id: UUID, task_task_number: int, sort_by: Optional[str] = None, sort_direction: Optional[str] = None, dependency_type: Optional[str] = None) -> List[models.TaskDependency]:
        # Delegate to TaskDependencyService
        return self.dependency_service.get_task_dependencies(
            task_project_id=task_project_id, task_task_number=task_task_number,
            sort_by=sort_by, sort_direction=sort_direction, dependency_type=dependency_type
        )

    def get_predecessor_tasks(self, task_project_id: UUID, task_task_number: int, sort_by: Optional[str] = None, sort_direction: Optional[str] = None, dependency_type: Optional[str] = None) -> List[models.TaskDependency]:
        # Delegate to TaskDependencyService
        return self.dependency_service.get_predecessor_tasks(
            task_project_id=task_project_id, task_task_number=task_task_number,
            sort_by=sort_by, sort_direction=sort_direction, dependency_type=dependency_type
        )

    def get_successor_tasks(self, task_project_id: UUID, task_task_number: int, sort_by: Optional[str] = None, sort_direction: Optional[str] = None, dependency_type: Optional[str] = None) -> List[models.TaskDependency]:
        # Delegate to TaskDependencyService
        return self.dependency_service.get_successor_tasks(
            task_project_id=task_project_id, task_task_number=task_task_number,
            sort_by=sort_by, sort_direction=sort_direction, dependency_type=dependency_type
        )
