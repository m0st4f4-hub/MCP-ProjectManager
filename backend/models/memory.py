"""
Memory and knowledge graph models - Simplified for single-user mode.
"""

from sqlalchemy import (
    Column, String, Integer, ForeignKey, Text, Boolean,
    UniqueConstraint, DateTime, Index
)
from sqlalchemy.orm import relationship
from datetime import datetime

from .base import Base, BaseModel, JSONText


class MemoryEntity(Base, BaseModel):
    """Represents an entity in the knowledge graph."""
    __tablename__ = "memory_entities"
    __table_args__ = (
        Index('idx_memory_entities_type_name', 'entity_type', 'name'),
        Index('idx_memory_entities_name_search', 'name'),
    )

    entity_type = Column(String(50), index=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=True)
    entity_metadata = Column(JSONText, nullable=True)
    source = Column(String(255), nullable=True)
    source_metadata = Column(JSONText, nullable=True)

    # Relationships
    observations = relationship(
        "MemoryObservation", back_populates="entity", cascade="all, delete-orphan")
    relations_as_from = relationship(
        "MemoryRelation", foreign_keys="[MemoryRelation.from_entity_id]",
        back_populates="from_entity", cascade="all, delete-orphan")
    relations_as_to = relationship(
        "MemoryRelation", foreign_keys="[MemoryRelation.to_entity_id]",
        back_populates="to_entity")
    
    # File associations
    project_file_associations = relationship(
        "ProjectFileAssociation", back_populates="file_entity", cascade="all, delete-orphan")
    task_file_associations = relationship(
        "TaskFileAssociation", back_populates="file_entity", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<MemoryEntity(id={self.id}, type='{self.entity_type}', name='{self.name}')>"


class MemoryObservation(Base, BaseModel):
    """Represents an observation associated with a memory entity."""
    __tablename__ = "memory_observations"

    entity_id = Column(Integer, ForeignKey("memory_entities.id"), nullable=False)
    content = Column(Text, nullable=False)
    source = Column(String(255), nullable=True)
    metadata_text = Column(Text, nullable=True)

    # Relationships
    entity = relationship("MemoryEntity", back_populates="observations")

    def __repr__(self):
        return f"<MemoryObservation(id={self.id}, entity_id={self.entity_id})>"


class MemoryRelation(Base, BaseModel):
    """Enhanced directed relationship between memory entities with confidence and temporal tracking."""
    __tablename__ = "memory_relations"
    __table_args__ = (
        UniqueConstraint('from_entity_id', 'to_entity_id', 'relation_type',
                        name='uq_from_to_relation'),
        Index('idx_memory_relations_type', 'relation_type'),
        Index('idx_memory_relations_confidence', 'confidence_score'),
        Index('idx_memory_relations_temporal', 'start_time', 'end_time'),
        Index('idx_memory_relations_source', 'source_type'),
    )

    # Core relationship
    from_entity_id = Column(Integer, ForeignKey("memory_entities.id"), nullable=False)
    to_entity_id = Column(Integer, ForeignKey("memory_entities.id"), nullable=False)
    relation_type = Column(String(100), index=True, nullable=False)
    
    # Enhanced metadata
    metadata_json = Column(JSONText, nullable=True)
    description = Column(Text, nullable=True)
    
    # Confidence and quality
    confidence_score = Column(Integer, default=100, nullable=False)  # 0-100
    quality_score = Column(Integer, default=100, nullable=False)     # 0-100
    evidence_count = Column(Integer, default=1, nullable=False)
    
    # Temporal aspects
    start_time = Column(DateTime, nullable=True)   # When relationship started
    end_time = Column(DateTime, nullable=True)     # When relationship ended (null = ongoing)
    last_confirmed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Source tracking
    source_type = Column(String(50), nullable=True)  # 'user_input', 'agent_inference', 'file_analysis', 'mcp_tool'
    source_reference = Column(String(500), nullable=True)  # Reference to source (file path, tool execution ID, etc.)
    discovery_method = Column(String(100), nullable=True)  # 'explicit', 'inferred', 'extracted'
    
    # Directional properties
    is_bidirectional = Column(Boolean, default=False, nullable=False)
    strength = Column(Integer, default=50, nullable=False)  # 1-100, relationship strength
    
    # Lifecycle
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_source = Column(String(200), nullable=True)
    
    # Context and constraints
    context_filters = Column(JSONText, nullable=True)  # When this relation applies
    business_rules = Column(JSONText, nullable=True)   # Rules governing this relation
    
    # Usage analytics
    access_count = Column(Integer, default=0, nullable=False)
    last_accessed_at = Column(DateTime, nullable=True)
    query_relevance_score = Column(Integer, default=50, nullable=False)  # 1-100

    # Relationships
    from_entity = relationship(
        "MemoryEntity", foreign_keys=[from_entity_id],
        back_populates="relations_as_from")
    to_entity = relationship(
        "MemoryEntity", foreign_keys=[to_entity_id],
        back_populates="relations_as_to")

    def __repr__(self):
        return f"<MemoryRelation(from={self.from_entity_id}, to={self.to_entity_id}, type='{self.relation_type}', confidence={self.confidence_score})>"