import pytest
from backend.services.memory_service import MemoryService
from backend.services.task_file_association_service import TaskFileAssociationService
from backend.schemas.memory import MemoryEntityCreate


@pytest.mark.asyncio
async def test_associate_memory_file_with_task(async_db_session, test_task):
    memory_service = MemoryService(async_db_session)
    file_entity = await memory_service.create_entity(
        MemoryEntityCreate(entity_type='file', content='data')
    )

    assoc_service = TaskFileAssociationService(async_db_session)
    association = await assoc_service.associate_file_with_task(
        str(test_task.project_id),
        test_task.task_number,
        file_entity.id,
    )
    assert association.file_memory_entity_id == file_entity.id
    fetched = await assoc_service.get_association(
        str(test_task.project_id), test_task.task_number, file_entity.id
    )
    assert fetched is not None
    await assoc_service.disassociate_file_from_task(
        str(test_task.project_id), test_task.task_number, file_entity.id
    )
    removed = await assoc_service.get_association(
        str(test_task.project_id), test_task.task_number, file_entity.id
    )
    assert removed is None
