import pytest
from httpx import AsyncClient
from backend.main import create_app
from backend.database import get_db
from backend.auth import create_access_token


@pytest.mark.asyncio
async def test_project_template_crud_flow(async_db_session, test_user):
    app = create_app()

    async def override_db():
        yield async_db_session

    app.dependency_overrides[get_db] = override_db

    token = create_access_token(data={"sub": test_user.username})
    headers = {"Authorization": f"Bearer {token}"}

    payload = {"name": "Temp1", "description": "desc", "template_data": {}}

    async with AsyncClient(app=app, base_url="http://test", headers=headers) as client:
        create_resp = await client.post("/api/templates/", json=payload)
        assert create_resp.status_code == 201
        template_id = create_resp.json()["id"]

        list_resp = await client.get("/api/templates/")
        assert list_resp.status_code == 200
        ids = [t["id"] for t in list_resp.json()]
        assert template_id in ids

        get_resp = await client.get(f"/api/templates/{template_id}")
        assert get_resp.status_code == 200

        update_resp = await client.put(
            f"/api/templates/{template_id}", json={"description": "updated"}
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["description"] == "updated"

        del_resp = await client.delete(f"/api/templates/{template_id}")
        assert del_resp.status_code == 200
        assert "deleted" in del_resp.json()["message"].lower()

        missing_resp = await client.get(f"/api/templates/{template_id}")
        assert missing_resp.status_code == 404
