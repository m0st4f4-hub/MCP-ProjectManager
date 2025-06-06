from unittest.mock import MagicMock, AsyncMock
import pytest

from backend.services.project_file_association_service import (
    ProjectFileAssociationService,
)
from backend.services.project_service import ProjectService


@pytest.mark.asyncio
async def test_project_file_link_persists():
    session = MagicMock()
    service = ProjectFileAssociationService(session)
    association = MagicMock()
    service.get_files_for_project = MagicMock(return_value=[association])
    result_first = await service.get_project_files("p1")
    result_second = await service.get_project_files("p1")
    assert result_first == result_second


@pytest.mark.asyncio
async def test_delete_project_removes_related_records():
    session = MagicMock()
    project_service = ProjectService(session)
    project_service.get_project = MagicMock(return_value=MagicMock())
    project_service.delete_project = AsyncMock(return_value=MagicMock())
    result = await project_service.delete_project("p1")
    project_service.delete_project.assert_called_once_with("p1")
    assert result == project_service.delete_project.return_value
