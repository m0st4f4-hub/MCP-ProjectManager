"""
CRUD operations for users.
"""

from sqlalchemy.orm import Session
from .. import models  # from .. import models, schemas  # Removed schemas import
from backend.schemas.user import UserCreate, UserUpdate  # Direct import
from typing import List, Optional
import uuid
from passlib.context import CryptContext
from .user_validation import username_exists
from backend.enums import UserRoleEnum
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload

# --------------------------------------------------------------------------- #
# Password utilities
# --------------------------------------------------------------------------- #
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a plain-text password."""
    return pwd_context.hash(password)

# --------------------------------------------------------------------------- #
# CRUD operations
# --------------------------------------------------------------------------- #
async def create_user(db: AsyncSession, user: UserCreate) -> models.User:
    """Create a new user with role assignments and hashed password."""
    # Check for duplicate email
    result_email = await db.execute(
        select(models.User).filter(models.User.email == user.email)
    )
    db_user = result_email.scalar_one_or_none()
    if db_user:
        raise ValueError("Email already registered")

    # Check for duplicate username
    result_username = await db.execute(
        select(models.User).filter(models.User.username == user.username)
    )
    db_user = result_username.scalar_one_or_none()
    if db_user:
        raise ValueError("Username already exists")

    # Persist new user
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        hashed_password=hashed_password,
        email=user.email,
        full_name=user.full_name,
        disabled=user.disabled,
    )

    # Assign roles
    for role_name_str in user.roles:
        try:
            role_enum = UserRoleEnum(role_name_str)
            db_user_role = models.UserRole(user=db_user, role_name=role_enum)
            db_user.user_roles.append(db_user_role)
        except ValueError:
            # Skip invalid roles (or log if needed)
            print(f"Warning: Invalid role name provided: {role_name_str}")

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def get_user(db: AsyncSession, user_id: str) -> Optional[models.User]:
    result = await db.execute(select(models.User).filter(models.User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_username(
    db: AsyncSession, username: str
) -> Optional[models.User]:
    result = await db.execute(
        select(models.User)
        .filter(models.User.username == username)
        .options(joinedload(models.User.user_roles))
    )
    return result.unique().scalar_one_or_none()


async def get_users(
    db: AsyncSession, skip: int = 0, limit: int = 100
) -> List[models.User]:
    result = await db.execute(select(models.User).offset(skip).limit(limit))
    return result.scalars().all()


async def update_user(
    db: AsyncSession, user_id: str, user_update: UserUpdate
) -> Optional[models.User]:
    db_user = await get_user(db, user_id)
    if not db_user:
        return None

    update_data = user_update.model_dump(exclude_unset=True)

    # ----------------------------------------------------------------------- #
    # Conflict-free validation
    # ----------------------------------------------------------------------- #
    if (
        "email" in update_data
        and update_data["email"] is not None
        and update_data["email"] != db_user.email
    ):
        result_existing_email = await db.execute(
            select(models.User).filter(models.User.email == update_data["email"])
        )
        existing_user_with_email = result_existing_email.scalar_one_or_none()
        if existing_user_with_email and existing_user_with_email.id != user_id:
            raise ValueError(
                f"Email '{update_data['email']}' already exists for another user"
            )

    # Check for duplicate username if username is being updated
    if (
        "username" in update_data
        and update_data["username"] is not None
        and update_data["username"] != db_user.username
    ):
        result_existing_username = await db.execute(
            select(models.User).filter(models.User.username == update_data["username"])
        )
        existing_user_with_username = result_existing_username.scalar_one_or_none()
        if existing_user_with_username and existing_user_with_username.id != user_id:
            raise ValueError(
                f"Username '{update_data['username']}' already exists for another user"
            )

    # ----------------------------------------------------------------------- #
    # Field updates
    # ----------------------------------------------------------------------- #
    for key, value in update_data.items():
        if key == "password" and value is not None:
            setattr(db_user, "hashed_password", get_password_hash(value))
        elif key == "disabled" and value is not None:
            setattr(db_user, key, value)
        elif hasattr(db_user, key):
            setattr(db_user, key, value)

    await db.commit()
    await db.refresh(db_user)
    return db_user


async def delete_user(db: AsyncSession, user_id: str) -> Optional[models.User]:
    db_user = await get_user(db, user_id)
    if db_user:
        await db.delete(db_user)
        await db.commit()
        return db_user
    return None


async def authenticate_user(
    db: AsyncSession, username: str, password: str
) -> Optional[models.User]:
    """Authenticate a user by username and password."""
    user = await get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user
