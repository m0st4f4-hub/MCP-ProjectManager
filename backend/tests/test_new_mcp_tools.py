import types

import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

from backend.routers.mcp.core import (
    router as mcp_router,
    get_db_session,
    get_memory_service,
    get_agent_handoff_service,
)
from backend.routers.rules.roles.capabilities import (
    router as cap_router,
    get_service as get_capability_service,
)
from backend.mcp_tools import user_role_tools


class DummyRoleService:
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


class DummyCapabilityService:
    def __init__(self):
        self.cap = None

    async def list_capabilities(self, agent_role_id: str = None):
        return [self.cap] if self.cap else []

    async def create_capability(self, cap_in):
        self.cap = types.SimpleNamespace(
            id="1",
            agent_role_id=cap_in.agent_role_id,
            capability=cap_in.capability,
            description=cap_in.description,
            is_active=cap_in.is_active,
        )
        return self.cap

    async def update_capability(self, capability_id: str, cap_update):
        if not self.cap or capability_id != self.cap.id:
            return None
        for k, v in cap_update.model_dump(exclude_unset=True).items():
            setattr(self.cap, k, v)
        return self.cap

    async def delete_capability(self, capability_id: str):
        if self.cap and capability_id == self.cap.id:
            self.cap = None
            return True
        return False


class DummyHandoffService:
    def __init__(self):
        self.items = {}
        self.next_id = 1

    def create_criteria(self, criteria):
        obj = types.SimpleNamespace(id=str(self.next_id), **criteria.model_dump())
        self.items[obj.id] = obj
        self.next_id += 1
        return obj

    def list_criteria(self, agent_role_id: str = None):
        if agent_role_id:
            return [c for c in self.items.values() if c.agent_role_id == agent_role_id]
        return list(self.items.values())

    def delete_criteria(self, criteria_id: str):
        return self.items.pop(criteria_id, None) is not None


class DummyMemoryService:
    def __init__(self):
        self.entity = types.SimpleNamespace(
            id=1,
            name="doc",
            type="text",
            description="d",
        )

    def search_entities(self, query: str, limit: int = 10):
        return [(self.entity, 0.9)]

    def search_memory_entities(self, query: str, limit: int = 10):
        return [self.entity]


def override_db():
    yield None


@pytest.mark.asyncio
async def test_user_role_lifecycle(monkeypatch):
    dummy_service = DummyRoleService()
    monkeypatch.setattr(user_role_tools, "_get_service", lambda db: dummy_service)

    app = FastAPI()
    app.include_router(mcp_router)
    app.dependency_overrides[get_db_session] = override_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        resp = await client.post(
            "/mcp-tools/user-role/assign",
            params={"user_id": "u1", "role_name": "admin"},
        )
        assert resp.status_code == 200
        assert resp.json()["success"]

        resp = await client.get(
            "/mcp-tools/user-role/list",
            params={"user_id": "u1"},
        )
        assert resp.status_code == 200
        assert resp.json()["roles"][0]["role_name"] == "admin"

        resp = await client.delete(
            "/mcp-tools/user-role/remove",
            params={"user_id": "u1", "role_name": "admin"},
        )
        assert resp.status_code == 200


@pytest.mark.asyncio
async def test_remove_missing_role(monkeypatch):
    dummy_service = DummyRoleService()
    monkeypatch.setattr(user_role_tools, "_get_service", lambda db: dummy_service)
    app = FastAPI()
    app.include_router(mcp_router)
    app.dependency_overrides[get_db_session] = override_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        resp = await client.delete(
            "/mcp-tools/user-role/remove",
            params={"user_id": "u1", "role_name": "none"},
        )
        assert resp.status_code == 404


@pytest.mark.asyncio
async def test_capability_endpoints(monkeypatch):
    dummy_service = DummyCapabilityService()
    app = FastAPI()
    app.include_router(cap_router)
    app.dependency_overrides[get_capability_service] = lambda: dummy_service

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        resp = await client.post(
            "/role1/capabilities",
            json={"capability": "run", "description": "d", "is_active": True},
        )
        assert resp.status_code == 200
        cap_id = resp.json()["id"]

        resp = await client.get("/role1/capabilities")
        assert resp.status_code == 200
        assert resp.json()[0]["capability"] == "run"

        resp = await client.put(
            f"/capabilities/{cap_id}",
            json={"description": "updated"},
        )
        assert resp.status_code == 200
        assert resp.json()["description"] == "updated"

        resp = await client.delete(f"/capabilities/{cap_id}")
        assert resp.status_code == 200


@pytest.mark.asyncio
async def test_update_missing_capability(monkeypatch):
    dummy_service = DummyCapabilityService()
    app = FastAPI()
    app.include_router(cap_router)
    app.dependency_overrides[get_capability_service] = lambda: dummy_service

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        resp = await client.put(
            "/capabilities/unknown",
            json={"description": "d"},
        )
        assert resp.status_code == 404


@pytest.mark.asyncio
async def test_handoff_tools(monkeypatch):
    dummy_service = DummyHandoffService()
    app = FastAPI()
    app.include_router(mcp_router)
    app.dependency_overrides[get_db_session] = override_db
    app.dependency_overrides[get_agent_handoff_service] = lambda: dummy_service

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        data = {
            "agent_role_id": "role",
            "criteria": "c",
            "description": "d",
            "target_agent_role": "other",
            "is_active": True,
        }
        resp = await client.post("/mcp-tools/handoff/create", json=data)
        assert resp.status_code == 200
        cid = resp.json()["criteria"]["id"]

        resp = await client.get(
            "/mcp-tools/handoff/list",
            params={"agent_role_id": "role"},
        )
        assert resp.status_code == 200
        assert len(resp.json()["criteria"]) == 1

        resp = await client.delete(
            "/mcp-tools/handoff/delete",
            params={"criteria_id": cid},
        )
        assert resp.status_code == 200


@pytest.mark.asyncio
async def test_delete_missing_handoff(monkeypatch):
    dummy_service = DummyHandoffService()
    app = FastAPI()
    app.include_router(mcp_router)
    app.dependency_overrides[get_db_session] = override_db
    app.dependency_overrides[get_agent_handoff_service] = lambda: dummy_service

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        resp = await client.delete(
            "/mcp-tools/handoff/delete",
            params={"criteria_id": "999"},
        )
        assert resp.status_code == 404


@pytest.mark.asyncio
async def test_memory_search_tools(monkeypatch):
    dummy_service = DummyMemoryService()
    app = FastAPI()
    app.include_router(mcp_router)
    app.dependency_overrides[get_db_session] = override_db
    app.dependency_overrides[get_memory_service] = lambda: dummy_service

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        resp = await client.get(
            "/mcp-tools/memory/search",
            params={"query": "doc"},
        )
        assert resp.status_code == 200
        assert resp.json()["results"][0]["name"] == "doc"

        resp = await client.get(
            "/mcp-tools/memory/search-graph",
            params={"query": "doc"},
        )
        assert resp.status_code == 200
        assert resp.json()["results"][0]["name"] == "doc"


@pytest.mark.asyncio
async def test_memory_search_error(monkeypatch):
    class FailingMemoryService(DummyMemoryService):
        def search_entities(self, query: str, limit: int = 10):
            raise RuntimeError("fail")

    app = FastAPI()
    app.include_router(mcp_router)
    app.dependency_overrides[get_db_session] = override_db
    app.dependency_overrides[get_memory_service] = lambda: FailingMemoryService()

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        resp = await client.get("/mcp-tools/memory/search", params={"query": "x"})
        assert resp.status_code == 500
