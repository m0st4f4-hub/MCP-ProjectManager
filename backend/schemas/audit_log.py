# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

"""Pydantic schemas for Audit Logs."""

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict, Any
from datetime import datetime

# --- AuditLog Schemas ---

class AuditLogBase(BaseModel):
 """Base schema for audit log attributes."""
 user_id: Optional[str] = Field(None, description="ID of the user performing the action, if applicable.")
 action: str = Field(..., description="Description of the action performed (e.g., 'user_login', 'create_project').")
 details: Optional[Dict[str, Any]] = Field(None, description="Additional details about the action, in JSON format.")

class AuditLogCreate(AuditLogBase):
 """Schema for creating a new audit log entry."""
 pass # Inherits all fields from AuditLogBase

class AuditLog(AuditLogBase):
 """Schema for representing an audit log entry in API responses."""
 id: str = Field(..., description="Unique identifier for the audit log entry.")
 timestamp: datetime = Field(..., description="Timestamp of when the action occurred.")
 
 model_config = ConfigDict(from_attributes=True)