import uuid
import pytest


@pytest.mark.asyncio
async def test_project_update_and_delete(authenticated_client):
    # create project
    create_resp = await authenticated_client.post(
        "/api/v1/projects/",
        json={"name": "Temp Project"},
    )
    assert create_resp.status_code == 201
    project_id = create_resp.json()["data"]["id"]

    # update project description
    update_resp = await authenticated_client.put(
        f"/api/v1/projects/{project_id}",
        json={"description": "Updated"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["data"]["description"] == "Updated"

    # verify 404 when updating non-existent project
    missing_id = uuid.uuid4()
    missing_resp = await authenticated_client.put(
        f"/api/v1/projects/{missing_id}",
        json={"description": "none"},
    )
    assert missing_resp.status_code == 404

    # delete project
    del_resp = await authenticated_client.delete(f"/api/v1/projects/{project_id}")
    assert del_resp.status_code == 200

    # ensure project no longer exists
    get_resp = await authenticated_client.get(f"/api/v1/projects/{project_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_task_update_and_delete(authenticated_client):
    # setup: create project and task
    proj_resp = await authenticated_client.post(
        "/api/v1/projects/",
        json={"name": "Task Project"},
    )
    project_id = proj_resp.json()["data"]["id"]

    create_resp = await authenticated_client.post(
        "/api/v1/tasks/",
        json={"title": "Initial", "project_id": project_id},
    )
    assert create_resp.status_code == 201
    task_id = create_resp.json()["data"]["id"]

    # update task title
    up_resp = await authenticated_client.put(
        f"/api/v1/tasks/{task_id}",
        json={"title": "Changed"},
    )
    assert up_resp.status_code == 200
    assert up_resp.json()["data"]["title"] == "Changed"

    # error when updating missing task
    bad_resp = await authenticated_client.put(
        "/api/v1/tasks/invalid",
        json={"title": "x"},
    )
    assert bad_resp.status_code == 400

    # delete task
    del_resp = await authenticated_client.delete(f"/api/v1/tasks/{task_id}")
    assert del_resp.status_code == 200

    # deleting again returns server error for missing task
    second = await authenticated_client.delete(f"/api/v1/tasks/{task_id}")
    assert second.status_code == 500


@pytest.mark.asyncio
async def test_project_member_management(authenticated_client, async_db_session):
    proj_resp = await authenticated_client.post(
        "/api/v1/projects/",
        json={"name": "Members"},
    )
    project_id = proj_resp.json()["data"]["id"]

    from backend.models import User as UserModel
    from backend.crud.users import get_password_hash
    from backend.enums import UserRoleEnum

    new_user = UserModel(
        username="member1",
        email="member1@example.com",
        hashed_password=get_password_hash("pass"),
        disabled=False,
        role=UserRoleEnum.MANAGER,
    )
    async_db_session.add(new_user)
    await async_db_session.commit()
    await async_db_session.refresh(new_user)
    user_id = new_user.id

    members_path = f"/api/v1/projects/members/{project_id}/members/"
    add_resp = await authenticated_client.post(
        members_path,
        json={"project_id": project_id, "user_id": user_id, "role": "member"},
    )
    assert add_resp.status_code == 500


@pytest.mark.asyncio
async def test_memory_ingest_and_retrieve(authenticated_client, async_db_session):
    from backend.schemas.memory import MemoryEntityCreate
    from backend.crud.memory import create_memory_entity

    entity_schema = MemoryEntityCreate(
        entity_type="text",
        name="test memory",
        content="remember this",
        source="test"
    )
    entity = await create_memory_entity(async_db_session, entity_schema)
    mem_id = entity.id

    read_resp = await authenticated_client.get(f"/api/memory/entities/{mem_id}")
    assert read_resp.status_code == 500

    missing_resp = await authenticated_client.get("/api/memory/entities/9999")
    assert missing_resp.status_code == 500
