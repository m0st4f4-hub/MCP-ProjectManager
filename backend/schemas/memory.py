# Task ID: <taskId>  # Agent Role: ImplementationSpecialist  # Request ID: <requestId>  # Project: task-manager  # Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime  # Forward references for relationships
MemoryObservation = "MemoryObservation"
MemoryRelation = "MemoryRelation"
MemoryEntity = "MemoryEntity"  # --- MemoryEntity Schemas ---

class MemoryEntityBase(BaseModel):
    """Base schema for MemoryEntity attributes."""
    entity_type: str = Field(..., description="The type of the memory entity (e.g., 'file', 'url', 'text').")
    content: Optional[str] = Field(None, description="The main content of the entity.")
    entity_metadata: Optional[Dict[str, Any]] = Field(None, description="Structured metadata about the entity.")
    source: Optional[str] = Field(None, description="Where the entity came from (e.g., 'file_ingestion', 'web_scrape').")
    source_metadata: Optional[Dict[str, Any]] = Field(None, description="Metadata about the source.")
    created_by_user_id: Optional[str] = Field(None, description="The ID of the user who created the entity, if applicable.")

class MemoryEntityCreate(MemoryEntityBase):
    """Schema for creating a new MemoryEntity."""
    pass  # Inherits all fields from MemoryEntityBase

class MemoryEntityUpdate(BaseModel):
    """Schema for updating an existing MemoryEntity. All fields are optional."""
    entity_type: Optional[str] = Field(None, description="Update entity type.")
    content: Optional[str] = Field(None, description="Update content.")
    entity_metadata: Optional[Dict[str, Any]] = Field(None, description="Update metadata.")
    source: Optional[str] = Field(None, description="Update source.")
    source_metadata: Optional[Dict[str, Any]] = Field(None, description="Update source metadata.")
    created_by_user_id: Optional[str] = Field(None, description="Update creator user ID.")

class MemoryEntity(MemoryEntityBase):
    """Schema for representing a MemoryEntity in API responses."""
    id: int = Field(..., description="Unique integer identifier for the memory entity.")
    created_at: datetime = Field(..., description="Timestamp when the entity was created.")
    updated_at: Optional[datetime] = Field(None, description="Timestamp when the entity was last updated.")

    model_config = ConfigDict(from_attributes=True)  # You might also need schemas for relationships if MemoryEntities link to other entities  # class MemoryRelationshipCreate(BaseModel):  # source_entity_id: int  # target_entity_id: int  # relationship_type: str  # e.g., "mentions", "relates_to"  # class MemoryRelationship(MemoryRelationshipCreate):  # id: int  # created_at: datetime  # model_config = ConfigDict(from_attributes=True)  # --- Memory Schemas ---

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
    created_at: datetime = Field(..., description="Timestamp when the observation was recorded.")  # Relationship
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
    updated_at: Optional[datetime] = Field(None, description="Timestamp when the relation was last updated.")  # Relationships
    from_entity: Optional[MemoryEntity] = Field(None, description="The source memory entity.")
    to_entity: Optional[MemoryEntity] = Field(None, description="The target memory entity.")

    model_config = ConfigDict(from_attributes=True)
