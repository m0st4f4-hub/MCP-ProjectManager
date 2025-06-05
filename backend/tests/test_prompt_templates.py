import sys
import types
import builtins
from unittest.mock import MagicMock, patch
import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport
import importlib.util
from pathlib import Path
builtins.AgentBehaviorLog = type("AgentBehaviorLog", (), {})
builtins.AgentRuleViolation = type("AgentRuleViolation", (), {})

_crud_stub = types.ModuleType("crud_rules")
setattr(_crud_stub, "delete_agent_prompt_template", lambda *a, **k: True)
sys.modules.setdefault("backend.crud.rules", _crud_stub)
sys.modules.setdefault("backend.schemas.rules", types.ModuleType("rules"))
rules_pkg = types.ModuleType("backend.routers.rules")
templates_pkg = types.ModuleType("backend.routers.rules.templates")
rules_pkg.templates = templates_pkg
sys.modules.setdefault("backend.routers.rules", rules_pkg)
sys.modules.setdefault("backend.routers.rules.templates", templates_pkg)

from backend.services.rules_service import RulesService  # noqa: E402
from backend import services  # noqa: E402

RulesService.__init__ = lambda self, db: setattr(self, "db", db)
services.rules_service.RulesService.delete_prompt_template = (
    services.rules_service.delete_prompt_template
)

spec = importlib.util.spec_from_file_location(
    "backend.routers.rules.templates.templates",
    Path(__file__).resolve().parents[1]
    / "routers"
    / "rules"
    / "templates"
    / "templates.py",
)
templates_module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = templates_module
spec.loader.exec_module(templates_module)
templates_router = templates_module.router
templates_get_db = templates_module.get_db


def test_delete_prompt_template_service_calls_crud():
    session = MagicMock()
    service = RulesService(session)
    with patch(
        "backend.services.rules_service.crud_rules.delete_agent_prompt_template",
        return_value=True,
    ) as mock_del:
        result = service.delete_prompt_template("tid")
        mock_del.assert_called_once_with(session, "tid")
        assert result is True


@pytest.mark.asyncio
async def test_delete_prompt_template_endpoint_success():
    session = MagicMock()

    async def override_db():
        yield session

    app = FastAPI()
    app.include_router(templates_router)
    app.dependency_overrides[templates_get_db] = override_db

    with patch(
        "backend.routers.rules.templates.templates.crud_rules."
        "delete_agent_prompt_template",
        return_value=True,
    ) as mock_del:
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            resp = await client.delete("/123")
        mock_del.assert_called_once_with(session, "123")
        assert resp.status_code == 200
        assert resp.json()["message"] == "Prompt template deleted successfully"


@pytest.mark.asyncio
async def test_delete_prompt_template_endpoint_not_found():
    session = MagicMock()

    async def override_db():
        yield session

    app = FastAPI()
    app.include_router(templates_router)
    app.dependency_overrides[templates_get_db] = override_db

    with patch(
        "backend.routers.rules.templates.templates.crud_rules."
        "delete_agent_prompt_template",
        return_value=False,
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            resp = await client.delete("/123")
        assert resp.status_code == 404
