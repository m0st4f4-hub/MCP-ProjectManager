from unittest.mock import MagicMock

from backend.services.workflow_service import WorkflowService
from backend.schemas.workflow import WorkflowCreate, WorkflowUpdate


def test_create_workflow_adds_and_commits():
    session = MagicMock()
    service = WorkflowService(session)

    workflow = service.create_workflow(
        WorkflowCreate(name="WF", description=None, workflow_type="basic")
    )

    session.add.assert_called_once()
    session.commit.assert_called_once()
    session.refresh.assert_called_once_with(workflow)
    assert workflow.name == "WF"


def test_update_workflow_updates_fields():
    session = MagicMock()
    service = WorkflowService(session)
    existing = MagicMock()
    service.get_workflow = MagicMock(return_value=existing)

    result = service.update_workflow("1", WorkflowUpdate(name="New"))

    service.get_workflow.assert_called_once_with("1")
    session.commit.assert_called_once()
    session.refresh.assert_called_once_with(existing)
    assert result == existing


def test_update_workflow_returns_none_if_missing():
    session = MagicMock()
    service = WorkflowService(session)
    service.get_workflow = MagicMock(return_value=None)

    result = service.update_workflow("x", WorkflowUpdate(name="n"))

    assert result is None
    session.commit.assert_not_called()
