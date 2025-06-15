from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, and_, or_
from typing import List, Optional, Tuple
import uuid
from datetime import datetime
from uuid import UUID

from backend import models
from backend.schemas.project import ProjectCreate, ProjectUpdate
from backend.enums import ProjectStatus, ProjectPriority, ProjectVisibility
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

    async def get_project_by_name(self, name: str) -> Optional[models.Project]:
        result = await self.db.execute(
            select(models.Project).filter(models.Project.name == name)
        )
        return result.scalar_one_or_none()

    async def create_project(self, project_data: ProjectCreate) -> models.Project:
        # Hardcode owner_id for single-user mode
        owner_id = "00000000-0000-0000-0000-000000000000"  # Placeholder UUID

        existing_project = await self.get_project_by_name(project_data.name)
        if existing_project:
            raise DuplicateEntityError("Project", project_data.name)

        db_project = models.Project(
            **project_data.model_dump(),
            owner_id=owner_id,
            id=str(uuid.uuid4())
        )
        self.db.add(db_project)
        await self.db.commit()
        await self.db.refresh(db_project)
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

    async def delete_project(self, project_id: str) -> bool:
        db_project = await self.get_project(project_id)
        if not db_project:
            return False
        await self.db.delete(db_project)
        await self.db.commit()
        return True
