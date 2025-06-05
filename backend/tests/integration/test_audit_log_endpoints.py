import pytest
from httpx import AsyncClient
from backend.main import create_app
from backend.database import get_db
from backend.auth import create_access_token


@pytest.mark.asyncio
async def test_audit_log_endpoints(async_db_session, test_project, test_user):
    app = create_app()

    async def override_db():
        yield async_db_session

    app.dependency_overrides[get_db] = override_db

    token = create_access_token(data={"sub": test_user.username})
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "entity_type": "project",
        "entity_id": str(test_project.id),
        "action": "create",
        "user_id": "u123",
        "details": {"info": "test"},
    }

    async with AsyncClient(app=app, base_url="http://test", headers=headers) as client:
        create_resp = await client.post("/api/audit-logs/", json=payload)
        assert create_resp.status_code == 201
        log_id = create_resp.json()["id"]

        get_resp = await client.get(f"/api/audit-logs/{log_id}")
        assert get_resp.status_code == 200
        assert get_resp.json()["id"] == log_id

        entity_resp = await client.get(
            f"/api/audit-logs/entity/project/{test_project.id}"
        )
        assert entity_resp.status_code == 200
        assert any(log["id"] == log_id for log in entity_resp.json())

        user_resp = await client.get(f"/api/audit-logs/user/{payload['user_id']}")
        assert user_resp.status_code == 200
        assert any(log["id"] == log_id for log in user_resp.json())
