import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

from backend.routers.audit_logs.core import router
from backend.database import get_db
from backend.crud import audit_logs as audit_log_crud
from backend.schemas.audit_log import AuditLogCreate


@pytest.mark.asyncio
async def test_delete_audit_log(async_db_session: AsyncSession):
    app = FastAPI()
    app.include_router(router, prefix="/audit-logs")

    async def override_db():
        yield async_db_session

    app.dependency_overrides[get_db] = override_db

    log_create = AuditLogCreate(action="test", details={"foo": "bar"})
    created = await audit_log_crud.create_audit_log(async_db_session, log_create)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.delete(f"/audit-logs/{created.id}")
        assert resp.status_code == 200
        assert resp.json()["data"]["id"] == created.id

    remaining = await audit_log_crud.get_audit_log(async_db_session, created.id)
    assert remaining is None


@pytest.mark.asyncio
async def test_delete_audit_log_not_found(async_db_session: AsyncSession):
    app = FastAPI()
    app.include_router(router, prefix="/audit-logs")

    async def override_db():
        yield async_db_session

    app.dependency_overrides[get_db] = override_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.delete("/audit-logs/nonexistent")
        assert resp.status_code == 404


