# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from sqlalchemy import Column, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional
import uuid

from ..database import Base  # Import Base from backend/database.py


class ProjectTemplate(Base):
    __tablename__ = "project_templates"

    id: Mapped[str] = mapped_column(
        String(32), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Assuming a relationship to default tasks/roles defined elsewhere or through a linking table
    # For now, no direct relationship defined here. 