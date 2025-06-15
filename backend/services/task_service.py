from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import and_, func, or_
from typing import List, Optional, Tuple
import uuid

import backend.models as models
from backend.schemas.task import TaskCreate, TaskUpdate
from backend.schemas.comment import CommentCreate
from backend.enums import TaskStatusEnum
from .exceptions import EntityNotFoundError, ValidationError
from .utils import service_transaction

class TaskService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_task(self, project_id: str, task_number: int) -> models.Task:
        query = select(models.Task).where(
            and_(models.Task.project_id == project_id, models.Task.task_number == task_number)
        ).options(
            selectinload(models.Task.project),
            selectinload(models.Task.assignee)
        )
        result = await self.db.execute(query)
        task = result.scalar_one_or_none()
        if not task:
            raise EntityNotFoundError("Task", f"{project_id}:{task_number}")
        return task

    async def get_tasks_for_project(self, project_id: str, skip: int = 0, limit: int = 100) -> List[models.Task]:
        query = select(models.Task).where(models.Task.project_id == project_id).offset(skip).limit(limit).options(
            selectinload(models.Task.project),
            selectinload(models.Task.assignee)
        )
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_tasks(
        self, 
        project_id: uuid.UUID = None, 
        skip: int = 0, 
        limit: int = 100,
        agent_id: Optional[str] = None,
        search: Optional[str] = None,
        status: Optional[TaskStatusEnum] = None,
        is_archived: Optional[bool] = None,
        sort_by: Optional[str] = "created_at",
        sort_direction: Optional[str] = "desc"
    ) -> Tuple[List[models.Task], int]:
        """Get tasks with filtering, sorting, and pagination"""
        query = select(models.Task)
        count_query = select(func.count()).select_from(models.Task)
        
        # Base filters
        filters = []
        if project_id:
            filters.append(models.Task.project_id == str(project_id))
        if agent_id:
            filters.append(models.Task.assigned_to == agent_id)
        if status:
            filters.append(models.Task.status == status)
        if is_archived is not None:
            filters.append(models.Task.is_archived == is_archived)
        
        # Search filter
        if search:
            search_filter = or_(
                models.Task.title.ilike(f"%{search}%"),
                models.Task.description.ilike(f"%{search}%")
            )
            filters.append(search_filter)
        
        if filters:
            query = query.where(and_(*filters))
            count_query = count_query.where(and_(*filters))
        
        # Sorting
        sort_field = getattr(models.Task, sort_by, models.Task.created_at)
        if sort_direction.lower() == "desc":
            query = query.order_by(sort_field.desc())
        else:
            query = query.order_by(sort_field.asc())
        
        # Pagination with correct relationship names
        query = query.offset(skip).limit(limit).options(
            selectinload(models.Task.project),
            selectinload(models.Task.assignee)
        )
        
        # Execute queries
        result = await self.db.execute(query)
        tasks = result.scalars().all()
        
        count_result = await self.db.execute(count_query)
        total = count_result.scalar()
        
        return tasks, total

    async def get_all_tasks(self, skip: int = 0, limit: int = 100) -> List[models.Task]:
        """Get all tasks across all projects"""
        query = select(models.Task).offset(skip).limit(limit).options(
            selectinload(models.Task.project),
            selectinload(models.Task.assignee)
        )
        result = await self.db.execute(query)
        return result.scalars().all()

    @service_transaction
    async def create_task(self, project_id: uuid.UUID = None, task: TaskCreate = None, task_data: TaskCreate = None) -> models.Task:
        """Create a task - flexible interface for backward compatibility"""
        # Handle different calling patterns
        if task_data is None:
            task_data = task
        if project_id and not hasattr(task_data, 'project_id'):
            task_data.project_id = str(project_id)
        
        # Get the next task number for this project
        max_task_number_query = select(func.max(models.Task.task_number)).where(
            models.Task.project_id == task_data.project_id
        )
        result = await self.db.execute(max_task_number_query)
        max_task_number = result.scalar() or 0
        next_task_number = max_task_number + 1
        
        # Create task with correct field mapping
        task_dict = task_data.model_dump()
        # Remove assignee_id if it exists (legacy field) and use assigned_to
        if 'assignee_id' in task_dict:
            task_dict['assigned_to'] = task_dict.pop('assignee_id')
        
        db_task = models.Task(
            **task_dict,
            task_number=next_task_number
        )
        self.db.add(db_task)
        await self.db.flush()
        await self.db.refresh(db_task, attribute_names=['project', 'assignee'])
        return db_task

    @service_transaction
    async def update_task(self, project_id: str, task_number: int, task_update: TaskUpdate) -> models.Task:
        db_task = await self.get_task(project_id, task_number)
        
        update_data = task_update.model_dump(exclude_unset=True)
        # Handle legacy field name mapping
        if "assignee_id" in update_data:
            update_data["assigned_to"] = update_data.pop("assignee_id")

        for key, value in update_data.items():
            setattr(db_task, key, value)
            
        await self.db.flush()
        await self.db.refresh(db_task)
        return db_task

    @service_transaction
    async def delete_task(self, project_id: str, task_number: int):
        db_task = await self.get_task(project_id, task_number)
        await self.db.delete(db_task)
        await self.db.flush()
        return True  # Return boolean for consistency

    @service_transaction
    async def archive_task(self, project_id: str, task_number: int) -> models.Task:
        """Archive a task"""
        db_task = await self.get_task(project_id, task_number)
        db_task.is_archived = True
        await self.db.flush()
        await self.db.refresh(db_task)
        return db_task

    @service_transaction
    async def unarchive_task(self, project_id: str, task_number: int) -> models.Task:
        """Unarchive a task"""
        db_task = await self.get_task(project_id, task_number)
        db_task.is_archived = False
        await self.db.flush()
        await self.db.refresh(db_task)
        return db_task

    # Comment-related methods
    async def get_task_comments(
        self, 
        project_id: str, 
        task_number: int,
        skip: int = 0, 
        limit: int = 100
    ) -> Tuple[List[models.Comment], int]:
        """Get comments for a task"""
        # First verify task exists
        await self.get_task(project_id, task_number)
        
        query = select(models.Comment).where(
            and_(
                models.Comment.project_id == project_id,
                models.Comment.task_number == task_number
            )
        ).order_by(models.Comment.created_at.desc()).offset(skip).limit(limit)
        
        count_query = select(func.count(models.Comment.id)).where(
            and_(
                models.Comment.project_id == project_id,
                models.Comment.task_number == task_number
            )
        )
        
        result = await self.db.execute(query)
        comments = result.scalars().all()
        
        count_result = await self.db.execute(count_query)
        total = count_result.scalar()
        
        return comments, total

    @service_transaction
    async def add_comment_to_task(
        self, 
        project_id: str, 
        task_number: int,
        comment_data: CommentCreate,
        user_id: str
    ) -> models.Comment:
        """Add a comment to a task"""
        # First verify task exists
        await self.get_task(project_id, task_number)
        
        db_comment = models.Comment(
            content=comment_data.content,
            project_id=project_id,
            task_number=task_number,
            author_id=user_id
        )
        self.db.add(db_comment)
        await self.db.flush()
        await self.db.refresh(db_comment)
        return db_comment
