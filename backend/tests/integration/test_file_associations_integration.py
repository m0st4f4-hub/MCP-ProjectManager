import pytest


@pytest.mark.asyncio
async def test_project_file_association_flow(authenticated_client, test_project):
    """Test the complete file association flow using the properly configured test client."""
    
    resp = await authenticated_client.post(
        "/api/memory/entities/ingest/text",
        json={"text": "hello"},
    )
    assert resp.status_code == 201
    file_id = resp.json()["id"]

    resp = await authenticated_client.post(
        f"/api/v1/projects/{test_project.id}/files/",
        json={"file_id": file_id},
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["file_memory_entity_id"] == file_id

    resp = await authenticated_client.get(
        f"/api/v1/projects/{test_project.id}/files/"
    )
    assert resp.status_code == 200
    assert any(f["file_memory_entity_id"] == file_id for f in resp.json()["data"])

    resp = await authenticated_client.delete(
        f"/api/v1/projects/{test_project.id}/files/{file_id}"
    )
    assert resp.status_code == 200
    assert resp.json()["data"] is True
