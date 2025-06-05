import types
from datetime import datetime, timezone
import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

from backend.routers.memory.relations.relations import (
    router,
    get_memory_service,
)
from backend.schemas.memory import MemoryRelation, MemoryRelationCreate
from backend.services.exceptions import EntityNotFoundError


class DummyService:
    def __init__(self):
        self.relations = {}
        self.next_id = 1

    def create_memory_relation(self, relation: MemoryRelationCreate):
        rel = MemoryRelation(
            id=self.next_id,
            from_entity_id=relation.from_entity_id,
            to_entity_id=relation.to_entity_id,
            relation_type=relation.relation_type,
            metadata_=relation.metadata_,
            created_at=datetime.now(timezone.utc),
            updated_at=None,
            from_entity=None,
            to_entity=None,
        )
        self.relations[self.next_id] = rel
        self.next_id += 1
        return rel

    def update_memory_relation(self, relation_id: int, relation: MemoryRelationCreate):
        if relation_id not in self.relations:
            raise EntityNotFoundError("MemoryRelation", relation_id)
        rel = self.relations[relation_id]
        rel.from_entity_id = relation.from_entity_id
        rel.to_entity_id = relation.to_entity_id
        rel.relation_type = relation.relation_type
        rel.metadata_ = relation.metadata_
        rel.updated_at = datetime.now(timezone.utc)
        return rel


dummy_service = DummyService()


def override_service():
    return dummy_service


app = FastAPI()
app.include_router(router)
app.dependency_overrides[get_memory_service] = override_service


@pytest.mark.asyncio
async def test_update_relation_success():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/relations/",
            json={"from_entity_id": 1, "to_entity_id": 2, "relation_type": "link"},
        )
        assert resp.status_code == 200
        relation_id = resp.json()["id"]

        resp = await client.put(
            f"/relations/{relation_id}",
            json={"from_entity_id": 1, "to_entity_id": 2, "relation_type": "updated", "metadata_": {"x": 1}},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["relation_type"] == "updated"
        assert data["metadata_"] == {"x": 1}


@pytest.mark.asyncio
async def test_update_relation_not_found():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.put(
            "/relations/999",
            json={"from_entity_id": 1, "to_entity_id": 2, "relation_type": "none"},
        )
        assert resp.status_code == 404
