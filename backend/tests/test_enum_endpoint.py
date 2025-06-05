import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

from backend.routers.enums import router
from backend.enums import TaskStatusEnum

app = FastAPI()
app.include_router(router)


@pytest.mark.asyncio
async def test_task_status_enum_endpoint():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        resp = await client.get("/enums/task-status")
        assert resp.status_code == 200
        data = resp.json()
        assert set(data["data"]) == {status.value for status in TaskStatusEnum}
