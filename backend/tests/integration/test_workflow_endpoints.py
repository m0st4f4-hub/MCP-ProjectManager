import pytest


@pytest.mark.asyncio
async def test_workflow_crud_flow(authenticated_client):
    payload = {"name": "Test Workflow", "workflow_type": "generic"}
    resp = await authenticated_client.post("/api/v1/workflows/", json=payload)
    assert resp.status_code == 201
    workflow_id = resp.json()["id"]

    list_resp = await authenticated_client.get("/api/v1/workflows/")
    assert list_resp.status_code == 200
    ids = [w["id"] for w in list_resp.json()]
    assert workflow_id in ids

    delete_resp = await authenticated_client.delete(f"/api/v1/workflows/{workflow_id}")
    assert delete_resp.status_code == 200

    final_list = await authenticated_client.get("/api/v1/workflows/")
    assert workflow_id not in [w["id"] for w in final_list.json()]
