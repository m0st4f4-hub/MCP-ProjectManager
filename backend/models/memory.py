"""
Memory and knowledge graph models - Simplified for single-user mode.
"""

from sqlalchemy import (
    Column, String, Integer, ForeignKey, Text, 
    UniqueConstraint, DateTime, Index
)
from sqlalchemy.orm import relationship
from datetime import datetime

from .base import Base, BaseModel, JSONText


class MemoryEntity(Base, BaseModel):
    """Represents an entity in the knowledge graph."""
    __tablename__ = "memory_entities"

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
    """Represents a directed relationship between two memory entities."""
    __tablename__ = "memory_relations"
    __table_args__ = (
        UniqueConstraint('from_entity_id', 'to_entity_id', 'relation_type',
                        name='uq_from_to_relation'),
    )

    from_entity_id = Column(Integer, ForeignKey("memory_entities.id"), nullable=False)
    to_entity_id = Column(Integer, ForeignKey("memory_entities.id"), nullable=False)
    relation_type = Column(String(100), index=True, nullable=False)
    metadata_json = Column(JSONText, nullable=True)

    # Relationships
    from_entity = relationship(
        "MemoryEntity", foreign_keys=[from_entity_id],
        back_populates="relations_as_from")
    to_entity = relationship(
        "MemoryEntity", foreign_keys=[to_entity_id],
        back_populates="relations_as_to")

    def __repr__(self):
        return f"<MemoryRelation(from={self.from_entity_id}, to={self.to_entity_id}, type='{self.relation_type}')>"