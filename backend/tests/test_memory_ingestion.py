from unittest.mock import MagicMock, patch
from datetime import datetime, timezone
import asyncio

import pytest

from backend.services.memory_service import MemoryService
from backend.schemas.memory import MemoryEntity
from backend.schemas.file_ingest import FileIngestInput


@pytest.fixture
def memory_service():
    session = MagicMock()
    service = MemoryService(session)
    storage = {}

    def fake_create_entity(entity_data):
        entity = MemoryEntity(
            id=len(storage) + 1,
            entity_type=entity_data.entity_type,
            content=entity_data.content,
            entity_metadata=entity_data.entity_metadata,
            source=entity_data.source,
            source_metadata=entity_data.source_metadata,
            created_by_user_id=entity_data.created_by_user_id,
            created_at=datetime.now(timezone.utc),
            updated_at=None,
        )
        storage[entity.id] = entity
        return entity

    def fake_get_entity(entity_id):
        return storage.get(entity_id)

    service.create_entity = MagicMock(side_effect=fake_create_entity)
    service.get_entity = MagicMock(side_effect=fake_get_entity)
    return service


@pytest.mark.asyncio
async def test_ingest_text_and_retrieve(memory_service):
    entity = await memory_service.ingest_text("hello world", user_id="u1")

    assert entity.content == "hello world"
    assert memory_service.get_entity(entity.id) == entity


@patch("backend.services.memory_service.httpx.AsyncClient")
@pytest.mark.asyncio
async def test_ingest_url_and_retrieve(mock_client_cls, memory_service):
    mock_client = MagicMock()
    mock_response = MagicMock(status_code=200, text="from web")
    mock_client.get.return_value = asyncio.Future()
    mock_client.get.return_value.set_result(mock_response)
    mock_client.__aenter__.return_value = mock_client
    mock_client.__aexit__.return_value = asyncio.Future()
    mock_client.__aexit__.return_value.set_result(None)
    mock_client_cls.return_value = mock_client

    entity = await memory_service.ingest_url("http://example.com", user_id="u2")
    mock_client.get.assert_called_once_with("http://example.com")
    assert entity.content == "from web"
    assert memory_service.get_entity(entity.id) == entity


@pytest.mark.asyncio
async def test_ingest_file_and_retrieve(tmp_path, memory_service):
    f = tmp_path / "sample.txt"
    f.write_text("file content", encoding="utf-8")

    entity = await memory_service.ingest_file(
        FileIngestInput(file_path=str(f)),
        user_id="u3",
    )

    assert entity.content == "file content"
    assert entity.entity_metadata["path"] == f.name
    assert memory_service.get_entity(entity.id) == entity
