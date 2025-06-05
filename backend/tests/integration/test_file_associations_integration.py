import pytest
from httpx import AsyncClient, ASGITransport

from backend.app_factory import create_app
from backend.database import get_sync_db as get_db
from backend.auth import create_access_token


@pytest.mark.asyncio
async def test_project_file_association_flow(async_db_session, test_user, test_project):
    app = create_app()

    async def override_db():
        yield async_db_session

    app.dependency_overrides[get_db] = override_db

    token = create_access_token(data={"sub": test_user.username})

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        client.headers.update({"Authorization": f"Bearer {token}"})

        resp = await client.post(
            "/api/memory/entities/ingest/text",
            json={"text": "hello"},
        )
        assert resp.status_code == 201
        file_id = resp.json()["id"]

        resp = await client.post(
            f"/api/v1/projects/{test_project.id}/files/",
            json={"file_id": file_id},
        )
        assert resp.status_code == 200
        assert resp.json()["data"]["file_memory_entity_id"] == file_id

        resp = await client.get(
            f"/api/v1/projects/{test_project.id}/files/"
        )
        assert resp.status_code == 200
        assert any(f["file_memory_entity_id"] == file_id for f in resp.json()["data"])

        resp = await client.delete(
            f"/api/v1/projects/{test_project.id}/files/{file_id}"
        )
        assert resp.status_code == 200
        assert resp.json()["data"] is True
