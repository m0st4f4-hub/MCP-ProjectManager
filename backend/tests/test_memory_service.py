from unittest.mock import MagicMock

from backend.services.memory_service import MemoryService


def test_delete_memory_entity_no_error():
    session = MagicMock()
    service = MemoryService(session)
    dummy_entity = MagicMock()
    service.get_entity = MagicMock(return_value=dummy_entity)

    result = service.delete_memory_entity(1)

    service.db.delete.assert_called_once_with(dummy_entity)
    service.db.commit.assert_called_once()
    assert result == dummy_entity
