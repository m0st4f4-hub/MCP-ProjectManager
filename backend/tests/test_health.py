import pytest
from httpx import AsyncClient, ASGITransport

from backend.app_factory import create_app
from backend.database import get_db, SessionLocal


@pytest.mark.asyncio
async def test_health_endpoint(async_db_session):
    app = create_app()

    async def override_get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        resp = await client.get("/health")

    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
