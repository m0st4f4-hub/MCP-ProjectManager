import pytest
from pydantic import ValidationError
from backend.schemas.agent_handoff_criteria import AgentHandoffCriteriaCreate


def test_handoff_criteria_valid():
    crit = AgentHandoffCriteriaCreate(agent_role_id="r1", criteria="done")
    assert crit.criteria == "done"


def test_handoff_missing_agent_role():
    with pytest.raises(ValidationError):
        AgentHandoffCriteriaCreate(criteria="oops")
