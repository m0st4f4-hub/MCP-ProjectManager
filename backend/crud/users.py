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

# Import password hashing library
from passlib.context import CryptContext

# Configure password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Import validation helpers
from .user_validation import username_exists

# Import UserRoleEnum for default role assignment
from backend.enums import UserRoleEnum

# Helper function to verify passwords
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

# Helper function to get password hash
def get_password_hash(password: str) -> str:
    """Get the hash for a given password."""
    return pwd_context.hash(password)

def create_user(db: Session, user: UserCreate) -> models.User:
    # Add checks for existing email and username
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise ValueError("Email already registered")
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise ValueError("Username already exists")

    # Hash the password before storing
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username,
                          hashed_password=hashed_password)
    
    # Assign a default role (e.g., USER) to the new user
    default_role = models.UserRole(user=db_user, role_name=UserRoleEnum.USER)
    db_user.user_roles.append(default_role) # Associate role with user

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
        
        # Check for duplicate email if email is being updated
        if "email" in update_data and update_data["email"] != db_user.email:
            existing_user_with_email = db.query(models.User).filter(models.User.email == update_data["email"]).first()
            if existing_user_with_email and existing_user_with_email.id != user_id:
                raise ValueError(f"Email '{update_data["email"]}' already exists for another user")
                
        # Check for duplicate username if username is being updated
        if "username" in update_data and update_data["username"] != db_user.username:
             existing_user_with_username = db.query(models.User).filter(models.User.username == update_data["username"]).first()
             if existing_user_with_username and existing_user_with_username.id != user_id:
                 raise ValueError(f"Username '{update_data["username"]}' already exists for another user")

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

def authenticate_user(db: Session, username: str, password: str) -> Optional[models.User]:
    """Authenticate a user by username and password."""
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
