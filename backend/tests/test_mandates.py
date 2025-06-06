import builtins
import types
from unittest.mock import MagicMock, patch
import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

# provide dummy crud.rules module before imports
_crud_stub = types.ModuleType("crud_rules")
for _n in [
    "generate_agent_prompt_from_rules",
    "validate_task_against_agent_rules",
    "get_agent_role_by_name",
    "create_agent_role",
    "log_agent_behavior",
    "log_rule_violation",
    "get_agent_role_with_details",
    "get_universal_mandates",
    "create_universal_mandate",
    "add_agent_capability",
    "add_forbidden_action",
    "delete_universal_mandate",
]:
    setattr(_crud_stub, _n, lambda *a, **k: None)
setattr(_crud_stub, "AgentRole", type("AgentRole", (), {}))
setattr(_crud_stub, "UniversalMandate", type("UniversalMandate", (), {}))
sys.modules.setdefault("backend.crud.rules", _crud_stub)
sys.modules.setdefault("backend.schemas.rules", types.ModuleType("rules"))

import importlib.util
from pathlib import Path

mandates_path = Path(__file__).resolve().parents[1] / "routers/rules/mandates/mandates.py"
spec = importlib.util.spec_from_file_location(
    "backend.routers.rules.mandates.mandates", mandates_path
)
mandates = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mandates)

router = mandates.router
get_db = mandates.get_db

# Stub global schemas used in services before importing service
builtins.AgentBehaviorLog = type("AgentBehaviorLog", (), {})
builtins.AgentRuleViolation = type("AgentRuleViolation", (), {})
from backend.services.rules_service import RulesService
from backend import services
services.rules_service.RulesService.delete_universal_mandate = services.rules_service.delete_universal_mandate

RulesService.__init__ = lambda self, db: setattr(self, "db", db)


def override_db(mock_db):
    def _override():
        yield mock_db
    return _override


def create_test_app(db):
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_db] = override_db(db)
    return app


async def call_delete(app, mandate_id="mid"):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        return await client.delete(f"/{mandate_id}")


@pytest.mark.asyncio
async def test_delete_universal_mandate_service_calls_crud():
    session = MagicMock()
    service = RulesService(session)
    with patch("backend.services.rules_service.crud_rules.delete_universal_mandate", return_value=True) as mock_del:
        result = await service.delete_universal_mandate("mid")
        assert result is True
        mock_del.assert_called_once_with(session, "mid")


@pytest.mark.asyncio
async def test_delete_mandate_endpoint_success():
    db = MagicMock()
    app = create_test_app(db)
    with patch.object(mandates.crud_rules, "delete_universal_mandate", return_value=True) as mock_del:
        resp = await call_delete(app, "123")
        assert resp.status_code == 200
        assert resp.json()["message"] == "Universal mandate deleted successfully"
        mock_del.assert_called_once_with(db, "123")


@pytest.mark.asyncio
async def test_delete_mandate_endpoint_not_found():
    db = MagicMock()
    app = create_test_app(db)
    with patch.object(mandates.crud_rules, "delete_universal_mandate", return_value=False):
        resp = await call_delete(app, "123")
        assert resp.status_code == 404


