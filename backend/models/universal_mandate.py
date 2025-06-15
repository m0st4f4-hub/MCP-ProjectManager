# Task ID: <taskId>  # Agent Role: CodeStructureSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

"""
Universal Mandate Model
"""
from sqlalchemy import Column, String, Text, Boolean
from .base import BaseModel, Base, generate_uuid

class UniversalMandate(Base, BaseModel):
    """A mandate that applies to all agents."""
    __tablename__ = 'universal_mandates'

    id = Column(String(32), primary_key=True, default=generate_uuid)
    mandate = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
