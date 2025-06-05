import pytest
from backend.services.audit_log_service import AuditLogService


@pytest.mark.asyncio
async def test_create_and_get_audit_log(async_db_session):
    service = AuditLogService(async_db_session)
    log = await service.create_log(action='test', user_id='user1', details={'x': 1})
    assert log.id
    fetched = await service.get_log(log.id)
    assert fetched is not None
    assert fetched.action_type == 'test'
    logs = await service.get_logs(user_id='user1')
    assert len(logs) >= 1
