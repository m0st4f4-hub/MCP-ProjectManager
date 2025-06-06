import types
import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

from backend.routers.memory import (
    router,
    get_memory_service,
    get_current_active_user,
)
from backend.routers.memory.core.core import (
    get_memory_service as core_get_memory_service,
)
from backend.schemas.memory import MemoryEntity, MemoryRelation
from datetime import datetime, timezone


class DummyGraphService:
    def __init__(self):
        now = datetime.now(timezone.utc)
        self.entities = [
            MemoryEntity(
                id=1,
                entity_type="text",
                name="Entity A",
                content="a",
                entity_metadata=None,
                source="test",
                source_metadata=None,
                created_by_user_id="u",
                created_at=now,
                updated_at=None,
            ),
            MemoryEntity(
                id=2,
                entity_type="text",
                name="Entity B",
                content="b",
                entity_metadata=None,
                source="test",
                source_metadata=None,
                created_by_user_id="u",
                created_at=now,
                updated_at=None,
            ),
        ]
        self.relations = [
            MemoryRelation(
                id=1,
                from_entity_id=1,
                to_entity_id=2,
                relation_type="linked",
                metadata_=None,
                created_at=now,
                updated_at=None,
                from_entity=None,
                to_entity=None,
            )
        ]

    def get_knowledge_graph(self):
        return {"entities": self.entities, "relations": self.relations}


dummy_user = types.SimpleNamespace(id="user1")

def override_user():
    return dummy_user

dummy_service = DummyGraphService()

def override_service():
    return dummy_service

app = FastAPI()
app.include_router(router)
app.dependency_overrides[get_memory_service] = override_service
app.dependency_overrides[core_get_memory_service] = override_service
app.dependency_overrides[get_current_active_user] = override_user


@pytest.mark.asyncio
async def test_get_graph_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/entities/graph")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["entities"]) == 2
        assert len(data["relations"]) == 1
        assert data["relations"][0]["from_entity_id"] == 1
        assert data["relations"][0]["to_entity_id"] == 2


@pytest.mark.asyncio
async def test_get_graph_root_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/graph")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["entities"]) == 2
        assert len(data["relations"]) == 1
        assert data["relations"][0]["from_entity_id"] == 1
        assert data["relations"][0]["to_entity_id"] == 2
