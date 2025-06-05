import types
from datetime import datetime, timezone

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


class DummyService:
    def __init__(self):
        ts = datetime(2020, 1, 1, tzinfo=timezone.utc)
        self.entities = [
            MemoryEntity(
                id=1,
                entity_type="text",
                content="a",
                entity_metadata=None,
                source="test",
                source_metadata=None,
                created_by_user_id=None,
                created_at=ts,
                updated_at=None,
            ),
            MemoryEntity(
                id=2,
                entity_type="text",
                content="b",
                entity_metadata=None,
                source="test",
                source_metadata=None,
                created_by_user_id=None,
                created_at=ts,
                updated_at=None,
            ),
        ]
        self.relations = [
            MemoryRelation(
                id=1,
                from_entity_id=1,
                to_entity_id=2,
                relation_type="related",
                metadata_=None,
                created_at=ts,
                updated_at=None,
                from_entity=None,
                to_entity=None,
            )
        ]

    def get_knowledge_graph(self):
        return {"entities": self.entities, "relations": self.relations}


dummy_user = types.SimpleNamespace(id="u1")


def override_user():
    return dummy_user


dummy_service = DummyService()


def override_service():
    return dummy_service


app = FastAPI()
app.include_router(router)
app.dependency_overrides[get_memory_service] = override_service
app.dependency_overrides[core_get_memory_service] = override_service
app.dependency_overrides[get_current_active_user] = override_user


@pytest.mark.asyncio
async def test_get_knowledge_graph_endpoint():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        resp = await client.get("/entities/graph")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["entities"]) == 2
        assert len(data["relations"]) == 1
        assert data["relations"][0]["from_entity_id"] == 1
        assert data["relations"][0]["to_entity_id"] == 2
