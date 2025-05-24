# Task ID: 211
# Agent Role: Agent 1
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-09T21:00:00Z

from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from ..models import ProjectMember
from backend.schemas import ProjectMemberCreate, ProjectMemberUpdate
from .project_member_validation import member_exists


def get_project_member(db: Session, project_id: str, user_id: str) -> Optional[ProjectMember]:
    """Get a specific project member by project_id and user_id."""
    return db.query(ProjectMember).filter(
        and_(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id)
    ).first()


def get_project_members(db: Session, project_id: str, skip: int = 0, limit: int = 100) -> List[ProjectMember]:
    """Get all members of a project."""
    return db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).offset(skip).limit(limit).all()


def get_user_projects(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[ProjectMember]:
    """Get all projects a user is a member of."""
    return db.query(ProjectMember).filter(
        ProjectMember.user_id == user_id
    ).offset(skip).limit(limit).all()


def add_project_member(db: Session, project_member: ProjectMemberCreate) -> ProjectMember:
    """Add a user to a project with a specific role. Checks if member already exists."""
    if member_exists(db, project_member.project_id, project_member.user_id):
        return get_project_member(db, project_member.project_id, project_member.user_id)

    db_project_member = ProjectMember(
        project_id=project_member.project_id,
        user_id=project_member.user_id,
        role=project_member.role
    )
    db.add(db_project_member)
    db.commit()
    db.refresh(db_project_member)
    return db_project_member


def update_project_member(db: Session, project_id: str, user_id: str, project_member_update: ProjectMemberUpdate) -> Optional[ProjectMember]:
    """Update a project member's role."""
    db_project_member = get_project_member(db, project_id, user_id)
    if db_project_member:
        update_data = project_member_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_project_member, field, value)
        db.commit()
        db.refresh(db_project_member)
    return db_project_member


def delete_project_member(db: Session, project_id: str, user_id: str) -> bool:
    """Remove a user from a project."""
    db_project_member = get_project_member(db, project_id, user_id)
    if db_project_member:
        db.delete(db_project_member)
        db.commit()
        return True
    return False
