# Task ID: <taskId>  # Agent Role: ImplementationSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from .. import models
import datetime
from typing import List, Optional, Union, Tuple
from uuid import UUID  # Import specific schema classes from their files
from ..schemas.task import TaskCreate, TaskUpdate, Task  # Import the TaskStatusEnum
from ..enums import TaskStatusEnum  # Import service utilities
from .utils import service_transaction
from .exceptions import (
    EntityNotFoundError,
    ValidationError,
    DuplicateEntityError  # Import CRUD operations for tasks
)
from ..crud.tasks import (
    get_task as crud_get_task,
    get_tasks as crud_get_tasks,
    get_all_tasks as crud_get_all_tasks,
    create_task as crud_create_task,
    update_task_by_project_and_number as crud_update_task,
    delete_task_by_project_and_number as crud_delete_task,
    archive_task as crud_archive_task,
    unarchive_task as crud_unarchive_task,  # get_next_task_number_for_project  # This logic is now handled within crud_create_task
)  # Import other relevant services for related entities  # Assuming these services exist and are refactored
from .task_dependency_service import TaskDependencyService  # For dependencies
from .task_file_association_service import TaskFileAssociationService  # For file associations
from .comment_service import CommentService  # For comments  # from .project_service import ProjectService  # Project checks handled in task CRUD  # from .agent_service import AgentService  # Agent checks handled in task CRUD


class TaskService:
    def __init__(self, db: AsyncSession):
        self.db = db  # Initialize other services if needed for orchestration
        self.dependency_service = TaskDependencyService(db)
        self.file_association_service = TaskFileAssociationService(db)
        self.comment_service = CommentService(db)

    async def get_task(
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
        task = await crud_get_task(self.db, project_id=str(project_id), task_number=task_number)
        if not task:
            raise EntityNotFoundError("Task", f"Project: {project_id}, Number: {task_number}")
        return task

    async def get_tasks(
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
        sort_direction: Optional[str] = None,
    ) -> Tuple[List[models.Task], int]:
        """Retrieve tasks with filtering and pagination applied at the SQL level.

        Returns a tuple of (tasks, total_count).
        """
        project_id_str = str(project_id) if project_id else None

        query = select(models.Task)
        count_query = select(func.count()).select_from(models.Task)

        if project_id_str:
            query = query.filter(models.Task.project_id == project_id_str)
            count_query = count_query.filter(models.Task.project_id == project_id_str)
        if agent_id:
            query = query.filter(models.Task.agent_id == agent_id)
            count_query = count_query.filter(models.Task.agent_id == agent_id)
        if agent_name:
            query = query.join(models.Agent).filter(models.Agent.name == agent_name)
            count_query = count_query.join(models.Agent).filter(models.Agent.name == agent_name)
        if search:
            search_term = f"%{search}%"
            query = query.filter(or_(models.Task.title.ilike(search_term), models.Task.description.ilike(search_term)))
            count_query = count_query.filter(or_(models.Task.title.ilike(search_term), models.Task.description.ilike(search_term)))
        if status:
            status_value = status.value if isinstance(status, TaskStatusEnum) else status
            query = query.filter(models.Task.status == status_value)
            count_query = count_query.filter(models.Task.status == status_value)
        if is_archived is not None:
            query = query.filter(models.Task.is_archived == is_archived)
            count_query = count_query.filter(models.Task.is_archived == is_archived)

        if sort_by:
            sort_column = getattr(models.Task, sort_by, None)
            if sort_column is not None:
                if sort_direction == "desc":
                    query = query.order_by(sort_column.desc())
                else:
                    query = query.order_by(sort_column)
            else:
                query = query.order_by(models.Task.created_at.desc())
        else:
            query = query.order_by(models.Task.created_at.desc())

        result = await self.db.execute(query.offset(skip).limit(limit))
        tasks = result.scalars().all()

        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        return tasks, total

    async def get_tasks_by_project(
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
        ) -> List[models.Task]:  # Delegate to CRUD
        project_id_str = str(project_id) if project_id is not None else None
        return await crud_get_tasks(
        self.db, project_id=project_id_str, skip=skip, limit=limit,
        agent_id=agent_id, agent_name=agent_name, search=search,
        status=status, is_archived=is_archived, sort_by=sort_by,
        sort_direction=sort_direction
        )

    async def get_all_tasks(
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
        ) -> List[models.Task]:  # Delegate to CRUD  # Convert project_id to string if it exists before passing to crud
        project_id_str = str(project_id) if project_id else None
        return await crud_get_all_tasks(
        self.db, project_id=project_id_str, skip=skip, limit=limit,
        agent_id=agent_id, agent_name=agent_name, search=search,
        status=status, is_archived=is_archived, sort_by=sort_by,
        sort_direction=sort_direction
        )  # Removed get_next_task_number_for_project as it's handled in CRUD create

    async def create_task(
        self,
        project_id: UUID,
        task: TaskCreate,
        agent_id: Optional[str] = None
        ) -> Task:
        """
        Create a new task for a project.

        Args:
        project_id: The project ID
        task: The task data
        agent_id: Optional agent ID to assign

        Returns:
        The created task ORM model.

        Raises:
        EntityNotFoundError: If the project or agent is not found
        ValidationError: If the task data is invalid
        """
        try:  # Use transaction context manager
            async with service_transaction(self.db, "create_task") as tx_db:
                try:  # CRUD function handles task numbering and validation
                    db_task = await crud_create_task(tx_db, project_id=str(project_id), task=task, agent_id=agent_id)
                    
                    # Explicitly load necessary relationships before the session closes
                    # Use selectinload for collections and joinedload for many-to-one
                    # Determine relationships from Task Pydantic schema:
                    # project, agent, status_object, dependencies_as_predecessor, dependencies_as_successor, task_files, comments
                    # Re-fetch the task with relationships loaded. Using tx_db ensures it's within the transaction.
                    from sqlalchemy.orm import selectinload, joinedload
                    from sqlalchemy import select

                    loaded_task_stmt = select(models.Task).filter(
                        models.Task.project_id == db_task.project_id,
                        models.Task.task_number == db_task.task_number
                    ).options(
                        joinedload(models.Task.project),  # Assuming Task has a project relationship
                        joinedload(models.Task.agent),  # Assuming Task has an agent relationship,
                        selectinload(models.Task.dependencies_as_predecessor),  # Assuming Task has these relationships
                        selectinload(models.Task.dependencies_as_successor),
                        selectinload(models.Task.task_files),
                        selectinload(models.Task.comments)  # Assuming Task has a comments relationship
                    )

                    loaded_task_result = await tx_db.execute(loaded_task_stmt)
                    db_task_loaded = loaded_task_result.scalars().first()

                    if db_task_loaded is None:  # This should not happen if create_task succeeded, but handle defensively
                        raise EntityNotFoundError("Task", db_task.id)
                    
                    # Convert the fully loaded ORM object to a Pydantic model before returning
                    return Task.model_validate(db_task_loaded)

                except ValueError as e:  # Convert ValueError to ValidationError
                    raise ValidationError(str(e))
                except Exception as e:  # Convert any other exceptions to service exceptions
                    if isinstance(e, (EntityNotFoundError, ValidationError)):
                        raise  # If it's a database-specific error about foreign key constraints
                    
                    # This might catch errors if project_id or agent_id are invalid, even after CRUD checks
                    if "foreign key constraint" in str(e).lower():  # Attempt to provide more specific error if possible
                        error_detail = str(e)
                        if "project_id" in error_detail:
                            raise EntityNotFoundError("Project", project_id)
                        if "agent_id" in error_detail:
                            raise EntityNotFoundError("Agent", agent_id)  # Generic FK error if we can't parse it
                        raise ValidationError(f"Foreign key constraint violation: {error_detail}")
                    
                    # Generic catch-all for other exceptions during task creation
                    raise ValidationError(f"Error creating task: {str(e)}")
        except Exception as e:
            # This is the outer exception handler for the service_transaction context
            raise ValidationError(f"Error in transaction: {str(e)}")

    async def update_task(
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
        """  # Check if task exists
        existing_task = await crud_get_task(self.db, project_id=str(project_id), task_number=task_number)
        if not existing_task:
            raise EntityNotFoundError("Task", f"Project: {project_id}, Number: {task_number}")  # Use transaction context manager
        async with service_transaction(self.db, "update_task") as tx_db:
            try:
                updated_task = await crud_update_task(
                    tx_db, project_id=str(project_id), task_number=task_number, task=task_update
                )
                if not updated_task:
                    raise EntityNotFoundError("Task", f"Project: {project_id}, Number: {task_number}")
                return updated_task
            except ValueError as e:  # Convert ValueError to ValidationError
                raise ValidationError(str(e))
            except Exception as e:  # Convert any other exceptions to service exceptions
                if isinstance(e, (EntityNotFoundError, ValidationError)):
                    raise
                raise ValidationError(f"Error updating task: {str(e)}")

    async def delete_task(self, project_id: UUID, task_number: int) -> models.Task:
        """
        Delete a task by project ID and task number.

        Args:
        project_id: The project ID
        task_number: The task number

        Returns:
        The deleted task data

        Raises:
        EntityNotFoundError: If the task is not found
        """  # Check if task exists
        existing_task = await crud_get_task(self.db, project_id=str(project_id), task_number=task_number)
        if not existing_task:
            raise EntityNotFoundError("Task", f"Project: {project_id}, Number: {task_number}")  # Store task data for return
        from ..schemas.task import Task
        task_data = Task.model_validate(existing_task)  # Use transaction context manager
        async with service_transaction(self.db, "delete_task") as tx_db:
            deleted_task_obj = await crud_delete_task(tx_db, project_id=str(project_id), task_number=task_number)
            if not deleted_task_obj:
                raise EntityNotFoundError("Task", f"Project: {project_id}, Number: {task_number}")  # Return the task data that was deleted
            return deleted_task_obj

    async def archive_task(
        self,
        project_id: UUID,
        task_number: int
        ) -> Optional[models.Task]:  # Delegate to CRUD archive function
        return await crud_archive_task(self.db, project_id=str(project_id), task_number=task_number)

    async def unarchive_task(
        self,
        project_id: UUID,
        task_number: int
        ) -> Optional[models.Task]:  # Delegate to CRUD unarchive function
        return await crud_unarchive_task(self.db, project_id=str(project_id), task_number=task_number)

    def add_dependency(
        self,
        predecessor_project_id: UUID,
        predecessor_task_number: int,
        successor_project_id: UUID,
        successor_task_number: int
        ) -> Optional[models.TaskDependency]:  # Delegate to TaskDependencyService
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
        ) -> bool:  # Delegate to TaskDependencyService
        return self.dependency_service.remove_dependency(
        predecessor_project_id, predecessor_task_number,
        successor_project_id, successor_task_number
        )

    def get_task_dependencies(
        self, project_id: UUID, task_number: int
        ) -> List[models.TaskDependency]:  # Delegate to TaskDependencyService
        return self.dependency_service.get_task_dependencies(
        project_id, task_number
        )

    def update_task_status(
        self,
        project_id: UUID,
        task_number: int,  # Explicitly type status as TaskStatusEnum for clarity in this function
        status: TaskStatusEnum
        ) -> Optional[models.Task]:  # Delegate to CRUD update function
        task_update = TaskUpdate(status=status)
        return self.update_task(project_id, task_number, task_update)

    def assign_task_to_agent(
        self,
        project_id: UUID,
        task_number: int,
        agent_id: str
        ) -> Optional[models.Task]:  # Delegate to CRUD update function
        task_update = TaskUpdate(agent_id=agent_id)
        return self.update_task(project_id, task_number, task_update)

    def unassign_task(
        self,
        project_id: UUID,
        task_number: int
        ) -> Optional[models.Task]:  # Delegate to CRUD update function
        task_update = TaskUpdate(agent_id=None)  # Assuming setting agent_id to None unassigns
        return self.update_task(project_id, task_number, task_update)

    def associate_file_with_task(
        self,
        project_id: UUID,
        task_number: int,
        file_memory_entity_id: int
        ) -> Optional[models.TaskFileAssociation]:  # Delegate to TaskFileAssociationService  # Assuming the service takes project_id, task_number and file_memory_entity_id
        return self.file_association_service.associate_file_with_task(
        task_project_id=str(project_id), task_task_number=task_number, file_memory_entity_id=file_memory_entity_id
        )

    def disassociate_file_from_task(
        self,
        project_id: UUID,
        task_number: int,
        file_memory_entity_id: int
        ) -> bool:  # Delegate to TaskFileAssociationService
        return self.file_association_service.disassociate_file_from_task(
        task_project_id=project_id, task_task_number=task_number, file_memory_entity_id=file_memory_entity_id
        )

    def get_task_files(
        self, project_id: UUID, task_number: int
        ) -> List[models.TaskFileAssociation]:  # Delegate to TaskFileAssociationService
        return self.file_association_service.get_files_for_task(
        task_project_id=project_id, task_task_number=task_number
        )

    def add_comment_to_task(
        self,
        project_id: UUID,
        task_number: int,
        author_id: str,
        content: str
        ) -> Optional[models.Comment]:  # Delegate to CommentService  # Assuming CommentService.create_comment takes task_project_id, task_task_number, author_id, content
        return self.comment_service.create_comment(
        task_project_id=project_id, task_task_number=task_number, author_id=author_id, content=content
        )

    def get_task_comments(
        self,
        project_id: UUID,
        task_number: int,
        sort_by: Optional[str] = 'created_at',
        sort_direction: Optional[str] = 'asc'
        ) -> List[models.Comment]:  # Delegate to CommentService
        return self.comment_service.get_comments_by_task(
        task_project_id=project_id, task_task_number=task_number,
        sort_by=sort_by, sort_direction=sort_direction
        )

    def get_files_for_task(self, task_project_id: UUID, task_task_number: int, sort_by: Optional[str] = None, sort_direction: Optional[str] = None, filename: Optional[str] = None) -> List[models.TaskFileAssociation]:  # Delegate to TaskFileAssociationService
        return self.file_association_service.get_files_for_task(
        task_project_id=str(task_project_id), task_task_number=task_task_number,
        sort_by=sort_by, sort_direction=sort_direction, filename=filename
        )

    def get_dependencies_for_task(self, task_project_id: UUID, task_task_number: int, sort_by: Optional[str] = None, sort_direction: Optional[str] = None, dependency_type: Optional[str] = None) -> List[models.TaskDependency]:  # Delegate to TaskDependencyService
        return self.dependency_service.get_task_dependencies(
        task_project_id=str(task_project_id), task_task_number=task_task_number,
        sort_by=sort_by, sort_direction=sort_direction, dependency_type=dependency_type
        )

    def get_predecessor_tasks(self, task_project_id: UUID, task_task_number: int, sort_by: Optional[str] = None, sort_direction: Optional[str] = None, dependency_type: Optional[str] = None) -> List[models.TaskDependency]:  # Delegate to TaskDependencyService
        return self.dependency_service.get_predecessor_tasks(
        task_project_id=str(task_project_id), task_task_number=task_task_number,
        sort_by=sort_by, sort_direction=sort_direction, dependency_type=dependency_type
        )

    def get_successor_tasks(self, task_project_id: UUID, task_task_number: int, sort_by: Optional[str] = None, sort_direction: Optional[str] = None, dependency_type: Optional[str] = None) -> List[models.TaskDependency]:  # Delegate to TaskDependencyService
        return self.dependency_service.get_successor_tasks(
        task_project_id=str(task_project_id), task_task_number=task_task_number,
        sort_by=sort_by, sort_direction=sort_direction, dependency_type=dependency_type
        )
