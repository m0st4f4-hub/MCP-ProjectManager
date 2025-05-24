"""Project Template model."""

from sqlalchemy import String, Text, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column
# from sqlalchemy.dialects.postgresql import JSONB # Removed JSONB import
from sqlalchemy import JSON # For SQLite or other DBs # Uncommented JSON import
from typing import Optional, Dict, Any
import datetime

from .base import Base, generate_uuid_with_hyphens

class ProjectTemplate(Base):
    __tablename__ = "project_templates"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_uuid_with_hyphens)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # template_data stores the structure, e.g., default tasks, task statuses, member roles
    # template_data: Mapped[Dict[str, Any]] = mapped_column(JSONB) # Changed column type to Text
    # For SQLite, use Text and manually handle JSON serialization/deserialization
    template_data: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def __repr__(self):
        return f"<ProjectTemplate(id={self.id}, name='{self.name}')>"

    # Assuming a relationship to default tasks/roles defined elsewhere or through a linking table
    # For now, no direct relationship defined here. 

# Explicitly named unique index for the 'name' column
Index('ix_project_templates_name_explicit_unique', ProjectTemplate.name, unique=True) 