"""Project Template model."""

from sqlalchemy import String, Text, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional, Dict, Any
import datetime
from datetime import UTC

from .base import Base, generate_uuid_with_hyphens, JSONText

class ProjectTemplate(Base):
    __tablename__ = "project_templates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid_with_hyphens)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # Use JSONText for proper JSON serialization/deserialization with SQLite
    template_data: Mapped[Dict[str, Any]] = mapped_column(JSONText, default=dict)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now(UTC))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now(UTC), onupdate=datetime.datetime.now(UTC))

    def __repr__(self):
        return f"<ProjectTemplate(id={self.id}, name='{self.name}')>"

# Explicitly named unique index for the 'name' column
Index('ix_project_templates_name_explicit_unique', ProjectTemplate.name, unique=True)
