import pytest
from pydantic import ValidationError
from backend.schemas.agent_capability import AgentCapabilityCreate


def test_capability_create_valid():
    cap = AgentCapabilityCreate(agent_role_id="r1", capability="run")
    assert cap.capability == "run"


def test_capability_missing_field():
    with pytest.raises(ValidationError):
        AgentCapabilityCreate(agent_role_id="r1")
