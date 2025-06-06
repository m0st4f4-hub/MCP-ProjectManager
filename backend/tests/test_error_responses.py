
import uuid
import pytest


@pytest.mark.asyncio
async def test_not_found_returns_error_response(authenticated_client):
    missing_id = uuid.uuid4()
    resp = await authenticated_client.get(f"/api/v1/projects/{missing_id}")
    assert resp.status_code == 404
    data = resp.json()
    assert data["success"] is False
    assert "error_code" in data
    assert "message" in data
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_invalid_route_returns_error_response(async_client):
    resp = await async_client.get("/non-existent")
    assert resp.status_code == 404
    data = resp.json()
    assert data["success"] is False
    assert "error_code" in data
    assert "message" in data
    assert "timestamp" in data
