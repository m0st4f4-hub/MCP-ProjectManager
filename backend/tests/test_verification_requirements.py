import types
from datetime import datetime, timezone

import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

from backend.routers.verification_requirements import router, get_service


class DummyService:
    def __init__(self):
        self.items = {}
        self.counter = 0

    def create_requirement(self, req):
        self.counter += 1
        item = types.SimpleNamespace(
            id=str(self.counter),
            agent_role_id=req.agent_role_id,
            requirement=req.requirement,
            description=req.description,
            is_mandatory=req.is_mandatory,
            created_at=datetime.now(timezone.utc),
        )
        self.items[item.id] = item
        return item

    def list_requirements(self, agent_role_id=None):
        if agent_role_id:
            return [i for i in self.items.values() if i.agent_role_id == agent_role_id]
        return list(self.items.values())

    def delete_requirement(self, requirement_id):
        if requirement_id in self.items:
            del self.items[requirement_id]
            return True
        return False


dummy_service = DummyService()


def override_service():
    return dummy_service


app = FastAPI()
app.include_router(router)
app.dependency_overrides[get_service] = override_service


@pytest.mark.asyncio
async def test_requirement_lifecycle():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/verification-requirements/",
            json={"agent_role_id": "role1", "requirement": "do X"},
        )
        assert resp.status_code == 201
        req_id = resp.json()["id"]

        resp = await client.get("/verification-requirements/", params={"agent_role_id": "role1"})
        assert resp.status_code == 200
        assert len(resp.json()) == 1

        resp = await client.delete(f"/verification-requirements/{req_id}")
        assert resp.status_code == 200

        resp = await client.get("/verification-requirements/", params={"agent_role_id": "role1"})
        assert resp.status_code == 200
        assert resp.json() == []
