import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

from backend.enums import router as enums_router

app = FastAPI()
app.include_router(enums_router, prefix="/api/enums")


@pytest.mark.asyncio
async def test_get_task_statuses():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get("/api/enums/task-status")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert "To Do" in data
