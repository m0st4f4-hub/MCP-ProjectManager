from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from backend.services.memory_service import MemoryService
from backend.schemas.file_ingest import FileIngestInput
from backend.schemas.memory import MemoryRelationCreate


def test_delete_memory_entity_no_error():
    session = MagicMock()
    service = MemoryService(session)
    dummy_entity = MagicMock()
    service.get_entity = MagicMock(return_value=dummy_entity)

    result = service.delete_memory_entity(1)

    service.db.delete.assert_called_once_with(dummy_entity)
    service.db.commit.assert_called_once()
    assert result == dummy_entity


def test_ingest_file_reads_text(tmp_path):
    """File ingestion should read text content and pass it to create_entity."""
    tmp_file = tmp_path / "sample.txt"
    content = "Hello world"
    tmp_file.write_text(content, encoding="utf-8")

    session = MagicMock()
    service = MemoryService(session)
    created = MagicMock()
    service.create_entity = MagicMock(return_value=created)

    ingest_input = FileIngestInput(file_path=str(tmp_file))
    result = service.ingest_file(ingest_input, user_id="u1")

    service.create_entity.assert_called_once()
    entity = service.create_entity.call_args.args[0]
    assert entity.entity_type == "file"
    assert entity.content == content
    assert entity.source == "file_ingestion"
    assert entity.source_metadata == {"path": str(tmp_file)}
    assert entity.created_by_user_id == "u1"
    assert result == created


def test_ingest_file_missing_file_raises():
    """ingest_file should raise HTTPException when the file is missing."""
    session = MagicMock()
    service = MemoryService(session)

    with pytest.raises(HTTPException):
        service.ingest_file(FileIngestInput(file_path="/nonexistent/file.txt"))


def test_ingest_file_unsupported_encoding(tmp_path):
    """If decoding fails for all attempts, HTTPException should be raised."""
    tmp_file = tmp_path / "bad.txt"
    tmp_file.write_bytes(b"\xff\xfe")

    session = MagicMock()
    service = MemoryService(session)

    decode_error = UnicodeDecodeError("utf-8", b"", 0, 1, "bad")
    with patch("builtins.open", side_effect=[decode_error, decode_error]):
        with pytest.raises(HTTPException):
            service.ingest_file(FileIngestInput(file_path=str(tmp_file)))


def test_update_memory_relation_success():
    session = MagicMock()
    service = MemoryService(session)

    existing = MagicMock()
    service.get_memory_relation = MagicMock(return_value=existing)
    service.get_memory_entity_by_id = MagicMock(side_effect=[MagicMock(), MagicMock()])

    update = MemoryRelationCreate(
        from_entity_id=1,
        to_entity_id=2,
        relation_type="linked",
        metadata_={"a": 1},
    )

    result = service.update_memory_relation(1, update)

    assert result is existing
    assert existing.from_entity_id == 1
    assert existing.to_entity_id == 2
    assert existing.relation_type == "linked"
    assert existing.metadata_ == {"a": 1}
    session.commit.assert_called_once()
    session.refresh.assert_called_once_with(existing)


def test_update_memory_relation_not_found():
    session = MagicMock()
    service = MemoryService(session)
    service.get_memory_relation = MagicMock(return_value=None)

    update = MemoryRelationCreate(
        from_entity_id=1,
        to_entity_id=2,
        relation_type="linked",
        metadata_={},
    )

    assert service.update_memory_relation(1, update) is None


def test_update_memory_relation_missing_entity():
    session = MagicMock()
    service = MemoryService(session)
    service.get_memory_relation = MagicMock(return_value=MagicMock())
    service.get_memory_entity_by_id = MagicMock(return_value=None)

    update = MemoryRelationCreate(
        from_entity_id=1,
        to_entity_id=2,
        relation_type="linked",
        metadata_={},
    )

    with pytest.raises(HTTPException):
        service.update_memory_relation(1, update)
