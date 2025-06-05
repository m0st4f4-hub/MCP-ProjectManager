import pytest
from httpx import AsyncClient, ASGITransport

from backend.app_factory import create_app
from backend.database import get_sync_db as get_db
from backend.auth import create_access_token


@pytest.mark.asyncio
async def test_project_template_crud(async_db_session, test_user):
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

        create_data = {"name": "Integration Template", "description": "desc"}
        resp = await client.post("/api/templates/", json=create_data)
        assert resp.status_code == 201
        template_id = resp.json()["id"]

        resp = await client.get("/api/templates/")
        assert resp.status_code == 200
        assert any(t["id"] == template_id for t in resp.json())

        resp = await client.put(
            f"/api/templates/{template_id}",
            json={"description": "updated"},
        )
        assert resp.status_code == 200
        assert resp.json()["description"] == "updated"

        resp = await client.delete(f"/api/templates/{template_id}")
        assert resp.status_code == 200
        assert resp.json()["message"] == "Project template deleted successfully"
