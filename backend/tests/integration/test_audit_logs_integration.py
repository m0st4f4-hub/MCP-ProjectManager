import pytest

from backend.services.audit_log_service import AuditLogService
from backend.schemas.audit_log import AuditLogUpdate


@pytest.mark.asyncio
async def test_audit_log_service(async_db_session):
    service = AuditLogService(async_db_session)
    log = await service.create_log(action="test", user_id="u1", details={"x": 1})
    assert log.action_type == "test"

    fetched = await service.get_log(log.id)
    assert fetched is not None and fetched.id == log.id

    logs = await service.get_logs(user_id="u1")
    assert any(entry.id == log.id for entry in logs)

    updated = await service.update_log(log.id, AuditLogUpdate(action="updated"))
    assert updated is not None and updated.action_type == "updated"

    deleted = await service.delete_log(log.id)
    assert deleted is True
