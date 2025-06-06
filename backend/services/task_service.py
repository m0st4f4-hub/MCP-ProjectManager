from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload, joinedload
from datetime import datetime, timedelta
from pydantic import BaseModel, validator
import logging
from uuid import UUID
import enum

from backend.models import Task as RegularTask, Project as RegularProject, User
from backend.enums import TaskStatusEnum as TaskStatus  # Import only TaskStatus from backend.enums
# from backend.models.task import TaskStatus, TaskPriority  # Comment out - these don't exist in regular models
# from backend.models.enhanced_models import EnhancedTask, TaskStatus, TaskPriority, User, EnhancedProject  # Comment out enhanced models
from backend.services.enhanced_service_base import EnhancedServiceBase
from .exceptions import ValidationError, NotFoundError, PermissionError

logger = logging.getLogger(__name__)

# Create a simple TaskPriority enum since it doesn't exist in the regular models
class TaskPriority(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

# Pydantic schemas
class TaskCreateSchema(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: str
    assignee_id: Optional[str] = None
    parent_task_id: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    estimated_hours: Optional[float] = None
    due_date: Optional[datetime] = None
    tags: List[str] = []
    custom_fields: Dict[str, Any] = {}
    
    @validator('title')
    def validate_title(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Title cannot be empty')
        if len(v) > 500:
            raise ValueError('Title cannot exceed 500 characters')
        return v.strip()
    
    @validator('estimated_hours')
    def validate_estimated_hours(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Estimated hours must be positive')
        return v
    
    @validator('due_date')
    def validate_due_date(cls, v):
        if v is not None and v < datetime.utcnow():
            raise ValueError('Due date cannot be in the past')
        return v

class TaskUpdateSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assignee_id: Optional[str] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    due_date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    custom_fields: Optional[Dict[str, Any]] = None
    
    @validator('title')
    def validate_title(cls, v):
        if v is not None:
            if not v or len(v.strip()) == 0:
                raise ValueError('Title cannot be empty')
            if len(v) > 500:
                raise ValueError('Title cannot exceed 500 characters')
        return v.strip() if v else v
    
    @validator('estimated_hours', 'actual_hours')
    def validate_hours(cls, v):
        if v is not None and v < 0:
            raise ValueError('Hours cannot be negative')
        return v

class TaskAnalyticsSchema(BaseModel):
    total_tasks: int
    completed_tasks: int
    overdue_tasks: int
    in_progress_tasks: int
    avg_completion_time: Optional[float]
    completion_rate: float
    priority_distribution: Dict[str, int]
    status_distribution: Dict[str, int]

class EnhancedTaskService(EnhancedServiceBase[RegularTask, TaskCreateSchema, TaskUpdateSchema]):
    """Enhanced task service with advanced features."""
    
    def __init__(self, db: AsyncSession = None):
        super().__init__(RegularTask, "task")
        self.db = db
    
    def _validate_create(self, data: TaskCreateSchema) -> TaskCreateSchema:
        """Validate task creation data."""
        return data
    
    def _validate_update(self, data: TaskUpdateSchema) -> TaskUpdateSchema:
        """Validate task update data."""
        return data
    
    async def _check_permissions(self, user_id: str, action: str, resource_id: str = None) -> bool:
        """Check task permissions."""
        # Implement task-specific permission logic
        # For now, allow all operations
        return True
    
    async def create_task(
        self,
        project_id: UUID,
        task: TaskCreateSchema,
        agent_id: Optional[str] = None
    ) -> RegularTask:
        """Create a task with the interface expected by the router."""
        # Convert the project_id to string and set it in the task data
        task_data = task.model_copy()
        task_data.project_id = str(project_id)
        
        # Use the existing create_task_with_validation method
        return await self.create_task_with_validation(
            db=self.db,
            task_data=task_data,
            reporter_id=None  # Will be set by the router if needed
        )

    async def create_task_with_validation(
        self,
        db: AsyncSession,
        task_data: TaskCreateSchema,
        reporter_id: str
    ) -> RegularTask:
        """Create a new task with validation."""
        # Validate project exists
        project_query = select(RegularProject).where(RegularProject.id == task_data.project_id)
        project_result = await db.execute(project_query)
        project = project_result.scalar_one_or_none()
        
        if not project:
            raise NotFoundError("Project not found")
        
        # Validate assignee exists if provided (use assigned_to instead of assignee_id)
        if hasattr(task_data, 'assigned_to') and task_data.assigned_to:
            assignee_query = select(User).where(User.id == task_data.assigned_to)
            assignee_result = await db.execute(assignee_query)
            assignee = assignee_result.scalar_one_or_none()
            
            if not assignee:
                raise NotFoundError("Assignee not found")
        
        # Validate parent task if provided (regular Task model doesn't have parent_task_id)
        # if hasattr(task_data, 'parent_task_id') and task_data.parent_task_id:
        #     parent_query = select(RegularTask).where(
        #         and_(
        #             RegularTask.id == task_data.parent_task_id,
        #             RegularTask.project_id == task_data.project_id
        #         )
        #     )
        #     parent_result = await db.execute(parent_query)
        #     parent_task = parent_result.scalar_one_or_none()
        #     
        #     if not parent_task:
        #         raise ValidationError("Parent task not found in the same project")
        
        # Create task
        task = await self.create(
            db=db,
            data=task_data,
            user_id=reporter_id,
            reporter_id=reporter_id
        )
        
        return task
    
    async def update_task_status(
        self,
        db: AsyncSession,
        task_id: str,
        new_status: TaskStatus,
        user_id: str,
        actual_hours: Optional[float] = None
    ) -> RegularTask:
        """Update task status with validation and time tracking."""
        task = await self.get_by_id(db, task_id, user_id)
        
        # Validate status transition
        valid_transitions = {
            TaskStatus.PENDING: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
            TaskStatus.IN_PROGRESS: [TaskStatus.COMPLETED, TaskStatus.ON_HOLD, TaskStatus.CANCELLED],
            TaskStatus.ON_HOLD: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
            TaskStatus.COMPLETED: [TaskStatus.IN_PROGRESS],  # Allow reopening
            TaskStatus.CANCELLED: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS]
        }
        
        if new_status not in valid_transitions.get(task.status, []):
            raise ValidationError(f"Invalid status transition from {task.status.value} to {new_status.value}")
        
        # Update task
        update_data = TaskUpdateSchema(status=new_status)
        
        # Set timestamps based on status
        if new_status == TaskStatus.IN_PROGRESS and task.status == TaskStatus.PENDING:
            task.started_at = datetime.utcnow()
        elif new_status == TaskStatus.COMPLETED:
            task.completed_at = datetime.utcnow()
            if actual_hours is not None:
                update_data.actual_hours = actual_hours
        
        # Allow status change for completed tasks
        task._allow_status_change = True
        
        updated_task = await self.update(
            db=db,
            resource_id=task_id,
            data=update_data,
            user_id=user_id
        )
        
        return updated_task
    
    async def get_tasks_by_project(
        self,
        db: AsyncSession,
        project_id: str,
        user_id: str,
        status_filter: Optional[List[TaskStatus]] = None,
        assignee_filter: Optional[str] = None,
        include_subtasks: bool = True,
        page: int = 1,
        page_size: int = 50
    ) -> Dict[str, Any]:
        """Get tasks for a project with filtering."""
        filters = {"project_id": project_id}
        
        if status_filter:
            filters["status"] = [status.value for status in status_filter]
        
        if assignee_filter:
            filters["assignee_id"] = assignee_filter
        
        if not include_subtasks:
            filters["parent_task_id"] = None
        
        return await self.list_with_filters(
            db=db,
            user_id=user_id,
            filters=filters,
            page=page,
            page_size=page_size
        )
    
    async def get_overdue_tasks(
        self,
        db: AsyncSession,
        user_id: str = None,
        project_id: str = None,
        days_overdue: int = 0
    ) -> List[RegularTask]:
        """Get overdue tasks."""
        cutoff_date = datetime.utcnow() - timedelta(days=days_overdue)
        
        query = select(RegularTask).where(
            and_(
                RegularTask.due_date < cutoff_date,
                RegularTask.status.notin_([TaskStatus.COMPLETED, TaskStatus.CANCELLED])
            )
        )
        
        if project_id:
            query = query.where(RegularTask.project_id == project_id)
        
        if user_id:
            query = query.where(RegularTask.assignee_id == user_id)
        
        query = query.options(selectinload(RegularTask.project), selectinload(RegularTask.assignee))
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_task_analytics(
        self,
        db: AsyncSession,
        project_id: str = None,
        user_id: str = None,
        date_from: datetime = None,
        date_to: datetime = None
    ) -> TaskAnalyticsSchema:
        """Get task analytics and metrics."""
        base_query = select(RegularTask)
        
        conditions = []
        
        if project_id:
            conditions.append(RegularTask.project_id == project_id)
        
        if user_id:
            conditions.append(RegularTask.assignee_id == user_id)
        
        if date_from:
            conditions.append(RegularTask.created_at >= date_from)
        
        if date_to:
            conditions.append(RegularTask.created_at <= date_to)
        
        if conditions:
            base_query = base_query.where(and_(*conditions))
        
        # Get all tasks
        result = await db.execute(base_query)
        tasks = result.scalars().all()
        
        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t.status == TaskStatus.COMPLETED])
        overdue_tasks = len([t for t in tasks if t.is_overdue])
        in_progress_tasks = len([t for t in tasks if t.status == TaskStatus.IN_PROGRESS])
        
        # Calculate completion rate
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # Calculate average completion time
        completed_with_times = [
            t for t in tasks 
            if t.status == TaskStatus.COMPLETED and t.started_at and t.completed_at
        ]
        
        avg_completion_time = None
        if completed_with_times:
            total_time = sum(
                (t.completed_at - t.started_at).total_seconds() / 3600 
                for t in completed_with_times
            )
            avg_completion_time = total_time / len(completed_with_times)
        
        # Priority distribution
        priority_distribution = {}
        for priority in TaskPriority:
            priority_distribution[priority.value] = len(
                [t for t in tasks if t.priority == priority]
            )
        
        # Status distribution
        status_distribution = {}
        for status in TaskStatus:
            status_distribution[status.value] = len(
                [t for t in tasks if t.status == status]
            )
        
        return TaskAnalyticsSchema(
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            overdue_tasks=overdue_tasks,
            in_progress_tasks=in_progress_tasks,
            avg_completion_time=avg_completion_time,
            completion_rate=completion_rate,
            priority_distribution=priority_distribution,
            status_distribution=status_distribution
        )
    
    async def bulk_update_tasks(
        self,
        db: AsyncSession,
        task_ids: List[str],
        update_data: Dict[str, Any],
        user_id: str
    ) -> List[RegularTask]:
        """Bulk update multiple tasks."""
        updated_tasks = []
        
        for task_id in task_ids:
            try:
                updated_task = await self.update(
                    db=db,
                    resource_id=task_id,
                    data=TaskUpdateSchema(**update_data),
                    user_id=user_id
                )
                updated_tasks.append(updated_task)
            except Exception as e:
                logger.warning(f"Failed to update task {task_id}: {str(e)}")
                continue
        
        logger.info(f"Bulk updated {len(updated_tasks)} out of {len(task_ids)} tasks")
        return updated_tasks
    
    async def search_tasks(
        self,
        db: AsyncSession,
        search_query: str,
        user_id: str = None,
        project_id: str = None,
        limit: int = 50
    ) -> List[RegularTask]:
        """Search tasks by title and description."""
        search_conditions = [
            RegularTask.title.ilike(f"%{search_query}%"),
            RegularTask.description.ilike(f"%{search_query}%")
        ]
        
        query = select(RegularTask).where(or_(*search_conditions))
        
        if project_id:
            query = query.where(RegularTask.project_id == project_id)
        
        if user_id:
            query = query.where(RegularTask.assignee_id == user_id)
        
        query = query.limit(limit).options(
            selectinload(RegularTask.project),
            selectinload(RegularTask.assignee)
        )
        
        result = await db.execute(query)
        return result.scalars().all()

    async def create(
        self,
        db: AsyncSession,
        data: TaskCreateSchema,
        user_id: str = None,
        reporter_id: str = None
    ) -> RegularTask:
        """Create a task with proper field mapping."""
        # Get the next task number for this project
        from sqlalchemy import func
        max_task_number_query = select(func.max(RegularTask.task_number)).where(
            RegularTask.project_id == data.project_id
        )
        result = await db.execute(max_task_number_query)
        max_task_number = result.scalar() or 0
        next_task_number = max_task_number + 1
        
        # Map schema fields to model fields
        task_data = {
            'project_id': data.project_id,
            'task_number': next_task_number,
            'title': data.title,
            'description': getattr(data, 'description', None),
            'agent_id': getattr(data, 'agent_id', None),
            'status': getattr(data, 'status', TaskStatus.TO_DO),
            'assigned_to': getattr(data, 'assigned_to', None),
            'start_date': getattr(data, 'start_date', None),
            'due_date': getattr(data, 'due_date', None),
        }
        
        # Create the task
        task = RegularTask(**task_data)
        db.add(task)
        await db.commit()
        await db.refresh(task)
        
        return task

    async def update_task(
        self,
        project_id: UUID,
        task_number: int,
        task_update: TaskUpdateSchema,
        user_id: str = None
    ) -> RegularTask:
        """Update a task with proper field mapping."""
        # Find the task
        task_query = select(RegularTask).where(
            and_(
                RegularTask.project_id == str(project_id),
                RegularTask.task_number == task_number
            )
        )
        result = await self.db.execute(task_query)
        task = result.scalar_one_or_none()
        
        if not task:
            raise NotFoundError("Task not found")
        
        # Update fields that are provided
        update_data = task_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(task, field):
                setattr(task, field, value)
        
        await self.db.commit()
        await self.db.refresh(task)
        
        return task

    async def get_task(
        self,
        project_id: UUID,
        task_number: int
    ) -> RegularTask:
        """Get a specific task by project_id and task_number."""
        task_query = select(RegularTask).where(
            and_(
                RegularTask.project_id == str(project_id),
                RegularTask.task_number == task_number
            )
        )
        result = await self.db.execute(task_query)
        task = result.scalar_one_or_none()
        
        if not task:
            raise NotFoundError("Task not found")
        
        return task

    async def delete_task(
        self,
        project_id: UUID,
        task_number: int
    ) -> bool:
        """Delete a specific task by project_id and task_number."""
        task = await self.get_task(project_id, task_number)
        
        await self.db.delete(task)
        await self.db.commit()
        
        return True

    async def get_all_tasks(
        self,
        project_id: UUID = None,
        skip: int = 0,
        limit: int = 20
    ) -> List[RegularTask]:
        """Get all tasks with optional project filter and pagination."""
        query = select(RegularTask)
        
        if project_id:
            query = query.where(RegularTask.project_id == str(project_id))
        
        query = query.offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()

# Global task service instance
task_service = EnhancedTaskService()

# Alias for backward compatibility
TaskService = EnhancedTaskService
