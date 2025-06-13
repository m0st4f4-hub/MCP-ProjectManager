from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, and_, or_
from typing import List, Optional, Tuple
import uuid
from datetime import datetime

from .. import models
from ..schemas.project import ProjectCreate, ProjectUpdate, ProjectMemberCreate, ProjectMemberUpdate
from ..enums import ProjectStatus, ProjectPriority, ProjectVisibility
from .exceptions import EntityNotFoundError, DuplicateEntityError, ValidationError
from .utils import service_transaction

class ProjectService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_project(self, project_id: str) -> models.Project:
        query = select(models.Project).where(models.Project.id == project_id).options(
            selectinload(models.Project.owner),
            selectinload(models.Project.members).selectinload(models.ProjectMember.user)
        )
        result = await self.db.execute(query)
        project = result.scalar_one_or_none()
        if not project:
            raise EntityNotFoundError("Project", project_id)
        return project

    async def get_projects(
        self, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[ProjectStatus] = None,
        priority: Optional[ProjectPriority] = None,
        visibility: Optional[ProjectVisibility] = None,
        search: Optional[str] = None,
        is_archived: Optional[bool] = None,
        owner_id: Optional[str] = None,
        sort_by: Optional[str] = "created_at",
        sort_direction: Optional[str] = "desc"
    ) -> Tuple[List[models.Project], int]:
        # Build the base query
        query = select(models.Project).options(
            selectinload(models.Project.owner),
            selectinload(models.Project.members).selectinload(models.ProjectMember.user)
        )
        
        # Count query for total
        count_query = select(func.count(models.Project.id))
        
        conditions = []
        
        # Filter by status
        if status is not None:
            conditions.append(models.Project.status == status)
            
        # Filter by priority
        if priority is not None:
            conditions.append(models.Project.priority == priority)
            
        # Filter by visibility
        if visibility is not None:
            conditions.append(models.Project.visibility == visibility)
            
        # Filter by archived status
        if is_archived is not None:
            conditions.append(models.Project.is_archived == is_archived)
            
        # Filter by owner
        if owner_id is not None:
            conditions.append(models.Project.owner_id == owner_id)
            
        # Search in name and description
        if search:
            search_condition = or_(
                models.Project.name.ilike(f"%{search}%"),
                models.Project.description.ilike(f"%{search}%")
            )
            conditions.append(search_condition)
        
        # Apply all conditions
        if conditions:
            query = query.where(and_(*conditions))
            count_query = count_query.where(and_(*conditions))
        
        # Apply sorting
        sort_column = getattr(models.Project, sort_by, models.Project.created_at)
        if sort_direction.lower() == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        # Execute queries
        result = await self.db.execute(query)
        projects = result.scalars().all()
        
        count_result = await self.db.execute(count_query)
        total_count = count_result.scalar()
        
        return projects, total_count

    @service_transaction
    async def create_project(self, project_data: ProjectCreate, created_by: models.User) -> models.Project:
        existing_project_query = select(models.Project).where(models.Project.name == project_data.name)
        result = await self.db.execute(existing_project_query)
        if result.scalar_one_or_none():
            raise DuplicateEntityError("Project", project_data.name)

        db_project = models.Project(
            **project_data.model_dump(exclude={"owner_id"}),
            id=str(uuid.uuid4()),
            owner_id=created_by.id,
            created_by=created_by.id
        )
        self.db.add(db_project)
        await self.db.flush()

        # Add creator as owner
        owner_member = models.ProjectMember(
            project_id=db_project.id,
            user_id=created_by.id,
            role='owner'
        )
        self.db.add(owner_member)
        await self.db.flush()
        
        await self.db.refresh(db_project, attribute_names=['owner', 'members'])
        # Manually refresh the user relationship on the new member
        await self.db.refresh(owner_member, attribute_names=['user'])

        return db_project

    @service_transaction
    async def update_project(self, project_id: str, project_update: ProjectUpdate) -> models.Project:
        db_project = await self.get_project(project_id)
        
        update_data = project_update.model_dump(exclude_unset=True)
        if not update_data:
            raise ValidationError("No fields to update.")

        for key, value in update_data.items():
            setattr(db_project, key, value)
            
        await self.db.flush()
        await self.db.refresh(db_project)
        return db_project

    @service_transaction
    async def archive_project(self, project_id: str) -> models.Project:
        db_project = await self.get_project(project_id)
        db_project.is_archived = True
        db_project.archived_at = datetime.utcnow()
        db_project.status = ProjectStatus.ARCHIVED
        
        await self.db.flush()
        await self.db.refresh(db_project)
        return db_project

    @service_transaction
    async def unarchive_project(self, project_id: str) -> models.Project:
        db_project = await self.get_project(project_id)
        db_project.is_archived = False
        db_project.archived_at = None
        db_project.status = ProjectStatus.ACTIVE  # Reset to active when unarchiving
        
        await self.db.flush()
        await self.db.refresh(db_project)
        return db_project

    @service_transaction
    async def delete_project(self, project_id: str):
        db_project = await self.get_project(project_id)
        await self.db.delete(db_project)
        await self.db.flush()
        return {"message": "Project deleted successfully"}

    @service_transaction
    async def add_member(self, project_id: str, member_data: ProjectMemberCreate) -> models.ProjectMember:
        # Ensure project and user exist
        await self.get_project(project_id)
        # TODO: Add user existence check
        
        new_member = models.ProjectMember(**member_data.model_dump())
        self.db.add(new_member)
        await self.db.flush()
        await self.db.refresh(new_member, attribute_names=['user'])
        return new_member

    @service_transaction
    async def remove_member(self, project_id: str, user_id: str):
        query = select(models.ProjectMember).where(
            models.ProjectMember.project_id == project_id,
            models.ProjectMember.user_id == user_id
        )
        result = await self.db.execute(query)
        member = result.scalar_one_or_none()
        
        if not member:
            raise EntityNotFoundError("Project Member", f"user_id: {user_id}")

        if member.role == 'owner':
            raise ValidationError("Cannot remove the project owner.")

        await self.db.delete(member)
        await self.db.flush()
        return {"message": "Member removed successfully"}

    async def get_members(self, project_id: str) -> List[models.ProjectMember]:
        query = select(models.ProjectMember).where(models.ProjectMember.project_id == project_id).options(
            selectinload(models.ProjectMember.user)
        )
        result = await self.db.execute(query)
        return result.scalars().all()
