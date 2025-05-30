# Task ID: <taskId>
# Agent Role: CodeStructureSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

# --- Universal Mandate Schemas ---
class UniversalMandateBase(BaseModel):
 """Base schema for universal mandate attributes."""
 title: str = Field(..., description="The title of the universal mandate.")
 description: str = Field(..., description="Detailed description of the mandate.")
 priority: int = Field(5, description="Priority of the mandate (1-10 scale).")
 is_active: bool = Field(True, description="Whether the mandate is active.")

class UniversalMandateCreate(UniversalMandateBase):
 """Schema for creating a new universal mandate."""
 pass

class UniversalMandateUpdate(BaseModel):
 """Schema for updating an existing universal mandate."""
 title: Optional[str] = Field(None, description="Updated title of the mandate.")
 description: Optional[str] = Field(None, description="Updated description of the mandate.")
 priority: Optional[int] = Field(None, description="Updated priority (1-10 scale).")
 is_active: Optional[bool] = Field(None, description="Updated active status.")

class UniversalMandate(UniversalMandateBase):
 """Schema for representing a universal mandate in API responses."""
 id: str = Field(..., description="Unique identifier for the mandate.")
 created_at: datetime = Field(..., description="Timestamp when the mandate was created.")
 updated_at: datetime = Field(..., description="Timestamp when the mandate was last updated.")

 model_config = ConfigDict(from_attributes=True) 