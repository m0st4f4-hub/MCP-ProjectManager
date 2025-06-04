"""
User and authentication related models.
"""

from sqlalchemy import String, Boolean, ForeignKey, PrimaryKeyConstraint, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import List, Optional

try:
    from .base import Base, BaseModel, generate_uuid_with_hyphens
except ImportError:
    from base import Base, BaseModel, generate_uuid_with_hyphens

try:
    from ..enums import UserRoleEnum
except ImportError:
    from enums import UserRoleEnum


class User(Base, BaseModel):
    """User model for authentication and identification."""
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(32), primary_key=True, default=generate_uuid_with_hyphens, index=True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    disabled: Mapped[bool] = mapped_column(Boolean, default=False)
    role: Mapped[UserRoleEnum] = mapped_column(
        Enum(UserRoleEnum), default=UserRoleEnum.USER, nullable=False)

    user_roles: Mapped[List["UserRole"]] = relationship(
        back_populates="user", cascade="all, delete-orphan")
    comments: Mapped[List["Comment"]] = relationship(
        back_populates="author", cascade="all, delete-orphan")
    project_memberships: Mapped[List["ProjectMember"]] = relationship(
        back_populates="user", cascade="all, delete-orphan")
    audit_logs: Mapped[List["AuditLog"]] = relationship(
        back_populates="user", cascade="all, delete-orphan")


class UserRole(Base):
    """User role assignments."""
    __tablename__ = "user_roles"
    __table_args__ = (PrimaryKeyConstraint('user_id', 'role_name'),)

    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id"))
    role_name: Mapped[UserRoleEnum] = mapped_column(Enum(UserRoleEnum))

    user: Mapped["User"] = relationship(back_populates="user_roles")
