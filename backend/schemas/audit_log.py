"""
Pydantic schemas for audit logs.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class AuditLogBase(BaseModel):
    user_id: str = Field(..., description="The ID of the user who performed the action.")
    action: str = Field(..., description="The action that was performed.")
    details: Optional[Dict[str, Any]] = Field(None, description="Details of the action.")

class AuditLogCreate(AuditLogBase):
    pass

class AuditLog(AuditLogBase):
    id: int = Field(..., description="The unique ID of the audit log.")
    created_at: datetime = Field(..., description="The timestamp when the action occurred.")

    class Config:
        from_attributes = True 