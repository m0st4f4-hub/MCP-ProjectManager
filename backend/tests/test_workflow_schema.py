import pytest
from pydantic import ValidationError
from backend.schemas.workflow import WorkflowCreate
from backend.schemas.workflow_step import WorkflowStepCreate


def test_workflow_create_valid():
    wf = WorkflowCreate(name="WF", workflow_type="basic")
    assert wf.name == "WF"


def test_workflow_create_missing_name():
    with pytest.raises(ValidationError):
        WorkflowCreate(workflow_type="basic")


def test_workflow_step_valid():
    step = WorkflowStepCreate(workflow_id="w1", agent_role_id="a1", step_order=1, title="step")
    assert step.step_order == 1


def test_workflow_step_missing_order():
    with pytest.raises(ValidationError):
        WorkflowStepCreate(workflow_id="w1", agent_role_id="a1", title="step")
