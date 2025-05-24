"""
Memory and knowledge graph models.
"""

from sqlalchemy import String, Integer, ForeignKey, Text, JSON, UniqueConstraint, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from .base import Base, BaseModel


class MemoryEntity(Base):
    """Represents an entity in the knowledge graph."""
    __tablename__ = "memory_entities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    type: Mapped[str] = mapped_column(String, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    observations: Mapped[List["MemoryObservation"]] = relationship(
        back_populates="entity", cascade="all, delete-orphan")
    relations_as_from: Mapped[List["MemoryRelation"]] = relationship(
        "MemoryRelation", foreign_keys="[MemoryRelation.from_entity_id]", 
        back_populates="from_entity", cascade="all, delete-orphan")
    relations_as_to: Mapped[List["MemoryRelation"]] = relationship(
        "MemoryRelation", foreign_keys="[MemoryRelation.to_entity_id]", 
        back_populates="to_entity")


class MemoryObservation(Base):
    """Represents an observation associated with a memory entity."""
    __tablename__ = "memory_observations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    entity_id: Mapped[int] = mapped_column(Integer, ForeignKey("memory_entities.id"))
    content: Mapped[Text] = mapped_column(Text)
    source: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    metadata_: Mapped[Optional[dict]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))

    entity: Mapped["MemoryEntity"] = relationship(back_populates="observations")


class MemoryRelation(Base, BaseModel):
    """Represents a directed relationship between two memory entities."""
    __tablename__ = "memory_relations"
    __table_args__ = (UniqueConstraint('from_entity_id', 'to_entity_id', 'relation_type', 
                                      name='uq_from_to_relation'),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    from_entity_id: Mapped[int] = mapped_column(Integer, ForeignKey("memory_entities.id"))
    to_entity_id: Mapped[int] = mapped_column(Integer, ForeignKey("memory_entities.id"))
    relation_type: Mapped[str] = mapped_column(String, index=True)
    metadata_: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    from_entity: Mapped["MemoryEntity"] = relationship(
        "MemoryEntity", foreign_keys="[MemoryRelation.from_entity_id]", 
        back_populates="relations_as_from")
    to_entity: Mapped["MemoryEntity"] = relationship(
        "MemoryEntity", foreign_keys="[MemoryRelation.to_entity_id]", 
        back_populates="relations_as_to")
