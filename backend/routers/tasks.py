# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

# from .. import schemas # Remove the old import
from ..database import get_db
from ..services.task_service import TaskService
from ..services.agent_service import AgentService
# from ..services.project_file_association_service import ProjectFileAssociationService # Not used in this router directly
from ..services.task_file_association_service import TaskFileAssociationService
from ..services.task_dependency_service import TaskDependencyService

# Import specific schema classes from their files
from backend.schemas.task import Task, TaskCreate, TaskUpdate # Import Task, TaskCreate, TaskUpdate from task.py
from backend.schemas.file_association import TaskFileAssociation, TaskFileAssociationCreate # Import from file_association.py
from backend.schemas.task_dependency import TaskDependency, TaskDependencyCreate # Import from task_dependency.py
from backend.schemas.comment import Comment # Import Comment from comment.py

# Import standardized API response models
from backend.schemas.api_responses import DataResponse, ListResponse, ErrorResponse, PaginationParams

# Import service exceptions
from backend.services.exceptions import EntityNotFoundError, DuplicateEntityError, ValidationError, AuthorizationError

# Import the TaskStatusEnum for router parameters
from backend.enums import TaskStatusEnum

# Import auth dependencies and AuditLogService
from backend.auth import get_current_active_user # Assuming get_current_active_user is needed
from backend.services.audit_log_service import AuditLogService
from backend.models import User as UserModel # For type hinting current_user

router = APIRouter(
    tags=["Tasks"],
)


def get_task_service(db: Session = Depends(get_db)) -> TaskService:
    return TaskService(db)


def get_agent_service(db: Session = Depends(get_db)) -> AgentService:
    return AgentService(db)


def get_task_file_association_service(db: Session = Depends(get_db)) -> TaskFileAssociationService:
    return TaskFileAssociationService(db)


def get_task_dependency_service(db: Session = Depends(get_db)) -> TaskDependencyService:
    return TaskDependencyService(db)


# Dependency for AuditLogService
def get_audit_log_service(db: Session = Depends(get_db)) -> AuditLogService:
    return AuditLogService(db)


@router.post(
    "/{project_id}/tasks/",
    response_model=DataResponse[Task], # Use standardized response model
    summary="Create Task in Project",
    tags=["Tasks"],
    operation_id="projects_tasks_create_task"
)
async def create_task_for_project(
    project_id: str,
    task: TaskCreate, # Use the directly imported class
    task_service: TaskService = Depends(get_task_service),
    current_user: UserModel = Depends(get_current_active_user), # Inject current user
    audit_log_service: AuditLogService = Depends(get_audit_log_service) # Inject AuditLogService
):
    """Create a new task in a project."""
    try:
        db_task = await task_service.create_task(
            project_id=uuid.UUID(project_id),
            task=task
        )
        
        # Log task creation
        # The object returned by task_service.create_task is already a validated Pydantic Task instance.
        # Remove redundant validation and access attributes directly from db_task
        # Ensure db_task has id and title attributes if it's a Pydantic model from service
        # Explicitly validate to ensure it's a Task instance before logging
        # try:
        #     task_to_log = Task.model_validate(db_task)
        # except Exception as e:
        #      # Log or raise an error if validation fails before logging
        #      print(f"Error validating task object for audit log: {e}")
        #      # Depending on severity, you might raise or skip logging
        #      # For now, let's raise to catch the underlying issue if service returns something unexpected
        #      raise ValidationError(f"Invalid task object received from service for logging: {e}") from e

        await audit_log_service.create_log(
            action="create_task",
            user_id=current_user.id,
            details={
                "project_id": project_id,
                "task_number": int(db_task.task_number), # Access attribute directly from db_task
                "task_title": str(db_task.title) # Access attribute directly from db_task
            }
        )
        
        # Return standardized response
        return DataResponse[Task](
            data=db_task, # db_task is already a Task Pydantic model
            message="Task created successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Consider logging the exception here
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )


@router.get(
    "/{project_id}/tasks/",
    response_model=ListResponse[Task], # Use standardized response model
    summary="Get Tasks in Project",
    tags=["Tasks"],
    operation_id="projects_tasks_get_tasks"
)
async def get_tasks_list(
    project_id: str,
    pagination: PaginationParams = Depends(),
    agent_id: Optional[str] = Query(
        None, description="Filter tasks by agent ID."),
    agent_name: Optional[str] = Query(
        None, description="Filter tasks by agent name."),
    search: Optional[str] = Query(
        None, description="Search term for task titles and descriptions."),
    status: Optional[TaskStatusEnum] = Query(
        None, description="Filter tasks by status."
    ),
    is_archived: Optional[bool] = Query(
        None,
        description="Filter by archived status. False for non-archived, True for archived, null/None for all."
    ),
    sort_by: Optional[str] = Query(
        "created_at", description="Field to sort by. Supported: \'created_at\', \'updated_at\', \'title\', \'status\', \'task_number\', \'agent_id\'"),
    sort_direction: Optional[str] = Query(
        "desc", description="Sort direction: \'asc\' or \'desc\'"),
    task_service: TaskService = Depends(get_task_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Retrieve a list of tasks in a project, with optional filtering and sorting.
    Supported sort fields: created_at, updated_at, title, status, task_number, agent_id
    """
    try:
        agent_id_val: Optional[str] = None
        if agent_name:
            # Assuming agent_service.get_agent_by_name is async if it involves DB IO
            agent = await agent_service.get_agent_by_name(name=agent_name) 
            if agent:
                agent_id_val = agent.id
            else:
                # If agent_name is specified but not found, return empty list as no tasks can match
                return ListResponse[Task](
                    data=[],
                    total=0,
                    page=pagination.page,
                    page_size=pagination.page_size,
                    has_more=False,
                    message=f"No tasks found for agent \'{agent_name}\'"
                )
        
        # Get all tasks for total count (consider optimizing this if performance is an issue)
        # Assuming get_tasks_by_project can also return a count or we have a separate count method
        all_tasks = await task_service.get_tasks_by_project(
            project_id=uuid.UUID(project_id),
            skip=0, limit=None, # Get all for count
            agent_id=agent_id_val or agent_id,
            search=search,
            status=status,
            is_archived=is_archived
        )
        total = len(all_tasks)
        
        # Get paginated tasks
        tasks = await task_service.get_tasks_by_project(
            project_id=uuid.UUID(project_id),
            skip=pagination.offset,
            limit=pagination.page_size, # Use page_size for limit
            agent_id=agent_id_val or agent_id,
            search=search,
            status=status,
            is_archived=is_archived,
            sort_by=sort_by,
            sort_direction=sort_direction
        )
        
        # Convert to Pydantic models
        pydantic_tasks = [Task.model_validate(task) for task in tasks]
        
        # Return standardized response
        return ListResponse[Task](
            data=pydantic_tasks,
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            has_more=pagination.offset + len(pydantic_tasks) < total,
            message=f"Retrieved {len(pydantic_tasks)} tasks" + 
                    (f" for agent '{agent_name}' ({agent_id_val})" if agent_name and agent_id_val else "")
        )
    except EntityNotFoundError as e: # Should not happen if project_id is validated by a dependency or earlier
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Consider logging the exception here
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )


@router.get(
    "/{project_id}/tasks/{task_number}",
    response_model=DataResponse[Task], # Use standardized response model
    summary="Get Task by Project and Number",
    tags=["Tasks"],
    operation_id="projects_tasks_get_task_by_project_and_number"
)
async def read_task(
    project_id: str,
    task_number: int = Path(...,
                            description="Task number unique within the project."),
    task_service: TaskService = Depends(get_task_service)
):
    """Retrieve a specific task by project and task number."""
    try:
        db_task = await task_service.get_task(
            project_id=uuid.UUID(project_id),
            task_number=task_number
        )
        
        # Return standardized response
        return DataResponse[Task](
            data=Task.model_validate(db_task),
            message=f"Task #{task_number} retrieved successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Consider logging the exception here
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )


@router.post(
    "/{project_id}/tasks/{task_number}/archive",
    response_model=DataResponse[Task], # Standardized response
    summary="Archive Task",
    tags=["Tasks"],
    operation_id="projects_tasks_archive_task"
)
async def archive_task_endpoint(
    project_id: str,
    task_number: int,
    task_service: TaskService = Depends(get_task_service),
    current_user: UserModel = Depends(get_current_active_user),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Archive a task."""
    try:
        archived_task = await task_service.archive_task(
            project_id=uuid.UUID(project_id),
            task_number=task_number
        )
        if archived_task is None: # Service returns None if not found
            raise EntityNotFoundError("Task", f"Project: {project_id}, Number: {task_number}")

        audit_log_service.create_log(
            action="archive_task",
            user_id=current_user.id,
            details={
                "project_id": project_id,
                "task_number": task_number
            }
        )
        return DataResponse[Task](
            data=Task.model_validate(archived_task),
            message="Task archived successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Consider logging the exception here
        raise HTTPException(
            status_code=500,
            detail=f"Failed to archive task: {str(e)}"
        )


@router.post(
    "/{project_id}/tasks/{task_number}/unarchive",
    response_model=DataResponse[Task], # Standardized response
    summary="Unarchive Task",
    tags=["Tasks"],
    operation_id="projects_tasks_unarchive_task"
)
async def unarchive_task_endpoint(
    project_id: str,
    task_number: int,
    task_service: TaskService = Depends(get_task_service),
    current_user: UserModel = Depends(get_current_active_user),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Unarchive a task."""
    try:
        unarchived_task = await task_service.unarchive_task(
            project_id=uuid.UUID(project_id),
            task_number=task_number
        )
        if unarchived_task is None: # Service returns None if not found
            raise EntityNotFoundError("Task", f"Project: {project_id}, Number: {task_number}")

        audit_log_service.create_log(
            action="unarchive_task",
            user_id=current_user.id,
            details={
                "project_id": project_id,
                "task_number": task_number
            }
        )
        return DataResponse[Task](
            data=Task.model_validate(unarchived_task),
            message="Task unarchived successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Consider logging the exception here
        raise HTTPException(
            status_code=500,
            detail=f"Failed to unarchive task: {str(e)}"
        )


@router.put(
    "/{project_id}/tasks/{task_number}",
    response_model=DataResponse[Task], # Use standardized response model
    summary="Update Task (incl. Project/Agent)",
    tags=["Tasks"],
    operation_id="projects_tasks_update_task_by_project_and_number"
)
async def update_task(
    project_id: str,
    task_number: int,
    task_update: TaskUpdate, # Use the directly imported class
    task_service: TaskService = Depends(get_task_service),
    current_user: UserModel = Depends(get_current_active_user), # Inject current user
    audit_log_service: AuditLogService = Depends(get_audit_log_service) # Inject AuditLogService
):
    """Update a task, including project or agent assignment."""
    try:
        updated_task = await task_service.update_task(
            project_id=uuid.UUID(project_id),
            task_number=task_number,
            task_update=task_update
        )
        
        # Log task update
        audit_log_service.create_log(
            action="update_task",
            user_id=current_user.id,
            details={
                "project_id": project_id,
                "task_number": task_number,
                "updated_fields": list(task_update.model_dump(exclude_unset=True).keys())
            }
        )
        
        # Return standardized response
        return DataResponse[Task](
            data=Task.model_validate(updated_task),
            message=f"Task #{task_number} updated successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Consider logging the exception here
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )


@router.delete(
    "/{project_id}/tasks/{task_number}",
    response_model=DataResponse[Task], # Use standardized response model
    summary="Delete Task",
    tags=["Tasks"],
    operation_id="projects_tasks_delete_task_by_project_and_number"
)
async def delete_task(
    project_id: str,
    task_number: int,
    task_service: TaskService = Depends(get_task_service),
    current_user: UserModel = Depends(get_current_active_user), # Inject current user
    audit_log_service: AuditLogService = Depends(get_audit_log_service) # Inject AuditLogService
):
    """Delete a task by project and task number."""
    try:
        # Task service now returns the deleted task SQLAlchemy model instance
        deleted_task_model = await task_service.delete_task(
            project_id=uuid.UUID(project_id),
            task_number=task_number
        )
        
        # Log task deletion
        audit_log_service.create_log(
            action="delete_task",
            user_id=current_user.id,
            details={
                "project_id": project_id,
                "task_number": task_number,
                "deleted_task_title": deleted_task_model.title # Assuming title is available
            }
        )
        
        # Return standardized response with Pydantic model
        return DataResponse[Task](
            data=Task.model_validate(deleted_task_model),
            message=f"Task #{task_number} deleted successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Consider logging the exception here
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )

# --- Task File Associations ---

@router.post(
    "/{project_id}/tasks/{task_number}/files/",
    response_model=DataResponse[TaskFileAssociation], 
    summary="Associate File with Task",
    tags=["Task Files"],
    operation_id="projects_tasks_associate_file_with_task"
)
async def associate_file_with_task_endpoint( # Make async
    project_id: str,
    task_number: int,
    file_association: TaskFileAssociationCreate, 
    task_file_association_service: TaskFileAssociationService = Depends(get_task_file_association_service),
    # current_user: UserModel = Depends(get_current_active_user), # Optional: if audit needed
    # audit_log_service: AuditLogService = Depends(get_audit_log_service) # Optional: if audit needed
):
    """Associate a file (Memory Entity) with a task."""
    try:
        # Assuming service method is async
        association = await task_file_association_service.associate_file_with_task(
            task_project_id=uuid.UUID(project_id), 
            task_task_number=task_number, 
            file_association_data=file_association
        )
        # Optional: audit logging
        return DataResponse[TaskFileAssociation](
            data=TaskFileAssociation.model_validate(association),
            message="File associated with task successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except DuplicateEntityError as e: # If trying to associate the same file twice
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        # Consider logging the exception here
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.get(
    "/{project_id}/tasks/{task_number}/files/",
    response_model=ListResponse[TaskFileAssociation], 
    summary="Get Files for Task",
    tags=["Task Files"],
    operation_id="projects_tasks_get_files_for_task"
)
async def get_files_for_task_endpoint( # Make async
    project_id: str,
    task_number: int,
    sort_by: Optional[str] = Query(None, description="Field to sort by (e.g., \'filename\')."),
    sort_direction: Optional[str] = Query(None, description="Sort direction: \'asc\' or \'desc\'."),
    filename: Optional[str] = Query(None, description="Filter by filename."),
    task_file_association_service: TaskFileAssociationService = Depends(get_task_file_association_service)
):
    """Retrieve files associated with a task."""
    try:
        # Assuming service method is async
        associations = await task_file_association_service.get_files_for_task(
            task_project_id=uuid.UUID(project_id), 
            task_task_number=task_number,
            sort_by=sort_by,
            sort_direction=sort_direction,
            filename=filename
        )
        pydantic_associations = [TaskFileAssociation.model_validate(assoc) for assoc in associations]
        return ListResponse[TaskFileAssociation](
            data=pydantic_associations,
            total=len(pydantic_associations), # Assuming service returns a list, count here
            # Pagination params not used in service call, so page info is 1/1
            page=1, 
            page_size=len(pydantic_associations) if pydantic_associations else 0,
            has_more=False,
            message=f"Retrieved {len(pydantic_associations)} file associations for task"
        )
    except EntityNotFoundError as e: # If task not found
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Consider logging the exception here
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@router.get(
    "/{project_id}/tasks/{task_number}/files/{file_memory_entity_id}",
    response_model=DataResponse[TaskFileAssociation],
    summary="Get Task File Association by File Memory Entity ID",
    tags=["Task Files"],
    operation_id="projects_tasks_get_task_file_association_by_file_memory_entity_id"
)
async def get_task_file_association_by_file_memory_entity_id_endpoint( # Make async
    project_id: str = Path(..., description="ID of the project."),
    task_number: int = Path(..., description="Task number unique within the project."),
    file_memory_entity_id: int = Path(..., description="ID of the associated file MemoryEntity."),
    task_file_association_service: TaskFileAssociationService = Depends(
        get_task_file_association_service)
):
    """Retrieve a specific file association for a task by the file's Memory Entity ID."""
    try:
        # Assuming service method is async
        association = await task_file_association_service.get_association_by_file_memory_entity_id(
            task_project_id=uuid.UUID(project_id),
            task_task_number=task_number,
            file_memory_entity_id=file_memory_entity_id
        )
        if not association:
            raise EntityNotFoundError("TaskFileAssociation", f"File ID: {file_memory_entity_id}")

        return DataResponse[TaskFileAssociation](
            data=TaskFileAssociation.model_validate(association),
            message="Task file association retrieved successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Consider logging the exception here
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.delete(
    "/{project_id}/tasks/{task_number}/files/{file_memory_entity_id}",
    response_model=DataResponse[dict], # Return a simple success message
    summary="Disassociate File from Task by File Memory Entity ID",
    tags=["Task Files"],
    operation_id="projects_tasks_disassociate_file_from_task_by_file_memory_entity_id"
)
async def disassociate_file_from_task_by_file_memory_entity_id_endpoint( # Make async
    project_id: str = Path(..., description="ID of the project."),
    task_number: int = Path(..., description="Task number unique within the project."),
    file_memory_entity_id: int = Path(..., description="ID of the associated file MemoryEntity."),
    task_file_association_service: TaskFileAssociationService = Depends(
        get_task_file_association_service),
    # current_user: UserModel = Depends(get_current_active_user), # Optional: if audit needed
    # audit_log_service: AuditLogService = Depends(get_audit_log_service) # Optional: if audit needed
):
    """Disassociate a file from a task using the file's Memory Entity ID."""
    try:
        # Assuming service method is async and returns bool or raises EntityNotFound
        success = await task_file_association_service.disassociate_file_from_task_by_file_id(
            task_project_id=uuid.UUID(project_id),
            task_task_number=task_number,
            file_memory_entity_id=file_memory_entity_id
        )
        if not success: # Should be handled by EntityNotFoundError in service ideally
             raise EntityNotFoundError("TaskFileAssociation", f"File ID: {file_memory_entity_id}")
        
        # Optional: audit logging
        return DataResponse[dict](
            data={"success": True},
            message="File disassociated from task successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Consider logging the exception here
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


# --- Task Dependencies ---

@router.post(
    "/{project_id}/tasks/{task_number}/dependencies/",
    response_model=DataResponse[TaskDependency], 
    summary="Add Task Dependency",
    tags=["Task Dependencies"],
    operation_id="projects_tasks_add_task_dependency"
)
async def add_task_dependency_endpoint( # Make async
    project_id: str, # This is the successor's project_id
    task_number: int, # This is the successor's task_number
    dependency: TaskDependencyCreate, 
    task_dependency_service: TaskDependencyService = Depends(get_task_dependency_service),
    # current_user: UserModel = Depends(get_current_active_user), # Optional
    # audit_log_service: AuditLogService = Depends(get_audit_log_service) # Optional
):
    """Add a dependency between two tasks.
    The path refers to the successor task. The request body defines the predecessor.
    """
    try:
        # Construct full successor details from path
        successor_project_id_uuid = uuid.UUID(project_id)
        
        # Assuming service method is async
        new_dependency = await task_dependency_service.add_dependency(
            successor_project_id=successor_project_id_uuid,
            successor_task_number=task_number,
            dependency_data=dependency 
        )
        # Optional: audit logging
        return DataResponse[TaskDependency](
            data=TaskDependency.model_validate(new_dependency),
            message="Task dependency added successfully"
        )
    except EntityNotFoundError as e: # If predecessor or successor task not found
        raise HTTPException(status_code=404, detail=str(e))
    except DuplicateEntityError as e: # If dependency already exists
        raise HTTPException(status_code=409, detail=str(e))
    except ValidationError as e: # For circular dependencies or self-dependencies
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Consider logging the exception here
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.get(
    "/{project_id}/tasks/{task_number}/dependencies/",
    response_model=ListResponse[TaskDependency], 
    summary="Get All Task Dependencies (Both Predecessors and Successors)",
    tags=["Task Dependencies"],
    operation_id="projects_tasks_get_all_task_dependencies"
)
async def get_all_task_dependencies_endpoint( # Make async
    project_id: str,
    task_number: int,
    sort_by: Optional[str] = Query(
        None, description="Field to sort by (e.g., \'predecessor_task.task_number\', \'successor_task.task_number\')."), # Adjusted for potential join
    sort_direction: Optional[str] = Query(
        None, description="Sort direction: \'asc\' or \'desc\'."),
    dependency_type: Optional[str] = Query( 
        None, description="Filter by dependency type (e.g., \'FINISH_TO_START\')."), # Assuming TaskDependency model has `type`
    task_dependency_service: TaskDependencyService = Depends(get_task_dependency_service)
):
    """Retrieve all dependencies (both predecessors and successors) for a task."""
    try:
        # Assuming service method is async
        dependencies = await task_dependency_service.get_dependencies_for_task(
            project_id=uuid.UUID(project_id), 
            task_number=task_number,
            sort_by=sort_by,
            sort_direction=sort_direction,
            dependency_type=dependency_type
        )
        pydantic_dependencies = [TaskDependency.model_validate(dep) for dep in dependencies]
        return ListResponse[TaskDependency](
            data=pydantic_dependencies,
            total=len(pydantic_dependencies),
            page=1,
            page_size=len(pydantic_dependencies) if pydantic_dependencies else 0,
            has_more=False,
            message=f"Retrieved {len(pydantic_dependencies)} dependencies for task"
        )
    except EntityNotFoundError as e: # If task not found
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Consider logging the exception here
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.get(
    "/{project_id}/tasks/{task_number}/dependencies/predecessors/",
    response_model=ListResponse[TaskDependency], 
    summary="Get Task Predecessors",
    tags=["Task Dependencies"],
    operation_id="projects_tasks_get_task_predecessors"
)
async def get_task_predecessors_endpoint( # Make async
    project_id: str,
    task_number: int,
    sort_by: Optional[str] = Query(
        None, description="Field to sort by (e.g., \'predecessor_task.task_number\')."),
    sort_direction: Optional[str] = Query(
        None, description="Sort direction: \'asc\' or \'desc\'."),
    dependency_type: Optional[str] = Query(
        None, description="Filter by dependency type."),
    task_dependency_service: TaskDependencyService = Depends(get_task_dependency_service)
):
    """Retrieve predecessor dependencies for a task."""
    try:
        # Assuming service method is async
        predecessors = await task_dependency_service.get_predecessor_tasks(
            project_id=uuid.UUID(project_id), 
            task_number=task_number,
            sort_by=sort_by,
            sort_direction=sort_direction,
            dependency_type=dependency_type
        )
        pydantic_predecessors = [TaskDependency.model_validate(pred) for pred in predecessors]
        return ListResponse[TaskDependency](
            data=pydantic_predecessors,
            total=len(pydantic_predecessors),
            page=1,
            page_size=len(pydantic_predecessors) if pydantic_predecessors else 0,
            has_more=False,
            message=f"Retrieved {len(pydantic_predecessors)} predecessor dependencies"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Consider logging the exception here
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.get(
    "/{project_id}/tasks/{task_number}/dependencies/successors/",
    response_model=ListResponse[TaskDependency], 
    summary="Get Task Successors",
    tags=["Task Dependencies"],
    operation_id="projects_tasks_get_task_successors"
)
async def get_task_successors_endpoint( # Make async
    project_id: str,
    task_number: int,
    sort_by: Optional[str] = Query(
        None, description="Field to sort by (e.g., \'successor_task.task_number\')."),
    sort_direction: Optional[str] = Query(
        None, description="Sort direction: \'asc\' or \'desc\'."),
    dependency_type: Optional[str] = Query(
        None, description="Filter by dependency type."),
    task_dependency_service: TaskDependencyService = Depends(get_task_dependency_service)
):
    """Retrieve successor dependencies for a task."""
    try:
        # Assuming service method is async
        successors = await task_dependency_service.get_successor_tasks(
            project_id=uuid.UUID(project_id), 
            task_number=task_number,
            sort_by=sort_by,
            sort_direction=sort_direction,
            dependency_type=dependency_type
        )
        pydantic_successors = [TaskDependency.model_validate(succ) for succ in successors]
        return ListResponse[TaskDependency](
            data=pydantic_successors,
            total=len(pydantic_successors),
            page=1,
            page_size=len(pydantic_successors) if pydantic_successors else 0,
            has_more=False,
            message=f"Retrieved {len(pydantic_successors)} successor dependencies"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Consider logging the exception here
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.delete(
    "/{project_id}/tasks/{task_number}/dependencies/{predecessor_project_id}/{predecessor_task_number}",
    response_model=DataResponse[dict], # Return simple success
    summary="Remove Task Dependency",
    tags=["Task Dependencies"],
    operation_id="projects_tasks_remove_task_dependency"
)
async def remove_task_dependency_endpoint( # Make async
    project_id: str, # Successor project_id
    task_number: int, # Successor task_number
    predecessor_project_id: str = Path(...,
                                       description="ID of the predecessor task\'s project."),
    predecessor_task_number: int = Path(
        ..., description="Number of the predecessor task within its project."),
    task_dependency_service: TaskDependencyService = Depends(get_task_dependency_service),
    # current_user: UserModel = Depends(get_current_active_user), # Optional
    # audit_log_service: AuditLogService = Depends(get_audit_log_service) # Optional
):
    """Remove a specific dependency between two tasks."""
    try:
        # Assuming service method is async
        success = await task_dependency_service.remove_dependency(
            predecessor_project_id=uuid.UUID(predecessor_project_id),
            predecessor_task_number=predecessor_task_number,
            successor_project_id=uuid.UUID(project_id),
            successor_task_number=task_number
        )
        if not success: # Should be handled by EntityNotFoundError in service ideally
             raise EntityNotFoundError("TaskDependency", f"From P:{predecessor_project_id}/T:{predecessor_task_number} to P:{project_id}/T:{task_number}")
        # Optional: audit logging
        return DataResponse[dict](
            data={"success": True},
            message="Task dependency removed successfully"
        )
    except EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Consider logging the exception here
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


# --- Get All Tasks (Root Level for Admin/System Use) ---
@router.get(
    "/", # At the root of this sub-router (e.g. /api/v1/projects if prefix is /api/v1/projects, or /tasks if prefix is /tasks)
          # Given current main.py: app.include_router(tasks.router, prefix="/api/v1/projects")
          # this path will be /api/v1/projects/
          # This needs to be distinct from /api/v1/projects/{project_id}/tasks/
          # A common pattern is to have a /tasks/ root endpoint for all tasks if not nested.
          # For now, let's assume it means all tasks across all projects, if this router is mounted at /api/v1/tasks instead of /api/v1/projects/{project_id}/tasks
          # If this router (tasks.py) is ALWAYS mounted under a project_id, then a root "/" GET is ambiguous with project listing.
          # Clarification: Based on operation_id "tasks_get_all_tasks_root", this is intended as a root /tasks endpoint.
          # This means this router should be mounted at /api/v1/tasks in main.py, not /api/v1/projects.
          # If it's meant to list tasks for a SPECIFIC project, it should be part of the /projects/{project_id}/tasks/ path.
          # The existing GET for "/{project_id}/tasks/" serves that purpose.
          # This endpoint is likely for system-wide task queries, so it might need adjustments based on main.py mounting.
          # For now, assuming this router will be mounted at /api/v1/tasks/ (distinct from project-specific task routes)

    response_model=ListResponse[Task], 
    summary="Get All Tasks (System-Wide)",
    tags=["Tasks"],
    operation_id="tasks_get_all_tasks_root"
)
async def get_all_tasks( # Make async
    project_id: Optional[str] = Query( # Keep project_id filter if desired for system view
        None, description="Filter tasks by project ID."),
    agent_id: Optional[str] = Query(
        None, description="Filter tasks by agent ID."),
    agent_name: Optional[str] = Query(
        None, description="Filter tasks by agent name."),
    search: Optional[str] = Query(
        None, description="Search term for task titles and descriptions."),
    status: Optional[TaskStatusEnum] = Query(
        None, description="Filter tasks by status."
    ),
    is_archived: Optional[bool] = Query(
        False, # Default to not showing archived tasks, can be overridden
        description="Filter by archived status. False for non-archived, True for archived, null/None for all."
    ),
    pagination: PaginationParams = Depends(), # Use PaginationParams for skip/limit
    sort_by: Optional[str] = Query(
        "created_at", description="Field to sort by. Supported: \'created_at\', \'updated_at\', \'title\', \'status\', \'task_number\', \'agent_id\', \'project_id\'"),
    sort_direction: Optional[str] = Query(
        "desc", description="Sort direction: \'asc\' or \'desc\'"),
    task_service: TaskService = Depends(get_task_service),
    agent_service: AgentService = Depends(get_agent_service) # For agent_name lookup
):
    """Retrieve all tasks across the system, with optional filtering and sorting."""
    try:
        project_uuid = uuid.UUID(project_id) if project_id else None
        agent_id_val: Optional[str] = None
        if agent_name:
            agent = await agent_service.get_agent_by_name(name=agent_name)
            if agent:
                agent_id_val = agent.id
            else:
                # If agent_name specified but not found, no tasks can match
                return ListResponse[Task](data=[], total=0, page=pagination.page, page_size=pagination.page_size, has_more=False, message=f"No tasks found for agent \'{agent_name}\'")

        # Get all tasks for total count
        all_system_tasks = await task_service.get_all_tasks(
            project_id=project_uuid, 
            skip=0, limit=None, # Get all for count
            agent_id=agent_id_val or agent_id, 
            search=search, 
            status=status, 
            is_archived=is_archived
        )
        total = len(all_system_tasks)

        # Get paginated tasks
        tasks = await task_service.get_all_tasks(
            project_id=project_uuid,
            skip=pagination.offset,
            limit=pagination.page_size,
            agent_id=agent_id_val or agent_id,
            search=search,
            status=status,
            is_archived=is_archived,
            sort_by=sort_by,
            sort_direction=sort_direction
        )
        pydantic_tasks = [Task.model_validate(task) for task in tasks]
        return ListResponse[Task](
            data=pydantic_tasks,
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            has_more=pagination.offset + len(pydantic_tasks) < total,
            message=f"Retrieved {len(pydantic_tasks)} system-wide tasks"
        )
    except Exception as e:
        # Consider logging the exception here
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


# --- Task Comments ---
@router.get(
    "/{project_id}/tasks/{task_number}/comments/",
    response_model=ListResponse[Comment], # Standardized list response
    summary="Get Comments for Task",
    tags=["Task Comments"],
    operation_id="projects_tasks_get_task_comments"
)
async def get_task_comments_endpoint( # Make async
    project_id: str,
    task_number: int,
    pagination: PaginationParams = Depends(), # Add pagination
    sort_by: Optional[str] = Query(
        "created_at", description="Field to sort by (e.g., \'created_at\')."),
    sort_direction: Optional[str] = Query(
        "asc", description="Sort direction: \'asc\' or \'desc\'."),
    task_service: TaskService = Depends(get_task_service)
):
    """Retrieves a list of comments for a task."""
    try:
        # Assuming get_task_comments in service is async and handles pagination + sorting
        # And returns a tuple (items, total_count) or similar for pagination
        comments, total_comments = await task_service.get_task_comments(
            project_id=uuid.UUID(project_id),
            task_number=task_number,
            skip=pagination.offset,
            limit=pagination.page_size,
            sort_by=sort_by,
            sort_direction=sort_direction
        )
        pydantic_comments = [Comment.model_validate(comment) for comment in comments]
        return ListResponse[Comment](
            data=pydantic_comments,
            total=total_comments,
            page=pagination.page,
            page_size=pagination.page_size,
            has_more=pagination.offset + len(pydantic_comments) < total_comments,
            message=f"Retrieved {len(pydantic_comments)} comments for task"
        )
    except EntityNotFoundError as e: # If task not found
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Consider logging the exception here
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

# Note: POST, PUT, DELETE for comments would go here, likely calling CommentService methods.
# Example:
# @router.post("/{project_id}/tasks/{task_number}/comments/", response_model=DataResponse[Comment], ...)
# async def create_task_comment_endpoint(...):
#     comment_service = get_comment_service(db)
#     new_comment = await comment_service.create_comment_for_task(...)
#     return DataResponse[Comment](data=Comment.model_validate(new_comment), message="Comment created")
