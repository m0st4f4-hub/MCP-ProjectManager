import sys
import types
import importlib.util
import os

# flake8: noqa

import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport
from datetime import datetime, timezone

from backend.schemas.universal_mandate import UniversalMandate

# Provide dummy CRUD module to satisfy imports
dummy_crud = types.ModuleType("backend.crud.rules")
dummy_crud.get_universal_mandates = lambda db, active_only=True: []
dummy_crud.create_universal_mandate = lambda db, mandate: None
dummy_crud.update_universal_mandate = lambda db, mandate_id, update: None
sys.modules.setdefault("backend.crud.rules", dummy_crud)

# Stub RulesService before importing router
class DummyRulesService:
    def __init__(self, db=None):
        self.mandates = {}

    def delete_universal_mandate(self, mandate_id: str):
        return self.mandates.pop(mandate_id, None)


dummy_service = DummyRulesService()
dummy_rules_service_module = types.ModuleType("backend.services.rules_service")


class StubService:
    def __init__(self, db=None):
        self.inner = dummy_service

    def delete_universal_mandate(self, mandate_id: str):
        return self.inner.delete_universal_mandate(mandate_id)


dummy_rules_service_module.RulesService = StubService
sys.modules.setdefault(
    "backend.services.rules_service", dummy_rules_service_module
)

# Load mandates router module directly
module_path = os.path.join(
    os.path.dirname(__file__), "..", "routers", "rules", "mandates", "mandates.py"
)
spec = importlib.util.spec_from_file_location(
    "backend.routers.rules.mandates.mandates", module_path
)
mandates_mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mandates_mod)

router = mandates_mod.router
get_rules_service = mandates_mod.get_rules_service

# Prepare dummy mandate data
dummy_service.mandates = {
    "1": UniversalMandate(
        id="1",
        title="Test",
        description="Desc",
        priority=5,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
}


def override_service():
    return dummy_service


app = FastAPI()
app.include_router(router)
app.dependency_overrides[get_rules_service] = override_service


@pytest.mark.asyncio
async def test_delete_mandate_success():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.delete("/mandates/1")
        assert resp.status_code == 200
        assert resp.json()["id"] == "1"
        assert "1" not in dummy_service.mandates


@pytest.mark.asyncio
async def test_delete_mandate_not_found():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.delete("/mandates/999")
        assert resp.status_code == 404
