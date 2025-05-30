# Task ID: Generated
# Agent Role: Agent (FixingCircularImports)
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-24T12:00:00Z

"""
User-related utility functions to avoid circular imports.
"""

from sqlalchemy.orm import Session
from backend.models import User


def username_exists_check(db: Session, username: str) -> bool:
 """
 Returns True if a user with the given username already exists.
 """
 return db.query(User).filter(User.username == username).first() is not None
