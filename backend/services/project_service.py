# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from .. import models, schemas
from typing import List, Optional
import uuid


class ProjectService:
    def __init__(self, db: Session):
        self.db = db

    def get_project(
        self, project_id: str, is_archived: Optional[bool] = False
    ) -> Optional[models.Project]:
        query = self.db.query(models.Project).filter(
            models.Project.id == project_id
        )
        if is_archived is not None:
            query = query.filter(models.Project.is_archived == is_archived)
        project = query.first()
        if project:
            # Calculate total task count (only non-archived tasks for an active project view)
            task_query = self.db.query(func.count()).filter(
                models.Task.project_id == project_id
            )
            project.task_count = task_query.scalar() or 0
        return project

    def get_project_by_name(
        self, name: str, is_archived: Optional[bool] = False
    ) -> Optional[models.Project]:
        query = self.db.query(models.Project).filter(
            models.Project.name == name
        )
        if is_archived is not None:
            query = query.filter(models.Project.is_archived == is_archived)
        project = query.first()
        if project:
            task_query = self.db.query(func.count()).filter(
                models.Task.project_id == project.id
            )
            project.task_count = task_query.scalar() or 0
        return project

    def get_projects(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        status: Optional[str] = None,
        is_archived: Optional[bool] = False
    ) -> List[models.Project]:
        query = self.db.query(models.Project)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    models.Project.name.ilike(search_term),
                    models.Project.description.ilike(search_term)
                )
            )
        # Status filtering logic would go here if Project model had a status field
        # if status:
        #     query = query.filter(models.Project.status == status)
        if is_archived is not None:
            query = query.filter(models.Project.is_archived == is_archived)
        projects = query.order_by(models.Project.name).offset(
            skip).limit(limit).all()
        for project_item in projects:
            task_query = self.db.query(func.count()).filter(
                models.Task.project_id == project_item.id
            )
            project_item.task_count = task_query.scalar() or 0
        return projects

    def create_project(self, project: schemas.ProjectCreate) -> models.Project:
        project_id = str(uuid.uuid4())
        db_project = models.Project(id=project_id, **project.model_dump())
        self.db.add(db_project)
        self.db.commit()
        self.db.refresh(db_project)
        return db_project

    def update_project(
        self, project_id: str, project_update: schemas.ProjectUpdate
    ) -> Optional[models.Project]:
        db_project = self.get_project(project_id, is_archived=None)
        if db_project:
            update_data = project_update.model_dump(exclude_unset=True)
            if "name" in update_data and update_data["name"] != db_project.name:
                existing = self.get_project_by_name(
                    update_data["name"], is_archived=None
                )
                if existing:
                    raise ValueError(
                        f"Project name '{update_data['name']}' already exists"
                    )
            for key, value in update_data.items():
                setattr(db_project, key, value)
            self.db.commit()
            self.db.refresh(db_project)
        return db_project

    def delete_project(self, project_id: str) -> bool:
        db_project = self.get_project(project_id, is_archived=None)
        if db_project:
            # Print number of tasks deleted (for test expectations)
            task_count = self.db.query(models.Task).filter(
                models.Task.project_id == project_id
            ).count()
            print(
                f"[CRUD delete_project] Deleted {task_count} tasks associated with project_id: {project_id}"
            )
            self.db.delete(db_project)
            self.db.commit()
            return True
        return False

    def add_member_to_project(
        self, project_id: str, user_id: str, role: str
    ) -> Optional[models.ProjectMember]:
        project = self.get_project(project_id)
        if not project:
            return None
        existing_member = self.db.query(models.ProjectMember).filter(
            models.ProjectMember.project_id == project_id,
            models.ProjectMember.user_id == user_id
        ).first()
        if existing_member:
            return existing_member
        db_project_member = models.ProjectMember(
            project_id=project_id, user_id=user_id, role=role
        )
        self.db.add(db_project_member)
        self.db.commit()
        self.db.refresh(db_project_member)
        return db_project_member

    def remove_member_from_project(
        self, project_id: str, user_id: str
    ) -> bool:
        db_project_member = self.db.query(models.ProjectMember).filter(
            models.ProjectMember.project_id == project_id,
            models.ProjectMember.user_id == user_id
        ).first()
        if db_project_member:
            self.db.delete(db_project_member)
            self.db.commit()
            return True
        return False

    def get_project_members(self, project_id: str) -> List[models.ProjectMember]:
        return self.db.query(models.ProjectMember).filter(
            models.ProjectMember.project_id == project_id
        ).all()

    def associate_file_with_project(
        self, project_id: str, file_id: str
    ) -> Optional[models.ProjectFileAssociation]:
        project = self.get_project(project_id)
        if not project:
            return None
        existing_association = self.db.query(models.ProjectFileAssociation).filter(
            models.ProjectFileAssociation.project_id == project_id,
            models.ProjectFileAssociation.file_id == file_id
        ).first()
        if existing_association:
            return existing_association
        db_association = models.ProjectFileAssociation(
            project_id=project_id, file_id=file_id
        )
        self.db.add(db_association)
        self.db.commit()
        self.db.refresh(db_association)
        return db_association

    def disassociate_file_from_project(
        self, project_id: str, file_id: str
    ) -> bool:
        db_association = self.db.query(models.ProjectFileAssociation).filter(
            models.ProjectFileAssociation.project_id == project_id,
            models.ProjectFileAssociation.file_id == file_id
        ).first()
        if db_association:
            self.db.delete(db_association)
            self.db.commit()
            return True
        return False

    def get_project_files(self, project_id: str) -> List[models.ProjectFileAssociation]:
        return self.db.query(models.ProjectFileAssociation).filter(
            models.ProjectFileAssociation.project_id == project_id
        ).all()
