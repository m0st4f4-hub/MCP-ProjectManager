# Task ID: Generated  # Agent Role: Agent (FixingCircularImports)  # Request ID: (Inherited from Overmind)  # Project: task-manager  # Timestamp: 2025-05-24T12:00:00Z

"""
Validation logic for project file associations.
This file handles validating file associations without circular imports.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from .. import models
from .utils.file_association_utils import (
    get_project_entity,
    get_file_entity,
    get_association_between_entities,
)

__all__ = ["file_entity_exists", "project_entity_exists", "association_exists", "get_association"]
