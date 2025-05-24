# Task ID: Generated
# Agent Role: Agent (FixingCircularImports)
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-24T12:00:00Z

"""
CRUD operations for users.
"""

from sqlalchemy.orm import Session
from .. import models
# from .. import models, schemas # Removed schemas import
from backend.schemas.user import UserCreate, UserUpdate # Direct import
from typing import List, Optional
import uuid

# Import validation helpers
from .user_validation import username_exists


def create_user(db: Session, user: UserCreate) -> models.User:
    # Check if username already exists using the validation helper
    if username_exists(db, user.username):
        raise ValueError(f"Username '{user.username}' already exists")

    # In a real app, you'd hash the password here
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = models.User(username=user.username,
                          hashed_password=fake_hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user(db: Session, user_id: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.username == username).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    return db.query(models.User).offset(skip).limit(limit).all()


def update_user(db: Session, user_id: str, user_update: UserUpdate) -> Optional[models.User]:
    db_user = get_user(db, user_id)  # Use the get_user function within CRUD
    if db_user:
        update_data = user_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: str) -> Optional[models.User]:
    db_user = get_user(db, user_id)  # Use the get_user function within CRUD
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user
