import uuid
import pytest
import types
import sys

sys.modules.setdefault("backend.crud.rules", types.ModuleType("crud_rules"))
sys.modules.setdefault("backend.schemas.rules", types.ModuleType("rules"))
_crud_stub = sys.modules["backend.crud.rules"]
_rules_module = sys.modules["backend.schemas.rules"]

for name in ["add_forbidden_action", "get_forbidden_actions", "remove_forbidden_action"]:
    setattr(_crud_stub, name, None)
for _n in [
    "AgentRoleCreate",
    "AgentRoleUpdate",
    "ConstraintCreate",
    "ConstraintUpdate",
    "CapabilityCreate",
    "CapabilityUpdate",
    "MandateCreate",
    "MandateUpdate",
    "ErrorProtocolCreate",
    "ErrorProtocolUpdate",
    "ValidationResult",
]:
    setattr(_rules_module, _n, type(_n, (), {}))

from backend.services.agent_capability_service import AgentCapabilityService
from backend.services.agent_forbidden_action_service import AgentForbiddenActionService
from backend.schemas.agent_capability import AgentCapabilityCreate, AgentCapabilityUpdate
from backend.schemas.agent_forbidden_action import AgentForbiddenActionCreate
from backend.models.agent import AgentRole


@pytest.mark.asyncio
async def test_agent_capability_service_crud(async_db_session):
    role = AgentRole(
        name="Role",
        display_name="Role",
        primary_purpose="test",
        is_active=True,
    )
    async_db_session.add(role)
    await async_db_session.commit()
    await async_db_session.refresh(role)

    service = AgentCapabilityService(async_db_session)
    cap_create = AgentCapabilityCreate(
        agent_role_id=role.id,
        capability="do",
        description="desc",
        is_active=True,
    )
    created = await service.create_capability(cap_create)
    assert created.capability == "do"

    fetched = await service.get_capability(created.id)
    assert fetched.id == created.id

    listed = await service.list_capabilities(role.id)
    assert len(listed) == 1 and listed[0].id == created.id

    updated = await service.update_capability(created.id, AgentCapabilityUpdate(description="new"))
    assert updated.description == "new"

    assert await service.delete_capability(created.id) is True
    assert await service.get_capability(created.id) is None


@pytest.mark.asyncio
async def test_agent_forbidden_action_service_crud(monkeypatch, async_db_session):
    calls = {}

    async def fake_add(db, role_id, action, reason=None):
        calls["add"] = (role_id, action, reason)
        return types.SimpleNamespace(id="1", action=action)

    async def fake_list(db, role_id):
        calls["list"] = role_id
        return [types.SimpleNamespace(id="1", action="jump")]

    async def fake_remove(db, action_id):
        calls["remove"] = action_id
        return True

    fake_crud = types.SimpleNamespace(
        add_forbidden_action=fake_add,
        get_forbidden_actions=fake_list,
        remove_forbidden_action=fake_remove,
    )

    monkeypatch.setattr(
        "backend.services.agent_forbidden_action_service.crud_rules", fake_crud
    )

    service = AgentForbiddenActionService(async_db_session)
    created = await service.create_forbidden_action("r1", "jump", reason="no")
    assert created.action == "jump"
    assert calls["add"] == ("r1", "jump", "no")

    actions = await service.list_forbidden_actions("r1")
    assert len(actions) == 1
    assert calls["list"] == "r1"

    assert await service.delete_forbidden_action("1") is True
    assert calls["remove"] == "1"

