import pytest
from unittest.mock import MagicMock, patch

from backend.services.project_member_service import ProjectMemberService
from backend.schemas.project import ProjectMemberCreate, ProjectMemberUpdate


def test_add_and_remove_member_calls_crud():
    session = MagicMock()
    service = ProjectMemberService(session)
    with patch("backend.services.project_member_service.add_project_member", new_callable=MagicMock) as mock_add, \
         patch("backend.services.project_member_service.delete_project_member", new_callable=MagicMock) as mock_delete:
        mock_add.return_value = MagicMock()
        mock_delete.return_value = True

        result_add = service.add_member_to_project("p1", "u1", "member")
        result_remove = service.remove_member_from_project("p1", "u1")

        assert result_add == mock_add.return_value
        assert result_remove is True
        mock_add.assert_called_once()
        args = mock_add.call_args.args
        assert args[0] is session
        assert isinstance(args[1], ProjectMemberCreate)
        assert args[1].project_id == "p1"
        mock_delete.assert_called_once_with(session, "p1", "u1")


def test_update_member_role_passes_schema():
    session = MagicMock()
    service = ProjectMemberService(session)
    with patch("backend.services.project_member_service.update_project_member", new_callable=MagicMock) as mock_update:
        mock_update.return_value = MagicMock()
        service.update_member_role("p2", "u2", "owner")
        mock_update.assert_called_once()
        args = mock_update.call_args.args
        assert args[0] is session
        assert args[1] == "p2"
        assert args[2] == "u2"
        assert isinstance(args[3], ProjectMemberUpdate)
        assert args[3].role == "owner"


def test_get_members_and_projects():
    session = MagicMock()
    service = ProjectMemberService(session)
    with patch("backend.services.project_member_service.get_project_members", new_callable=MagicMock) as mock_get_members, \
         patch("backend.services.project_member_service.get_user_projects", new_callable=MagicMock) as mock_user_projects:
        members = [MagicMock()]
        projects = [MagicMock()]
        mock_get_members.return_value = members
        mock_user_projects.return_value = projects

        assert service.get_members_by_project("p3", skip=1, limit=2) == members
        assert service.get_projects_for_user("u3", skip=0, limit=1) == projects
        mock_get_members.assert_called_once_with(session, "p3", skip=1, limit=2)
        mock_user_projects.assert_called_once_with(session, "u3", skip=0, limit=1)
