# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import or_, func
from .. import models, schemas
import datetime
from typing import List, Optional
from uuid import UUID


class TaskService:
    def __init__(self, db: Session):
        self.db = db

    def get_task(
        self, project_id: UUID, task_number: int,
        is_archived: Optional[bool] = False
    ) -> Optional[models.Task]:
        query = (
            self.db.query(models.Task)
            .options(
                joinedload(models.Task.project),
                joinedload(models.Task.agent)
            )
            .filter(
                models.Task.project_id == str(project_id),
                models.Task.task_number == task_number
            )
        )
        if is_archived is not None:
            query = query.filter(models.Task.is_archived == is_archived)
        return query.first()

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
        """
        Retrieve tasks for a project with optional filtering and sorting.
        sort_by: one of 'created_at', 'updated_at', 'title', 'status',
        'task_number', 'agent_id'
        sort_direction: 'asc' or 'desc'
        """
        query = self.db.query(models.Task).options(
            selectinload(models.Task.project),
            selectinload(models.Task.agent)
        )
        query = query.filter(models.Task.project_id == str(project_id))
        if agent_id:
            query = query.filter(models.Task.agent_id == agent_id)
        elif agent_name:
            query = query.join(models.Agent).filter(
                models.Agent.name == agent_name)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    models.Task.title.ilike(search_term),
                    models.Task.description.ilike(search_term)
                )
            )
        if status is not None:
            query = query.filter(models.Task.status == status)
        if is_archived is not None:
            query = query.filter(models.Task.is_archived == is_archived)
        allowed_sort_fields = {
            'created_at': models.Task.created_at,
            'updated_at': models.Task.updated_at,
            'title': models.Task.title,
            'status': models.Task.status,
            'task_number': models.Task.task_number,
            'agent_id': models.Task.agent_id
        }
        sort_field = allowed_sort_fields.get(sort_by, models.Task.created_at)
        if sort_direction and sort_direction.lower() == 'asc':
            query = query.order_by(sort_field.asc())
        else:
            query = query.order_by(sort_field.desc())
        query = query.offset(skip)
        if limit is not None:
            query = query.limit(limit)
        tasks_list = query.all()
        return tasks_list

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
        """
        Retrieve all tasks across all projects with optional filtering and sorting.
        sort_by: one of 'created_at', 'updated_at', 'title', 'status',
        'task_number', 'agent_id'
        sort_direction: 'asc' or 'desc'
        """
        query = self.db.query(models.Task).options(
            selectinload(models.Task.project),
            selectinload(models.Task.agent)
        )
        
        # Filter by project if specified
        if project_id:
            query = query.filter(models.Task.project_id == str(project_id))
            
        # Filter by agent
        if agent_id:
            query = query.filter(models.Task.agent_id == agent_id)
        elif agent_name:
            query = query.join(models.Agent).filter(
                models.Agent.name == agent_name)
                
        # Search functionality
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    models.Task.title.ilike(search_term),
                    models.Task.description.ilike(search_term)
                )
            )
            
        # Filter by status
        if status is not None:
            query = query.filter(models.Task.status == status)
            
        # Filter by archived status
        if is_archived is not None:
            query = query.filter(models.Task.is_archived == is_archived)
            
        # Sorting
        allowed_sort_fields = {
            'created_at': models.Task.created_at,
            'updated_at': models.Task.updated_at,
            'title': models.Task.title,
            'status': models.Task.status,
            'task_number': models.Task.task_number,
            'agent_id': models.Task.agent_id
        }
        sort_field = allowed_sort_fields.get(sort_by, models.Task.created_at)
        if sort_direction and sort_direction.lower() == 'asc':
            query = query.order_by(sort_field.asc())
        else:
            query = query.order_by(sort_field.desc())
            
        # Pagination
        query = query.offset(skip)
        if limit is not None:
            query = query.limit(limit)
            
        tasks_list = query.all()
        return tasks_list

    def get_next_task_number_for_project(self, project_id: UUID) -> int:
        max_number = self.db.query(func.max(models.Task.task_number)).filter(
            models.Task.project_id == str(project_id)
        ).scalar()
        return (max_number or 0) + 1

    def create_task(
        self,
        project_id: UUID,
        task: schemas.TaskCreate,
        agent_id: Optional[str] = None
    ) -> models.Task:
        agent_id_to_use = agent_id
        task_number = self.get_next_task_number_for_project(project_id)
        task_data_for_model = task.model_dump(
            exclude_unset=True, exclude={'agent_name'}
        )
        task_data_for_model['agent_id'] = agent_id_to_use
        task_data_for_model['project_id'] = str(project_id)
        task_data_for_model['task_number'] = task_number
        if 'status' not in task_data_for_model or not task_data_for_model['status']:
            task_data_for_model['status'] = 'To Do'
        db_task = models.Task(**task_data_for_model)
        self.db.add(db_task)
        self.db.commit()
        self.db.refresh(db_task)
        return db_task

    def update_task(
        self,
        project_id: UUID,
        task_number: int,
        task_update: schemas.TaskUpdate,
    ) -> Optional[models.Task]:
        db_task = self.get_task(
            project_id=project_id, task_number=task_number, is_archived=None
        )
        if not db_task:
            return None
        update_data = task_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_task, field, value)
        if not db_task.status:
            db_task.status = 'To Do'
        db_task.updated_at = datetime.datetime.now(datetime.timezone.utc)
        self.db.commit()
        self.db.refresh(db_task)
        return db_task

    def delete_task(self, project_id: UUID, task_number: int) -> bool:
        db_task = self.get_task(
            project_id=project_id, task_number=task_number, is_archived=None
        )
        if db_task:
            self.db.delete(db_task)
            self.db.commit()
            return True
        return False

    def archive_task(
        self,
        project_id: UUID,
        task_number: int
    ) -> Optional[models.Task]:
        task = self.get_task(project_id, task_number, is_archived=None)
        if not task:
            return None
        if task.is_archived:
            return task
        task.is_archived = True
        task.updated_at = datetime.datetime.now(datetime.timezone.utc)
        self.db.commit()
        self.db.refresh(task)
        return task

    def unarchive_task(
        self,
        project_id: UUID,
        task_number: int
    ) -> Optional[models.Task]:
        task = self.get_task(project_id, task_number, is_archived=None)
        if not task:
            return None
        if not task.is_archived:
            return task
        task.is_archived = False
        task.updated_at = datetime.datetime.now(datetime.timezone.utc)
        self.db.commit()
        self.db.refresh(task)
        return task

    def add_dependency(
        self,
        predecessor_project_id: UUID,
        predecessor_task_number: int,
        successor_project_id: UUID,
        successor_task_number: int
    ) -> Optional[models.TaskDependency]:
        predecessor_task = self.get_task(
            predecessor_project_id, predecessor_task_number, is_archived=None
        )
        successor_task = self.get_task(
            successor_project_id, successor_task_number, is_archived=None
        )
        if not predecessor_task or not successor_task:
            return None  # Or raise a specific exception
        existing_dependency = self.db.query(models.TaskDependency).filter(
            models.TaskDependency.predecessor_project_id == str(
                predecessor_project_id),
            models.TaskDependency.predecessor_task_number == predecessor_task_number,
            models.TaskDependency.successor_project_id == str(
                successor_project_id),
            models.TaskDependency.successor_task_number == successor_task_number,
        ).first()
        if existing_dependency:
            return existing_dependency  # Dependency already exists
        db_dependency = models.TaskDependency(
            predecessor_project_id=str(predecessor_project_id),
            predecessor_task_number=predecessor_task_number,
            successor_project_id=str(successor_project_id),
            successor_task_number=successor_task_number,
        )
        self.db.add(db_dependency)
        self.db.commit()
        self.db.refresh(db_dependency)
        return db_dependency

    def remove_dependency(
        self,
        predecessor_project_id: UUID,
        predecessor_task_number: int,
        successor_project_id: UUID,
        successor_task_number: int
    ) -> bool:
        db_dependency = self.db.query(models.TaskDependency).filter(
            models.TaskDependency.predecessor_project_id == str(
                predecessor_project_id),
            models.TaskDependency.predecessor_task_number == predecessor_task_number,
            models.TaskDependency.successor_project_id == str(
                successor_project_id),
            models.TaskDependency.successor_task_number == successor_task_number,
        ).first()
        if db_dependency:
            self.db.delete(db_dependency)
            self.db.commit()
            return True
        return False

    def get_task_dependencies(
        self, project_id: UUID, task_number: int
    ) -> List[models.TaskDependency]:
        query = self.db.query(models.TaskDependency).filter(
            or_(
                (
                    models.TaskDependency.predecessor_project_id == str(
                        project_id),
                    models.TaskDependency.predecessor_task_number == task_number
                ),
                (
                    models.TaskDependency.successor_project_id == str(
                        project_id),
                    models.TaskDependency.successor_task_number == task_number
                )
            )
        )
        return query.all()

    def update_task_status(
        self, project_id: UUID, task_number: int, status: str
    ) -> Optional[models.Task]:
        db_task = self.get_task(
            project_id=project_id, task_number=task_number, is_archived=None
        )
        if not db_task:
            return None
        db_task.status = status
        db_task.updated_at = datetime.datetime.now(datetime.timezone.utc)
        self.db.commit()
        self.db.refresh(db_task)
        return db_task

    def assign_task_to_agent(
        self, project_id: UUID, task_number: int, agent_id: str
    ) -> Optional[models.Task]:
        db_task = self.get_task(
            project_id=project_id, task_number=task_number, is_archived=None
        )
        if not db_task:
            return None
        db_task.agent_id = agent_id
        db_task.updated_at = datetime.datetime.now(datetime.timezone.utc)
        self.db.commit()
        self.db.refresh(db_task)
        return db_task

    def unassign_task(
        self, project_id: UUID, task_number: int
    ) -> Optional[models.Task]:
        db_task = self.get_task(
            project_id=project_id, task_number=task_number, is_archived=None
        )
        if not db_task:
            return None
        db_task.agent_id = None
        db_task.updated_at = datetime.datetime.now(datetime.timezone.utc)
        self.db.commit()
        self.db.refresh(db_task)
        return db_task

    def associate_file_with_task(
        self, project_id: UUID, task_number: int, file_id: str
    ) -> Optional[models.TaskFileAssociation]:
        task = self.get_task(project_id, task_number, is_archived=None)
        if not task:
            return None  # Or raise a specific exception
        existing_association = self.db.query(models.TaskFileAssociation).filter(
            models.TaskFileAssociation.project_id == str(project_id),
            models.TaskFileAssociation.task_number == task_number,
            models.TaskFileAssociation.file_id == file_id,
        ).first()
        if existing_association:
            return existing_association  # Association already exists
        db_association = models.TaskFileAssociation(
            project_id=str(project_id),
            task_number=task_number,
            file_id=file_id,
        )
        self.db.add(db_association)
        self.db.commit()
        self.db.refresh(db_association)
        return db_association

    def disassociate_file_from_task(
        self, project_id: UUID, task_number: int, file_id: str
    ) -> bool:
        db_association = self.db.query(models.TaskFileAssociation).filter(
            models.TaskFileAssociation.project_id == str(project_id),
            models.TaskFileAssociation.task_number == task_number,
            models.TaskFileAssociation.file_id == file_id,
        ).first()
        if db_association:
            self.db.delete(db_association)
            self.db.commit()
            return True
        return False

    def get_task_files(
        self, project_id: UUID, task_number: int
    ) -> List[models.TaskFileAssociation]:
        query = self.db.query(models.TaskFileAssociation).filter(
            models.TaskFileAssociation.project_id == str(project_id),
            models.TaskFileAssociation.task_number == task_number,
        )
        return query.all()

    def add_comment_to_task(
        self, project_id: UUID, task_number: int, author_id: str, content: str
    ) -> Optional[models.Comment]:
        task = self.get_task(project_id, task_number, is_archived=None)
        if not task:
            return None  # Or raise a specific exception
        db_comment = models.Comment(
            project_id=str(project_id),
            task_number=task_number,
            author_id=author_id,
            content=content,
        )
        self.db.add(db_comment)
        self.db.commit()
        self.db.refresh(db_comment)
        return db_comment

    def get_task_comments(
        self, project_id: UUID, task_number: int, skip: int = 0, limit: int = 100, sort_by: Optional[str] = 'created_at', sort_direction: Optional[str] = 'asc'
    ) -> List[models.Comment]:
        """
        Retrieve comments for a task, with optional pagination and sorting.
        sort_by: 'created_at' (default)
        sort_direction: 'asc' or 'desc'
        """
        query = self.db.query(models.Comment).filter(
            models.Comment.project_id == str(project_id),
            models.Comment.task_number == task_number,
        )
        allowed_sort_fields = {
            'created_at': models.Comment.created_at
        }
        sort_field = allowed_sort_fields.get(
            sort_by, models.Comment.created_at)
        if sort_direction and sort_direction.lower() == 'desc':
            query = query.order_by(sort_field.desc())
        else:
            query = query.order_by(sort_field.asc())
        query = query.offset(skip).limit(limit)
        return query.all()

    def get_files_for_task(self, task_project_id: UUID, task_number: int, skip: int = 0, limit: int = 100, sort_by: Optional[str] = None, sort_direction: Optional[str] = None, filename: Optional[str] = None) -> List[models.TaskFileAssociation]:
        """
        Retrieve files associated with a task, with optional filtering by filename and sorting.
        sort_by: 'filename', 'created_at' (if available)
        sort_direction: 'asc' or 'desc'
        """
        query = self.db.query(models.TaskFileAssociation).filter(
            models.TaskFileAssociation.project_id == str(task_project_id),
            models.TaskFileAssociation.task_number == task_number,
        )
        if filename:
            query = query.filter(
                models.TaskFileAssociation.file_id.ilike(f"%{filename}%"))
        allowed_sort_fields = {
            # Assuming file_id is a filename or can be joined for filename
            'filename': models.TaskFileAssociation.file_id,
            'created_at': getattr(models.TaskFileAssociation, 'created_at', None)
        }
        sort_field = allowed_sort_fields.get(sort_by, None)
        if sort_field is not None:
            if sort_direction and sort_direction.lower() == 'asc':
                query = query.order_by(sort_field.asc())
            else:
                query = query.order_by(sort_field.desc())
        query = query.offset(skip).limit(limit)
        return query.all()

    def get_dependencies_for_task(self, task_project_id: UUID, task_number: int, sort_by: Optional[str] = None, sort_direction: Optional[str] = None, dependency_type: Optional[str] = None) -> List[models.TaskDependency]:
        """
        Retrieve dependencies for a task, with optional sorting and filtering by type.
        sort_by: 'predecessor_task_number', 'successor_task_number'
        sort_direction: 'asc' or 'desc'
        dependency_type: not used unless you have a type field
        """
        query = self.db.query(models.TaskDependency).filter(
            (models.TaskDependency.predecessor_project_id == str(task_project_id) & (models.TaskDependency.predecessor_task_number == task_number)) |
            (models.TaskDependency.successor_project_id == str(task_project_id)
             & (models.TaskDependency.successor_task_number == task_number))
        )
        allowed_sort_fields = {
            'predecessor_task_number': models.TaskDependency.predecessor_task_number,
            'successor_task_number': models.TaskDependency.successor_task_number
        }
        sort_field = allowed_sort_fields.get(sort_by, None)
        if sort_field is not None:
            if sort_direction and sort_direction.lower() == 'asc':
                query = query.order_by(sort_field.asc())
            else:
                query = query.order_by(sort_field.desc())
        return query.all()

    def get_predecessor_tasks(self, task_project_id: UUID, task_number: int, sort_by: Optional[str] = None, sort_direction: Optional[str] = None, dependency_type: Optional[str] = None) -> List[models.TaskDependency]:
        """
        Retrieve predecessor dependencies for a task, with optional sorting and filtering by type.
        sort_by: 'predecessor_task_number'
        sort_direction: 'asc' or 'desc'
        dependency_type: not used unless you have a type field
        """
        query = self.db.query(models.TaskDependency).filter(
            models.TaskDependency.successor_project_id == str(task_project_id),
            models.TaskDependency.successor_task_number == task_number
        )
        allowed_sort_fields = {
            'predecessor_task_number': models.TaskDependency.predecessor_task_number
        }
        sort_field = allowed_sort_fields.get(sort_by, None)
        if sort_field is not None:
            if sort_direction and sort_direction.lower() == 'asc':
                query = query.order_by(sort_field.asc())
            else:
                query = query.order_by(sort_field.desc())
        return query.all()

    def get_successor_tasks(self, task_project_id: UUID, task_number: int, sort_by: Optional[str] = None, sort_direction: Optional[str] = None, dependency_type: Optional[str] = None) -> List[models.TaskDependency]:
        """
        Retrieve successor dependencies for a task, with optional sorting and filtering by type.
        sort_by: 'successor_task_number'
        sort_direction: 'asc' or 'desc'
        dependency_type: not used unless you have a type field
        """
        query = self.db.query(models.TaskDependency).filter(
            models.TaskDependency.predecessor_project_id == str(
                task_project_id),
            models.TaskDependency.predecessor_task_number == task_number
        )
        allowed_sort_fields = {
            'successor_task_number': models.TaskDependency.successor_task_number
        }
        sort_field = allowed_sort_fields.get(sort_by, None)
        if sort_field is not None:
            if sort_direction and sort_direction.lower() == 'asc':
                query = query.order_by(sort_field.asc())
            else:
                query = query.order_by(sort_field.desc())
        return query.all()
