import uuid
import pytest

from backend.models import Project as ProjectModel


@pytest.mark.asyncio
async def test_archive_and_unarchive_project(authenticated_client, async_db_session, test_project):
    # Archive the project
    resp = await authenticated_client.post(f"/api/v1/projects/{test_project.id}/archive")
    assert resp.status_code == 200
    assert resp.json()["data"]["is_archived"] is True

    refreshed = await async_db_session.get(ProjectModel, test_project.id)
    assert refreshed.is_archived is True

    # Unarchive the project
    resp = await authenticated_client.post(f"/api/v1/projects/{test_project.id}/unarchive")
    assert resp.status_code == 200
    assert resp.json()["data"]["is_archived"] is False

    refreshed = await async_db_session.get(ProjectModel, test_project.id)
    assert refreshed.is_archived is False


@pytest.mark.asyncio
async def test_archive_project_not_found(authenticated_client):
    missing_id = uuid.uuid4()
    resp = await authenticated_client.post(f"/api/v1/projects/{missing_id}/archive")
    assert resp.status_code == 404
