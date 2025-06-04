"""
CRUD operations for users.
"""

from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from .. import models
from backend.schemas.user import UserCreate, UserUpdate
from backend.enums import UserRoleEnum
from passlib.context import CryptContext

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
    # Duplicate-email check
    if (
        await db.execute(select(models.User).filter(models.User.email == user.email))
    ).scalar_one_or_none():
        raise ValueError("Email already registered")

    # Duplicate-username check
    if (
        await db.execute(
            select(models.User).filter(models.User.username == user.username)
        )
    ).scalar_one_or_none():
        raise ValueError("Username already exists")

    # Create user record
    db_user = models.User(
        username=user.username,
        hashed_password=get_password_hash(user.password),
        email=user.email,
        full_name=user.full_name,
        disabled=user.disabled,
    )

    # Assign roles
    for role_name in user.roles:
        try:
            role_enum = UserRoleEnum(role_name)
            db_user.user_roles.append(models.UserRole(user=db_user, role_name=role_enum))
        except ValueError:
            # Skip—or log—invalid roles
            print(f"Warning: Invalid role name provided: {role_name}")

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

    # Validate email uniqueness
    if (
        "email" in update_data
        and update_data["email"] != db_user.email
        and update_data["email"] is not None
    ):
        if (
            await db.execute(
                select(models.User).filter(models.User.email == update_data["email"])
            )
        ).scalar_one_or_none():
            raise ValueError(
                f"Email '{update_data['email']}' already exists for another user"
            )

    # Validate username uniqueness
    if (
        "username" in update_data
        and update_data["username"] != db_user.username
        and update_data["username"] is not None
    ):
        if (
            await db.execute(
                select(models.User).filter(
                    models.User.username == update_data["username"]
                )
            )
        ).scalar_one_or_none():
            raise ValueError(
                f"Username '{update_data['username']}' already exists for another user"
            )

    # Apply updates
    for key, value in update_data.items():
        if key == "password" and value:
            setattr(db_user, "hashed_password", get_password_hash(value))
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
    if user and verify_password(password, user.hashed_password):
        return user
    return None
