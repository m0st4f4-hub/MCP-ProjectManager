# Task ID: 211  # Agent Role: ImplementationSpecialist  # Request ID: (Inherited from Overmind)  # Project: task-manager  # Timestamp: 2025-05-09T21:00:00Z  # from sqlalchemy.orm import Session  # Removed synchronous Session import
from sqlalchemy import (
    and_,
    select,
    delete,
    update  # Import necessary for async operations
)
from typing import List, Optional
from ..models import ProjectMember  # from schemas import ProjectMemberCreate, ProjectMemberUpdate  # Removed package import
from schemas.project import ProjectMemberCreate, ProjectMemberUpdate
from .project_member_validation import member_exists  # Assuming member_exists is async or will be handled
from sqlalchemy.ext.asyncio import AsyncSession  # Import AsyncSession  # Assuming member_exists is now async or will be awaited appropriately where called
from sqlalchemy.orm import selectinload

async def get_project_member(db: AsyncSession, project_id: str, user_id: str) -> Optional[ProjectMember]:
    """Get a specific project member by project_id and user_id."""
    stmt = (
        select(ProjectMember)
        .options(selectinload(ProjectMember.user), selectinload(ProjectMember.project))
        .filter(and_(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id))
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_project_members(db: AsyncSession, project_id: str, skip: int = 0, limit: int = 100) -> List[ProjectMember]:
    """Get all members of a project."""
    stmt = (
        select(ProjectMember)
        .options(selectinload(ProjectMember.user), selectinload(ProjectMember.project))
        .filter(ProjectMember.project_id == project_id)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

async def get_user_projects(db: AsyncSession, user_id: str, skip: int = 0, limit: int = 100) -> List[ProjectMember]:
    """Get all projects a user is a member of."""
    stmt = (
        select(ProjectMember)
        .options(selectinload(ProjectMember.project), selectinload(ProjectMember.user))
        .filter(ProjectMember.user_id == user_id)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

async def add_project_member(db: AsyncSession, project_member: ProjectMemberCreate) -> ProjectMember:
    """Add a user to a project with a specific role. Checks if member already exists."""  # Assuming member_exists is async or will be awaited where called
    member_already_exists = await member_exists(db, project_member.project_id, project_member.user_id)
    if member_already_exists:  # Await the async get function
        return await get_project_member(db, project_member.project_id, project_member.user_id)

    db_project_member = ProjectMember(
    project_id=project_member.project_id,
    user_id=project_member.user_id,
    role=project_member.role
    )
    db.add(db_project_member)
    await db.commit()  # Use await db.commit()
    await db.refresh(db_project_member)  # Use await db.refresh()
    return db_project_member

async def update_project_member(db: AsyncSession, project_id: str, user_id: str, project_member_update: ProjectMemberUpdate) -> Optional[ProjectMember]:
    """Update a project member's role."""  # Await the async get function
    db_project_member = await get_project_member(db, project_id, user_id)
    if db_project_member:
        update_data = project_member_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_project_member, field, value)
            await db.commit()  # Use await db.commit()
            await db.refresh(db_project_member)  # Use await db.refresh()
            return db_project_member

async def delete_project_member(db: AsyncSession, project_id: str, user_id: str) -> bool:
            """Remove a user from a project."""  # Await the async get function
            db_project_member = await get_project_member(db, project_id, user_id)
            if db_project_member:
                await db.delete(db_project_member)  # Use await db.delete()
                await db.commit()  # Use await db.commit()
                return True
            return False
