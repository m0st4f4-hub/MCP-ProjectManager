import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport
from unittest.mock import MagicMock

from backend.routers.rules.templates import templates as templates_router
from backend.services import rules_service
from backend.database import get_sync_db
from backend.crud import rules as crud_rules


class DummySession:
    def __init__(self):
        self.deleted = []
        self.committed = False

    def query(self, model):
        obj = MagicMock()
        obj.filter.return_value.first.return_value = MagicMock(id="temp1")
        return obj

    def delete(self, obj):
        self.deleted.append(obj)

    def commit(self):
        self.committed = True


async def override_db():
    yield DummySession()


@pytest.mark.asyncio
async def test_delete_prompt_template_endpoint(monkeypatch):
    async def fake_delete(db, template_id):
        return True

    monkeypatch.setattr(crud_rules, "delete_agent_prompt_template", fake_delete)

    app = FastAPI()
    app.dependency_overrides[get_sync_db] = override_db
    app.include_router(templates_router.router)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.delete("/temp1")
    assert resp.status_code == 200
    assert "deleted" in resp.json()["message"]


def test_delete_prompt_template_service_success():
    session = DummySession()
    service = rules_service.RulesService(session)
    result = rules_service.delete_prompt_template(service, "temp1")
    assert result is True
    assert session.deleted
    assert session.committed


def test_delete_prompt_template_service_not_found():
    class EmptySession(DummySession):
        def query(self, model):
            obj = MagicMock()
            obj.filter.return_value.first.return_value = None
            return obj

    session = EmptySession()
    service = rules_service.RulesService(session)
    result = rules_service.delete_prompt_template(service, "missing")
    assert result is False
    assert not session.deleted
    assert session.committed is False
