# Task ID: Generated
# Agent Role: Agent (FixingCircularImports)
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-24T12:00:00Z

"""
Project member validation functions.
"""

from sqlalchemy.orm import Session
from ..models import User, Project, ProjectMember


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


def member_exists(db: Session, project_id: str, user_id: str) -> bool:
    """
    Returns True if a project member association already exists.
    """
    return db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first() is not None
