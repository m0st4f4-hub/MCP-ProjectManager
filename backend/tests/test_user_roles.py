import types
import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

from backend.routers.users.roles import router, get_role_service
from backend.enums import UserRoleEnum


class DummyService:
    def __init__(self):
        self.roles = {}

    def assign_role_to_user(self, user_id: str, role_name: str):
        role = types.SimpleNamespace(user_id=user_id, role_name=role_name)
        self.roles.setdefault(user_id, []).append(role)
        return role

    def get_user_roles(self, user_id: str):
        return self.roles.get(user_id, [])

    def remove_role_from_user(self, user_id: str, role_name: str):
        roles = self.roles.get(user_id, [])
        for r in roles:
            if r.role_name == role_name:
                roles.remove(r)
                return True
        return False

    def update_user_role(self, user_id: str, current_role_name: str, new_role_name: str):
        roles = self.roles.get(user_id, [])
        for r in roles:
            if r.role_name == current_role_name:
                r.role_name = new_role_name
                return r
        return None


dummy_service = DummyService()


def override_service():
    return dummy_service


app = FastAPI()
app.include_router(router)
app.dependency_overrides[get_role_service] = override_service


@pytest.mark.asyncio
async def test_role_lifecycle():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/123/roles/",
            json={"user_id": "123", "role_name": UserRoleEnum.ADMIN.value},
        )
        assert resp.status_code == 201

        resp = await client.get("/123/roles/")
        assert resp.status_code == 200
        assert len(resp.json()["data"]) == 1

        resp = await client.put(
            "/123/roles/admin",
            json={"role_name": UserRoleEnum.MANAGER.value},
        )
        assert resp.status_code == 200
        assert resp.json()["data"]["role_name"] == UserRoleEnum.MANAGER.value

        resp = await client.delete("/123/roles/manager")
        assert resp.status_code == 200
        assert resp.json()["data"] is True

        resp = await client.get("/123/roles/")
        assert resp.json()["data"] == []


@pytest.mark.asyncio
async def test_remove_missing_role():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.delete("/999/roles/manager")
        assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_missing_role():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.put(
            "/999/roles/manager",
            json={"role_name": UserRoleEnum.ADMIN.value},
        )
        assert resp.status_code == 404
