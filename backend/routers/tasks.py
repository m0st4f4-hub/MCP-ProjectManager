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
from ..services.project_file_association_service import ProjectFileAssociationService
from ..services.task_file_association_service import TaskFileAssociationService
from ..services.task_dependency_service import TaskDependencyService

# Import specific schema classes from their files
from backend.schemas.task import Task, TaskCreate, TaskUpdate # Import Task, TaskCreate, TaskUpdate from task.py
from backend.schemas.file_association import TaskFileAssociation, TaskFileAssociationCreate # Import from file_association.py
from backend.schemas.task_dependency import TaskDependency, TaskDependencyCreate # Import from task_dependency.py
from backend.schemas.comment import Comment # Import Comment from comment.py

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
    response_model=Task, # Use the directly imported class
    summary="Create Task in Project",
    tags=["Tasks"],
    operation_id="projects_tasks_create_task"
)
def create_task_for_project(
    project_id: str,
    task: TaskCreate, # Use the directly imported class
    task_service: TaskService = Depends(get_task_service),
    current_user: UserModel = Depends(get_current_active_user), # Inject current user
    audit_log_service: AuditLogService = Depends(get_audit_log_service) # Inject AuditLogService
):
    """Create a new task in a project."""
    try:
        db_task = task_service.create_task(
            project_id=uuid.UUID(project_id),
            task=task
        )
        # Log task creation
        audit_log_service.create_log(
            action="create_task",
            user_id=current_user.id,
            details={
                "project_id": project_id,
                "task_id": db_task.id, # Assuming task model has an id field
                "task_number": db_task.task_number,
                "task_title": db_task.title
            }
        )
        return db_task
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )


@router.get(
    "/{project_id}/tasks/",
    response_model=List[Task], # Use the directly imported class
    summary="Get Tasks in Project",
    tags=["Tasks"],
    operation_id="projects_tasks_get_tasks"
)
async def get_tasks_list(
    project_id: str,
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
    skip: int = 0,
    sort_by: Optional[str] = Query(
        "created_at", description="Field to sort by. Supported: 'created_at', 'updated_at', 'title', 'status', 'task_number', 'agent_id'"),
    sort_direction: Optional[str] = Query(
        "desc", description="Sort direction: 'asc' or 'desc'"),
    task_service: TaskService = Depends(get_task_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Retrieve a list of tasks in a project, with optional filtering and sorting.
    Supported sort fields: created_at, updated_at, title, status, task_number, agent_id
    """
    agent_id_val: Optional[str] = None
    if agent_name:
        agent = agent_service.get_agent_by_name(name=agent_name)
        if agent:
            agent_id_val = agent.id
        else:
            if agent_name is not None:
                return []
    tasks = task_service.get_tasks_by_project(
        project_id=uuid.UUID(project_id),
        skip=skip,
        agent_id=agent_id_val or agent_id,
        search=search,
        status=status,
        is_archived=is_archived,
        sort_by=sort_by,
        sort_direction=sort_direction
    )
    return tasks


@router.get(
    "/{project_id}/tasks/{task_number}",
    response_model=Task, # Use the directly imported class
    summary="Get Task by Project and Number",
    tags=["Tasks"],
    operation_id="projects_tasks_get_task_by_project_and_number"
)
def read_task(
    project_id: str,
    task_number: int = Path(...,
                            description="Task number unique within the project."),
    task_service: TaskService = Depends(get_task_service)
):
    """Retrieve a specific task by project and task number."""
    db_task = task_service.get_task(
        project_id=uuid.UUID(project_id),
        task_number=task_number
    )
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task


@router.post(
    "/{project_id}/tasks/{task_number}/archive",
    response_model=Task, # Use the directly imported class
    summary="Archive Task",
    tags=["Tasks"],
    operation_id="projects_tasks_archive_task"
)
def archive_task_endpoint(
    project_id: str,
    task_number: int,
    task_service: TaskService = Depends(get_task_service)
):
    """Archive a task."""
    try:
        archived_task = task_service.archive_task(
            project_id=uuid.UUID(project_id),
            task_number=task_number
        )
        if archived_task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        return archived_task
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to archive task: {str(e)}"
        )


@router.post(
    "/{project_id}/tasks/{task_number}/unarchive",
    response_model=Task, # Use the directly imported class
    summary="Unarchive Task",
    tags=["Tasks"],
    operation_id="projects_tasks_unarchive_task"
)
def unarchive_task_endpoint(
    project_id: str,
    task_number: int,
    task_service: TaskService = Depends(get_task_service)
):
    """Unarchive a task."""
    try:
        unarchived_task = task_service.unarchive_task(
            project_id=uuid.UUID(project_id),
            task_number=task_number
        )
        if unarchived_task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        return unarchived_task
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to unarchive task: {str(e)}"
        )


@router.put(
    "/{project_id}/tasks/{task_number}",
    response_model=Task, # Use the directly imported class
    summary="Update Task (incl. Project/Agent)",
    tags=["Tasks"],
    operation_id="projects_tasks_update_task_by_project_and_number"
)
def update_task(
    project_id: str,
    task_number: int,
    task_update: TaskUpdate, # Use the directly imported class
    task_service: TaskService = Depends(get_task_service)
):
    """Update a task, including project or agent assignment."""
    try:
        db_task = task_service.update_task(
            project_id=uuid.UUID(project_id),
            task_number=task_number,
            task_update=task_update
        )
        if db_task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        return db_task
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )


@router.delete(
    "/{project_id}/tasks/{task_number}",
    response_model=dict,
    summary="Delete Task",
    tags=["Tasks"],
    operation_id="projects_tasks_delete_task_by_project_and_number"
)
def delete_task(
    project_id: str,
    task_number: int,
    task_service: TaskService = Depends(get_task_service)
):
    """Delete a task."""
    try:
        success = task_service.delete_task(
            project_id=uuid.UUID(project_id),
            task_number=task_number
        )
        if not success:
            raise HTTPException(status_code=404, detail="Task not found")
        return {"ok": True}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Internal server error during task deletion: Something went wrong"
        )


# --- Task File Association Endpoints ---


@router.post(
    "/{project_id}/tasks/{task_number}/files/",
    response_model=TaskFileAssociation, # Use the directly imported class
    summary="Associate File with Task",
    tags=["Task Files"],
    operation_id="projects_tasks_associate_file_with_task"
)
def associate_file_with_task_endpoint(
    project_id: str,
    task_number: int,
    file_association: TaskFileAssociationCreate, # Use the directly imported class
    task_file_association_service: TaskFileAssociationService = Depends(
        get_task_file_association_service)
):
    """Associate a file with a task using its memory entity ID provided in the request body."""
    try:
        return task_file_association_service.associate_file_with_task(
            project_id=project_id,
            task_number=task_number,
            file_memory_entity_id=file_association.file_memory_entity_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        import logging
        logging.error(f"Unexpected error in POST /projects/{project_id}/tasks/{task_number}/files/: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )


@router.get(
    "/{project_id}/tasks/{task_number}/files/",
    response_model=List[TaskFileAssociation], # Use the directly imported class
    summary="Get Files for Task",
    tags=["Task Files"],
    operation_id="projects_tasks_get_files_for_task"
)
def get_files_for_task_endpoint(
    project_id: str,
    task_number: int,
    sort_by: Optional[str] = Query(None, description="Field to sort by (e.g., 'filename')."),
    sort_direction: Optional[str] = Query(None, description="Sort direction: 'asc' or 'desc'."),
    filename: Optional[str] = Query(None, description="Filter by filename."),
    task_file_association_service: TaskFileAssociationService = Depends(get_task_file_association_service)
):
    """Retrieve files associated with a specific task, with optional sorting and filtering by filename."""
    return task_file_association_service.get_files_for_task(
        task_project_id=project_id,
        task_number=task_number,
        sort_by=sort_by,
        sort_direction=sort_direction,
        filename=filename
    )


@router.get(
    "/{project_id}/tasks/{task_number}/files/{file_memory_entity_id}",
    response_model=TaskFileAssociation, # Use the directly imported class
    summary="Get Task File Association by File Memory Entity ID",
    tags=["Task Files"],
    operation_id="projects_tasks_get_task_file_association_by_file_memory_entity_id"
)
def get_task_file_association_by_file_memory_entity_id_endpoint(
    project_id: str = Path(..., description="ID of the project."),
    task_number: int = Path(..., description="Task number unique within the project."),
    file_memory_entity_id: int = Path(..., description="ID of the associated file MemoryEntity."),
    task_file_association_service: TaskFileAssociationService = Depends(
        get_task_file_association_service)
):
    """Retrieves a specific task file association by task composite ID and file memory entity ID."""
    try:
        db_association = task_file_association_service.get_task_file_association(
            project_id=project_id,
            task_number=task_number,
            file_memory_entity_id=file_memory_entity_id
        )
        if db_association is None:
            raise HTTPException(status_code=404, detail="Task file association not found")
        return db_association
    except HTTPException as e:
        raise e
    except Exception as e:
        import logging
        logging.error(f"Unexpected error in GET /projects/{project_id}/tasks/{task_number}/files/{file_memory_entity_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )


@router.delete(
    "/{project_id}/tasks/{task_number}/files/{file_memory_entity_id}",
    response_model=dict,
    summary="Disassociate File from Task by File Memory Entity ID",
    tags=["Task Files"],
    operation_id="projects_tasks_disassociate_file_from_task_by_file_memory_entity_id"
)
def disassociate_file_from_task_by_file_memory_entity_id_endpoint(
    project_id: str = Path(..., description="ID of the project."),
    task_number: int = Path(..., description="Task number unique within the project."),
    file_memory_entity_id: int = Path(..., description="ID of the associated file MemoryEntity."),
    task_file_association_service: TaskFileAssociationService = Depends(
        get_task_file_association_service)
):
    """Removes a specific task file association by task composite ID and file memory entity ID."""
    try:
        success = task_file_association_service.disassociate_file_from_task(
            project_id=project_id,
            task_number=task_number,
            file_memory_entity_id=file_memory_entity_id
        )
        if not success:
            raise HTTPException(status_code=404, detail="Task file association not found")
        return {"message": "Task file association deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        import logging
        logging.error(f"Unexpected error in DELETE /projects/{project_id}/tasks/{task_number}/files/{file_memory_entity_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )


# --- Task Dependency Endpoints ---


@router.post(
    "/{project_id}/tasks/{task_number}/dependencies/",
    response_model=TaskDependency, # Use the directly imported class
    summary="Add Task Dependency",
    tags=["Task Dependencies"],
    operation_id="projects_tasks_add_task_dependency"
)
def add_task_dependency_endpoint(
    project_id: str,
    task_number: int,
    dependency: TaskDependencyCreate, # Use the directly imported class
    task_dependency_service: TaskDependencyService = Depends(
        get_task_dependency_service)
):
    """Add a dependency where the current task is the successor and the specified task is the predecessor."""
    try:
        db_dependency = task_dependency_service.add_dependency(
            predecessor_task_project_id=uuid.UUID(
                dependency.predecessor_task_project_id),
            predecessor_task_number=dependency.predecessor_task_number,
            successor_task_project_id=uuid.UUID(project_id),
            successor_task_number=task_number
        )
        if db_dependency is None:
            raise HTTPException(
                status_code=400,
                detail="Could not add task dependency or dependency already exists"
            )
        return db_dependency
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )


@router.get(
    "/{project_id}/tasks/{task_number}/dependencies/",
    response_model=List[TaskDependency], # Use the directly imported class
    summary="Get All Task Dependencies",
    tags=["Task Dependencies"],
    operation_id="projects_tasks_get_all_task_dependencies"
)
def get_all_task_dependencies_endpoint(
    project_id: str,
    task_number: int,
    sort_by: Optional[str] = Query(
        None, description="Field to sort by (e.g., 'predecessor_task_number', 'successor_task_number')."),
    sort_direction: Optional[str] = Query(
        None, description="Sort direction: 'asc' or 'desc'."),
    dependency_type: Optional[str] = Query(
        None, description="Filter by dependency type (if applicable)."),
    task_dependency_service: TaskDependencyService = Depends(
        get_task_dependency_service)
):
    """Retrieve all dependencies for a specific task (both predecessors and successors), with optional filtering and sorting."""
    try:
        return task_dependency_service.get_dependencies_for_task(
            task_project_id=uuid.UUID(project_id),
            task_number=task_number,
            sort_by=sort_by,
            sort_direction=sort_direction,
            dependency_type=dependency_type
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )


@router.get(
    "/{project_id}/tasks/{task_number}/dependencies/predecessors/",
    response_model=List[TaskDependency], # Use the directly imported class
    summary="Get Task Predecessors",
    tags=["Task Dependencies"],
    operation_id="projects_tasks_get_task_predecessors"
)
def get_task_predecessors_endpoint(
    project_id: str,
    task_number: int,
    sort_by: Optional[str] = Query(
        None, description="Field to sort by (e.g., 'predecessor_task_number')."),
    sort_direction: Optional[str] = Query(
        None, description="Sort direction: 'asc' or 'desc'."),
    dependency_type: Optional[str] = Query(
        None, description="Filter by dependency type (if applicable)."),
    task_dependency_service: TaskDependencyService = Depends(
        get_task_dependency_service)
):
    """Retrieve the predecessors for a specific task, with optional filtering and sorting."""
    try:
        return task_dependency_service.get_predecessor_tasks(
            task_project_id=uuid.UUID(project_id),
            task_number=task_number,
            sort_by=sort_by,
            sort_direction=sort_direction,
            dependency_type=dependency_type
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )


@router.get(
    "/{project_id}/tasks/{task_number}/dependencies/successors/",
    response_model=List[TaskDependency], # Use the directly imported class
    summary="Get Task Successors",
    tags=["Task Dependencies"],
    operation_id="projects_tasks_get_task_successors"
)
def get_task_successors_endpoint(
    project_id: str,
    task_number: int,
    sort_by: Optional[str] = Query(
        None, description="Field to sort by (e.g., 'successor_task_number')."),
    sort_direction: Optional[str] = Query(
        None, description="Sort direction: 'asc' or 'desc'."),
    dependency_type: Optional[str] = Query(
        None, description="Filter by dependency type (if applicable)."),
    task_dependency_service: TaskDependencyService = Depends(
        get_task_dependency_service)
):
    """Retrieve the successors for a specific task, with optional filtering and sorting."""
    try:
        return task_dependency_service.get_successor_tasks(
            task_project_id=uuid.UUID(project_id),
            task_number=task_number,
            sort_by=sort_by,
            sort_direction=sort_direction,
            dependency_type=dependency_type
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )


@router.delete(
    "/{project_id}/tasks/{task_number}/dependencies/{predecessor_project_id}/{predecessor_task_number}",
    response_model=TaskDependency, # Assuming the delete returns the deleted dependency
    summary="Remove Task Dependency",
    tags=["Task Dependencies"],
    operation_id="projects_tasks_remove_task_dependency"
)
def remove_task_dependency_endpoint(
    project_id: str,
    task_number: int,
    predecessor_project_id: str = Path(...,
                                       description="ID of the predecessor task's project."),
    predecessor_task_number: int = Path(
        ..., description="Number of the predecessor task within its project."),
    task_dependency_service: TaskDependencyService = Depends(
        get_task_dependency_service)
):
    """Remove a specific dependency where the current task is the successor and the specified task is the predecessor."""
    try:
        success = task_dependency_service.remove_dependency(
            predecessor_task_project_id=uuid.UUID(predecessor_project_id),
            predecessor_task_number=predecessor_task_number,
            successor_task_project_id=uuid.UUID(project_id),
            successor_task_number=task_number
        )
        if not success:
            raise HTTPException(
                status_code=404, detail="Task dependency not found")
        return {"message": "Task dependency removed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )


# --- General Tasks Endpoints ---


@router.get(
    "/",
    response_model=List[Task], # Use the directly imported class
    summary="Get All Tasks",
    tags=["Tasks"],
    operation_id="tasks_get_all_tasks_root"
)
async def get_all_tasks(
    project_id: Optional[str] = Query(
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
        False,
        description="Filter by archived status. False for non-archived, True for archived, null/None for all."
    ),
    skip: int = 0,
    limit: int = 100,
    sort_by: Optional[str] = Query(
        "created_at", description="Field to sort by. Supported: 'created_at', 'updated_at', 'title', 'status', 'task_number', 'agent_id'"),
    sort_direction: Optional[str] = Query(
        "desc", description="Sort direction: 'asc' or 'desc'"),
    task_service: TaskService = Depends(get_task_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Retrieve a list of all tasks across all projects, with optional filtering and sorting.
    Supported sort fields: created_at, updated_at, title, status, task_number, agent_id
    """
    agent_id_val: Optional[str] = None
    if agent_name:
        agent = agent_service.get_agent_by_name(name=agent_name)
        if agent:
            agent_id_val = agent.id
        else:
            if agent_name is not None:
                return []

    project_uuid = None
    if project_id:
        try:
            project_uuid = uuid.UUID(project_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid project_id format")

    tasks = task_service.get_all_tasks(
        project_id=project_uuid,
        skip=skip,
        limit=limit,
        agent_id=agent_id_val or agent_id,
        search=search,
        status=status,
        is_archived=is_archived,
        sort_by=sort_by,
        sort_direction=sort_direction
    )
    return tasks


# --- Task Comments Endpoints ---


@router.get(
    "/{project_id}/tasks/{task_number}/comments/",
    response_model=List[Comment], # Use the directly imported class
    summary="Get Comments for Task",
    tags=["Task Comments"],
    operation_id="projects_tasks_get_task_comments"
)
def get_task_comments_endpoint(
    project_id: str,
    task_number: int,
    sort_by: Optional[str] = Query(
        "created_at", description="Field to sort by (e.g., 'created_at')."),
    sort_direction: Optional[str] = Query(
        "asc", description="Sort direction: 'asc' or 'desc'."),
    task_service: TaskService = Depends(get_task_service)
):
    """Retrieve comments for a specific task, with optional sorting."""
    return task_service.get_task_comments(
        project_id=project_id,
        task_number=task_number,
        sort_by=sort_by,
        sort_direction=sort_direction
    )
