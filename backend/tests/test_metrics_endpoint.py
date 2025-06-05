import pytest
from httpx import AsyncClient, ASGITransport
from backend.app_factory import create_app


@pytest.mark.asyncio
async def test_metrics_endpoint():
    app = create_app()
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        resp = await client.get("/health")
        assert resp.status_code == 200
        metrics = await client.get("/metrics")
        assert metrics.status_code == 200
        assert "http_requests_total" in metrics.text
