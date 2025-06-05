import pytest
from httpx import AsyncClient
from backend.main import create_app
from backend.database import get_db
from backend.auth import create_access_token


@pytest.mark.asyncio
async def test_project_file_association_flow(async_db_session, test_project, test_user):
    app = create_app()

    async def override_db():
        yield async_db_session

    app.dependency_overrides[get_db] = override_db

    token = create_access_token(data={"sub": test_user.username})
    headers = {"Authorization": f"Bearer {token}"}

    async with AsyncClient(app=app, base_url="http://test", headers=headers) as client:
        mem_resp = await client.post(
            "/api/memory/entities/",
            json={"entity_type": "file", "content": "data", "source": "test"},
        )
        assert mem_resp.status_code == 201
        memory_id = mem_resp.json()["id"]

        assoc_resp = await client.post(
            f"/api/v1/projects/{test_project.id}/files",
            json={"file_id": memory_id},
        )
        assert assoc_resp.status_code == 200
        assert assoc_resp.json()["data"]["file_memory_entity_id"] == memory_id

        list_resp = await client.get(
            f"/api/v1/projects/{test_project.id}/files"
        )
        assert list_resp.status_code == 200
        assert any(f["file_memory_entity_id"] == memory_id for f in list_resp.json()["data"])

        del_resp = await client.delete(
            f"/api/v1/projects/{test_project.id}/files/{memory_id}"
        )
        assert del_resp.status_code == 200

        list_resp2 = await client.get(
            f"/api/v1/projects/{test_project.id}/files"
        )
        assert all(
            f["file_memory_entity_id"] != memory_id for f in list_resp2.json()["data"]
        )
