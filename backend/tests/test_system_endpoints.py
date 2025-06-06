import pytest
from httpx import AsyncClient, ASGITransport
from backend.app_factory import create_app


@pytest.mark.asyncio
async def test_system_version_and_health_endpoints():
    app = create_app()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        health = await client.get("/api/v1/health")
        assert health.status_code == 200
        data = health.json()
        assert data["status"] == "healthy"

        version = await client.get("/api/v1/version")
        assert version.status_code == 200
        assert "version" in version.json()


@pytest.mark.asyncio
async def test_system_metrics_endpoint():
    app = create_app()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/v1/metrics")
        assert resp.status_code == 200
        assert b"http_requests_total" in resp.content
