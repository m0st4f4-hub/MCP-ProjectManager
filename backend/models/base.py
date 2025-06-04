"""
Base models and utilities for the task manager.
Contains common imports, base classes, and utility functions.
"""

from sqlalchemy import String, Boolean, DateTime, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import uuid
import json
from sqlalchemy.types import TypeDecorator
from enum import Enum

try:
    from ..database import Base
except ImportError:
    from database import Base


class JSONText(TypeDecorator):
    """Stores JSON data as TEXT in SQLite, serializing/deserializing automatically."""
    impl = Text

    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value)
        return None

    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)
        return None

    python_type = Dict[str, Any]


class ProjectMemberRole(str, Enum):
    """Enum for project member roles."""
    OWNER = "owner"
    MEMBER = "member"
    VIEWER = "viewer"


class BaseModel:
    """Base mixin class for common model fields."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=True
    )


def generate_uuid() -> str:
    """Generate a UUID string without hyphens."""
    return str(uuid.uuid4()).replace('-', '')


def generate_uuid_with_hyphens() -> str:
    """Generate a UUID string with hyphens."""
    return str(uuid.uuid4())


class ArchivedMixin:
    """Mixin for models that can be archived."""
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
