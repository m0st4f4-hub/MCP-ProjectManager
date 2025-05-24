# Task ID: Generated
# Agent Role: Agent (FixingCircularImports)
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-24T12:00:00Z

"""
Validation logic for project file associations.
This file handles validating file associations without circular imports.
"""

from sqlalchemy.orm import Session
from .utils.file_association_utils import file_entity_exists, project_entity_exists, association_exists

# Export the utility functions to maintain the same interface
__all__ = ["file_entity_exists", "project_entity_exists", "association_exists"]
