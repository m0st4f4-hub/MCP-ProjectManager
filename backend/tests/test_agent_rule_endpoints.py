import types
import uuid
import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport
from backend.routers.rules.roles import capabilities as cap_router
from backend.routers.rules.roles import forbidden_actions as forbid_router


class DummyCapService:
    async def list_capabilities(self, agent_role_id=None):
        return []

    async def create_capability(self, data):
        return {}

    async def update_capability(self, capability_id, update):
        return {}

    async def delete_capability(self, capability_id):
        return True


class DummyForbidService:
    async def list_forbidden_actions(self, role_id):
        return []

    async def create_forbidden_action(self, role_id, action, reason=None):
        return {}

    async def delete_forbidden_action(self, action_id):
        return True


dummy_user = types.SimpleNamespace(id="u1")

def override_user():
    return dummy_user


@pytest.mark.asyncio
async def test_capabilities_require_auth():
    app = FastAPI()
    app.include_router(cap_router.router)
    app.dependency_overrides[cap_router.get_service] = lambda: DummyCapService()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://t") as client:
        resp = await client.get(f"/{uuid.uuid4().hex}/capabilities")
        assert resp.status_code == 401


@pytest.mark.asyncio
async def test_capabilities_invalid_id():
    app = FastAPI()
    app.include_router(cap_router.router)
    app.dependency_overrides[cap_router.get_service] = lambda: DummyCapService()
    app.dependency_overrides[cap_router.get_current_active_user] = override_user

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://t") as client:
        resp = await client.get("/bad/capabilities")
        assert resp.status_code == 422


@pytest.mark.asyncio
async def test_forbidden_actions_require_auth():
    app = FastAPI()
    app.include_router(forbid_router.router)
    app.dependency_overrides[forbid_router.get_service] = lambda: DummyForbidService()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://t") as client:
        resp = await client.get(f"/{uuid.uuid4().hex}/forbidden-actions")
        assert resp.status_code == 401

