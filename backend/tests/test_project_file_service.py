from unittest.mock import MagicMock, patch

from backend.services.project_file_association_service import ProjectFileAssociationService
from backend.schemas.project import ProjectFileAssociationCreate


def test_associate_and_disassociate_file():
    session = MagicMock()
    service = ProjectFileAssociationService(session)
    with patch(
        "backend.services.project_file_association_service.create_project_file_association",
        new_callable=MagicMock,
    ) as mock_create, patch(
        "backend.services.project_file_association_service.delete_project_file_association",
        new_callable=MagicMock,
    ) as mock_delete:
        created = MagicMock()
        mock_create.return_value = created
        mock_delete.return_value = True

        result_create = service.associate_file_with_project("p1", 1)
        result_delete = service.disassociate_file_from_project("p1", 1)

        mock_create.assert_called_once()
        args = mock_create.call_args.args
        assert args[0] is session
        assert isinstance(args[1], ProjectFileAssociationCreate)
        assert args[1].project_id == "p1"
        assert result_create == created
        mock_delete.assert_called_once_with(session, "p1", 1)
        assert result_delete is True


def test_associate_multiple_files_skips_existing():
    session = MagicMock()
    service = ProjectFileAssociationService(session)
    with patch.object(service, "get_association", new_callable=MagicMock) as mock_get, patch(
        "backend.services.project_file_association_service.create_project_file_association",
        new_callable=MagicMock,
    ) as mock_create:
        mock_get.side_effect = [None, MagicMock()]
        mock_create.return_value = "new"
        result = service.associate_multiple_files_with_project("p2", [1, 2])
        mock_create.assert_called_once()
        assert result == ["new"]


import pytest


@pytest.mark.asyncio
async def test_get_project_files_passes_pagination():
    session = MagicMock()
    service = ProjectFileAssociationService(session)
    with patch(
        "backend.services.project_file_association_service.get_project_files",
        new_callable=MagicMock,
    ) as mock_crud:
        mock_crud.return_value = []
        await service.get_project_files("p1", skip=5, limit=10)
        mock_crud.assert_called_once_with(session, "p1", skip=5, limit=10)
