"""
Core domain models - (user/auth/comment/audit logic removed for single-user mode)
"""

from sqlalchemy import (
    String,
    Boolean,
    ForeignKey,
    Text,
    Integer,
    PrimaryKeyConstraint,
    ForeignKeyConstraint
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import List, Optional

from .base import Base, BaseModel, generate_uuid_with_hyphens

# All user, user role, audit, and comment models have been removed for single-user mode.
