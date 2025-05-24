# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Forward references for relationships
MemoryObservation = "backend.schemas.memory.MemoryObservation"
MemoryRelation = "backend.schemas.memory.MemoryRelation"
MemoryEntity = "backend.schemas.memory.MemoryEntity"

# --- Memory Schemas ---
class MemoryEntityBase(BaseModel):
    """Base schema for memory entity attributes."""
    type: str = Field(..., description="The type of the memory entity (e.g., 'concept', 'person', 'file').")
    name: str = Field(..., description="The unique name or identifier of the memory entity.")
    description: Optional[str] = Field(None, description="A brief description of the entity.")
    metadata_: Optional[Dict[str, Any]] = Field(None, description="Optional structured metadata.")


class MemoryEntityCreate(MemoryEntityBase):
    pass


class MemoryEntityUpdate(BaseModel):
    """Schema for partial updates for MemoryEntity."""
    type: Optional[str] = Field(None, description="New type for the entity.")
    name: Optional[str] = Field(None, description="New name for the entity.")
    description: Optional[str] = Field(None, description="New description for the entity.")
    metadata_: Optional[Dict[str, Any]] = Field(None, description="New metadata for the entity.")


class MemoryEntity(MemoryEntityBase):
    """Schema for representing a memory entity in API responses, including relationships."""
    id: int = Field(..., description="Unique integer ID of the memory entity.")
    created_at: datetime = Field(..., description="Timestamp when the entity was created.")
    updated_at: Optional[datetime] = Field(None, description="Timestamp when the entity was last updated.")

    # Relationships (can be loaded with joinedload)
    observations: List[MemoryObservation] = Field([], description="Observations related to this entity.")
    relations_from: List[MemoryRelation] = Field([], description="Relationships originating from this entity.")
    relations_to: List[MemoryRelation] = Field([], description="Relationships targeting this entity.")

    model_config = ConfigDict(from_attributes=True)


class MemoryObservationBase(BaseModel):
    """Base schema for memory observation attributes."""
    content: str = Field(..., description="The content of the observation.")
    metadata_: Optional[Dict[str, Any]] = Field(None, description="Optional structured metadata for the observation.")


class MemoryObservationCreate(MemoryObservationBase):
    """Schema for creating a new memory observation."""
    entity_id: int = Field(..., description="The ID of the memory entity this observation belongs to.")


class MemoryObservation(MemoryObservationBase):
    """Schema for representing a memory observation in API responses, including relationships."""
    id: int = Field(..., description="Unique integer ID of the observation.")
    entity_id: int = Field(..., description="The ID of the memory entity this observation belongs to.")
    created_at: datetime = Field(..., description="Timestamp when the observation was recorded.")

    # Relationship
    entity: Optional[MemoryEntity] = Field(None, description="The entity this observation belongs to.")

    model_config = ConfigDict(from_attributes=True)


class MemoryRelationBase(BaseModel):
    """Base schema for memory relation attributes."""
    from_entity_id: int = Field(..., description="The ID of the source memory entity.")
    to_entity_id: int = Field(..., description="The ID of the target memory entity.")
    relation_type: str = Field(..., description="The type of the relationship (e.g., 'related_to', 'depends_on').")
    metadata_: Optional[Dict[str, Any]] = Field(None, description="Optional structured metadata for the relation.")


class MemoryRelationCreate(MemoryRelationBase):
    pass


class MemoryRelation(MemoryRelationBase):
    """Schema for representing a memory relation in API responses, including relationships."""
    id: int = Field(..., description="Unique integer ID of the relation.")
    created_at: datetime = Field(..., description="Timestamp when the relation was created.")
    updated_at: Optional[datetime] = Field(None, description="Timestamp when the relation was last updated.")

    # Relationships
    from_entity: Optional[MemoryEntity] = Field(None, description="The source memory entity.")
    to_entity: Optional[MemoryEntity] = Field(None, description="The target memory entity.")

    model_config = ConfigDict(from_attributes=True) 