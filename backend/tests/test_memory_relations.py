import types
import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

from backend.routers.memory.relations.relations import (
    router,
    get_memory_service,
)
from backend.schemas.memory import MemoryRelation, MemoryRelationCreate
from backend.services.memory_service import MemoryService
from backend.services.exceptions import EntityNotFoundError
from datetime import datetime, timezone


class DummyRelationService:
    def __init__(self):
        now = datetime.now(timezone.utc)
        self.relations = {
            1: MemoryRelation(
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
        }

    def update_memory_relation(self, relation_id: int, relation: MemoryRelationCreate):
        if relation_id not in self.relations:
            raise EntityNotFoundError("MemoryRelation", relation_id)
        updated = MemoryRelation(
            id=relation_id,
            from_entity_id=relation.from_entity_id,
            to_entity_id=relation.to_entity_id,
            relation_type=relation.relation_type,
            metadata_=relation.metadata_,
            created_at=self.relations[relation_id].created_at,
            updated_at=None,
            from_entity=None,
            to_entity=None,
        )
        self.relations[relation_id] = updated
        return updated


dummy_service = DummyRelationService()


def override_service():
    return dummy_service


app = FastAPI()
app.include_router(router)
app.dependency_overrides[get_memory_service] = override_service


@pytest.mark.asyncio
async def test_update_relation_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.put(
            "/relations/1",
            json={
                "from_entity_id": 1,
                "to_entity_id": 2,
                "relation_type": "updated",
                "metadata_": {"foo": "bar"},
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["relation_type"] == "updated"
        assert dummy_service.relations[1].relation_type == "updated"


def test_update_memory_relation_service():
    session = types.SimpleNamespace(commit=lambda: None, refresh=lambda obj: None)
    service = MemoryService(session)
    relation = types.SimpleNamespace()
    service.get_memory_relation = lambda _id: relation
    service.get_memory_entity_by_id = lambda _id: object()

    update = MemoryRelationCreate(
        from_entity_id=2,
        to_entity_id=3,
        relation_type="ref",
        metadata_={"x": 1},
    )

    # monkeypatch commit and refresh to track calls
    called = {}

    def commit():
        called["commit"] = True

    def refresh(obj):
        called["refresh"] = obj

    service.db.commit = commit
    service.db.refresh = refresh

    result = service.update_memory_relation(5, update)

    assert result is relation
    assert relation.from_entity_id == 2
    assert relation.to_entity_id == 3
    assert relation.relation_type == "ref"
    assert relation.metadata_ == {"x": 1}
    assert called.get("commit")
    assert called.get("refresh") is relation
