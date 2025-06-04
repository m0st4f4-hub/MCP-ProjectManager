"""
MCP Tools for Memory/Knowledge Graph Management.
"""

from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
import logging

from backend.crud.memory import (
    create_memory_entity,
    create_memory_relation,
    add_observation_to_entity,
    search_entities,
    get_memory_entity_by_name
)
from backend.schemas.memory import MemoryEntityCreate, MemoryObservationCreate

logger = logging.getLogger(__name__)


async def add_memory_entity_tool(
    entity_data: Dict[str, Any],
    db: Session
) -> dict:
    """MCP Tool: Add entity to knowledge graph."""
    try:
    entity = create_memory_entity(
    db=db,
    entity=MemoryEntityCreate(
    name=entity_data["name"],
    type=entity_data["type"],
    description=entity_data.get("description"),
    metadata_=entity_data.get("metadata", {})
    )
    )

    if "observations" in entity_data:
    for obs_content in entity_data["observations"]:
    add_observation_to_entity(
    db=db,
    entity_id=entity.id,
    observation=MemoryObservationCreate(content=obs_content, source="mcp_tool")
    )

    return {
    "success": True,
    "entity": {
    "id": entity.id,
    "name": entity.name,
    "type": entity.type,
    "description": entity.description
    }
    }
    except HTTPException as e:
    logger.error(f"MCP add memory entity failed with HTTP exception: {e.detail}")
    raise e
    except Exception as e:
    logger.error(f"MCP add memory entity failed: {e}")
    raise HTTPException(status_code=500, detail=str(e))


async def add_memory_relation_tool(
    relation_data: Dict[str, Any],
    db: Session
) -> dict:
    """MCP Tool: Add relation to knowledge graph."""
    try:
    from_entity = get_memory_entity_by_name(db, relation_data["from_entity"])
    to_entity = get_memory_entity_by_name(db, relation_data["to_entity"])

    if not from_entity or not to_entity:
    raise HTTPException(status_code=404, detail="One or both entities not found")

    relation = create_memory_relation(
    db=db,
    relation=MemoryRelationCreate(
    from_entity_id=from_entity.id,
    to_entity_id=to_entity.id,
    relation_type=relation_data["relation_type"],
    metadata_=relation_data.get("metadata", {})
    )
    )

    return {
    "success": True,
    "relation": {
    "id": relation.id,
    "from_entity": from_entity.name,
    "to_entity": to_entity.name,
    "relation_type": relation.relation_type
    }
    }
    except HTTPException as e:
    logger.error(f"MCP add memory relation failed with HTTP exception: {e.detail}")
    raise e
    except Exception as e:
    logger.error(f"MCP add memory relation failed: {e}")
    raise HTTPException(status_code=500, detail=str(e))


async def search_memory_tool(
    query: str,
    limit: int = 10,
    db: Session = None
) -> dict:
    """MCP Tool: Search knowledge graph."""
    try:
    entities = search_entities(db=db, query=query, limit=limit)

    return {
    "success": True,
    "entities": [
    {
    "id": e.id,
    "name": e.name,
    "type": e.type,
    "description": e.description
    }
    for e in entities
    ]
    }
    except Exception as e:
    logger.error(f"MCP search memory failed: {e}")
    raise HTTPException(status_code=500, detail=str(e))
