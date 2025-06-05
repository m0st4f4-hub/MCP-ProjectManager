from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from backend.services.memory_service import MemoryService
from backend.schemas.file_ingest import FileIngestInput


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
    assert entity.source_metadata == {"path": tmp_file.name}
    assert entity.entity_metadata["path"] == tmp_file.name
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
