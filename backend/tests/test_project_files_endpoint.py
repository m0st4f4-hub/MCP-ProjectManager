import types
import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

from backend.routers.projects.files import (
    router,
    get_project_file_association_service,
    get_current_active_user,
)
from backend.schemas.api_responses import PaginationParams

class DummyService:
    def __init__(self):
        self.calls = []
    async def get_project_files(self, project_id: str, pagination: PaginationParams):
        self.calls.append((project_id, pagination.page, pagination.page_size))
        return []


dummy_service = DummyService()

def override_service():
    return dummy_service

def override_user():
    return types.SimpleNamespace(id="u1")

app = FastAPI()
app.include_router(router)
app.dependency_overrides[get_project_file_association_service] = override_service
app.dependency_overrides[get_current_active_user] = override_user

@pytest.mark.asyncio
async def test_get_project_files_pagination():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/123/files?page=2&pageSize=5")
        assert resp.status_code == 200
    assert dummy_service.calls[1] == ("123", 2, 5)

