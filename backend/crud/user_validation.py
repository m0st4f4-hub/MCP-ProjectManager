# Task ID: Generated
# Agent Role: Agent (FixingCircularImports)
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-24T12:00:00Z

"""
User-related validation functions.
"""

from sqlalchemy.orm import Session
from .utils.user_utils import username_exists_check


def username_exists(db: Session, username: str) -> bool:
    """
    Returns True if a user with the given username already exists.
    """
    return username_exists_check(db, username)
