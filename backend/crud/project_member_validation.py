# Task ID: 211
# Agent Role: ImplementationSpecialist
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-09T21:00:00Z

"""
Project member validation functions.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, select
from typing import Optional
from ..models import User, Project, ProjectMember
from backend.schemas.project import ProjectMemberCreate, ProjectMemberUpdate
from sqlalchemy.ext.asyncio import AsyncSession


def user_exists(db: Session, user_id: str) -> bool:
 """
 Returns True if the user exists.
 """
 return db.query(User).filter(User.id == user_id).first() is not None


def project_exists(db: Session, project_id: str) -> bool:
 """
 Returns True if the project exists.
 """
 return db.query(Project).filter(Project.id == project_id).first() is not None


async def member_exists(db: AsyncSession, project_id: str, user_id: str) -> bool:
 """
 Returns True if a project member association already exists.
 """
 result = await db.execute(
 select(ProjectMember).filter(
 and_(
 ProjectMember.project_id == project_id,
 ProjectMember.user_id == user_id
 )
 )
 )
 return result.scalar_one_or_none() is not None
