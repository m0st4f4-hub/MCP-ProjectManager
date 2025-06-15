"""
Base models and utilities for the single-user task manager.
Simplified for local use without authentication.
"""

from sqlalchemy import String, Boolean, DateTime, Text, JSON, Column
from datetime import datetime
from typing import Dict, Any, Optional
import uuid
import json
from sqlalchemy.types import TypeDecorator

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
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return None
        return None


def generate_uuid() -> str:
    """Generate UUID without hyphens."""
    return str(uuid.uuid4()).replace('-', '')


def generate_uuid_with_hyphens() -> str:
    """Generate UUID with hyphens."""
    return str(uuid.uuid4())


class BaseModel:
    """Base model with common fields for single-user mode."""
    id = Column(String(36), primary_key=True, default=generate_uuid_with_hyphens)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class ArchivedMixin:
    """Mixin for models that can be archived."""
    is_archived = Column(Boolean, default=False, nullable=False)
    archived_at = Column(DateTime, nullable=True)