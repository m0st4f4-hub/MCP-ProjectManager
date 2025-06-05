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
from backend.schemas.memory import MemoryEntity
from datetime import datetime, timezone


class DummyService:
    def __init__(self):
        self.entities = {}
        self.next_id = 1

    async def ingest_text(self, text: str, user_id=None, metadata=None):
        entity = MemoryEntity(
            id=self.next_id,
            entity_type="text",
            content=text,
            entity_metadata=metadata,
            source="text_ingestion",
            source_metadata=None,
            created_by_user_id=user_id,
            created_at=datetime.now(timezone.utc),
            updated_at=None,
        )
        self.entities[self.next_id] = entity
        self.next_id += 1
        return entity

    async def ingest_url(self, url: str, user_id=None):
        return await self.ingest_text(f"content from {url}", user_id)

    def ingest_file(self, file, user_id=None):
        if hasattr(file, "file"):
            content = file.file.read().decode("utf-8")
        else:
            with open(file, "r", encoding="utf-8") as f:
                content = f.read()
        return self.ingest_text(content, user_id)

    def get_file_content(self, entity_id: int):
        return self.entities[entity_id].content

    def get_file_metadata(self, entity_id: int):
        return self.entities[entity_id].entity_metadata or {}

    def get_entity(self, entity_id: int):
        return self.entities.get(entity_id)


dummy_user = types.SimpleNamespace(id="user1")


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
async def test_ingest_text_and_retrieve_content():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        resp = await client.post(
            "/entities/ingest/text",
            json={"text": "hello"},
        )
        assert resp.status_code == 201
        entity_id = resp.json()["id"]

        resp = await client.get(f"/entities/{entity_id}/content")
        assert resp.status_code == 200
        assert resp.json()["content"] == "hello"


@pytest.mark.asyncio
async def test_ingest_url_and_get_metadata():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        resp = await client.post(
            "/entities/ingest/url",
            json={"url": "http://example.com"},
        )
        assert resp.status_code == 201
        entity_id = resp.json()["id"]

        resp = await client.get(f"/entities/{entity_id}/metadata")
        assert resp.status_code == 200
        assert resp.json()["metadata"] == {}


@pytest.mark.asyncio
async def test_root_ingest_text():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        resp = await client.post(
            "/ingest-text",
            json={"text": "root"},
        )
        assert resp.status_code == 201
        assert resp.json()["content"] == "root"


@pytest.mark.asyncio
async def test_root_ingest_url():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        resp = await client.post(
            "/ingest-url",
            json={"url": "http://root.com"},
        )
        assert resp.status_code == 201
        assert resp.json()["content"] == "content from http://root.com"


@pytest.mark.asyncio
async def test_root_ingest_upload():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        files = {"file": ("hello.txt", b"upload", "text/plain")}
        resp = await client.post("/ingest/upload", files=files)
        assert resp.status_code == 201
        assert resp.json()["content"] == "upload"
