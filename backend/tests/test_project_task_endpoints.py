import uuid
import pytest


@pytest.mark.asyncio
async def test_list_projects_includes_fixture(authenticated_client, test_project):
    response = await authenticated_client.get("/api/v1/projects/")
    assert response.status_code == 200
    project_names = [p["name"] for p in response.json()["data"]]
    assert test_project.name in project_names


@pytest.mark.asyncio
async def test_get_project_by_id(authenticated_client, test_project):
    response = await authenticated_client.get(
        f"/api/v1/projects/{test_project.id}"
    )
    assert response.status_code == 200
    assert response.json()["data"]["id"] == str(test_project.id)


@pytest.mark.asyncio
async def test_get_project_not_found(authenticated_client):
    missing_id = uuid.uuid4()
    response = await authenticated_client.get(f"/api/v1/projects/{missing_id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_project_via_api(authenticated_client):
    payload = {"name": "New API Project", "description": "Created in test"}
    response = await authenticated_client.post(
        "/api/v1/projects/",
        json=payload,
    )
    assert response.status_code == 201
    assert response.json()["data"]["name"] == payload["name"]


@pytest.mark.asyncio
async def test_task_crud_flow(authenticated_client, test_project):
    create_payload = {"title": "Test Task", "project_id": str(test_project.id)}
    create_resp = await authenticated_client.post("/api/v1/tasks/", json=create_payload)
    assert create_resp.status_code == 201
    task_id = create_resp.json()["data"]["id"]

    list_resp = await authenticated_client.get(
        f"/api/v1/tasks/?project_id={test_project.id}"
    )
    assert list_resp.status_code == 200
    ids = [t["id"] for t in list_resp.json()["data"]]
    assert task_id in ids

    update_resp = await authenticated_client.put(
        f"/api/v1/tasks/{task_id}", json={"title": "Updated"}
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["data"]["title"] == "Updated"

    delete_resp = await authenticated_client.delete(f"/api/v1/tasks/{task_id}")
    assert delete_resp.status_code == 200

    final_list = await authenticated_client.get(
        f"/api/v1/tasks/?project_id={test_project.id}"
    )
    remaining_ids = [t["id"] for t in final_list.json()["data"]]
    assert task_id not in remaining_ids


@pytest.mark.asyncio
async def test_create_task_requires_project(authenticated_client):
    resp = await authenticated_client.post(
        "/api/v1/tasks/",
        json={"title": "No Project"},
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_projects_pagination(authenticated_client):
    # create additional projects
    for i in range(2):
        await authenticated_client.post(
            "/api/v1/projects/",
            json={"name": f"P{i}"}
        )

    resp = await authenticated_client.get("/api/v1/projects/?skip=1&limit=1")
    assert resp.status_code == 200
    assert len(resp.json()["data"]) == 1


@pytest.mark.asyncio
async def test_tasks_pagination(authenticated_client, test_project):
    for i in range(3):
        await authenticated_client.post(
            "/api/v1/tasks/",
            json={"title": f"t{i}", "project_id": str(test_project.id)}
        )

    resp = await authenticated_client.get(
        f"/api/v1/tasks/?project_id={test_project.id}&skip=1&limit=1"
    )
    assert resp.status_code == 200
    assert len(resp.json()["data"]) == 1
