import pytest
from backend.enums import UserRoleEnum


@pytest.mark.asyncio
async def test_user_role_crud(authenticated_client, test_user):
    # Assign a role
    resp = await authenticated_client.post(
        f"/api/v1/users/{test_user.id}/roles/",
        json={"user_id": test_user.id, "role_name": UserRoleEnum.VIEWER.value},
    )
    assert resp.status_code == 201
    assert resp.json()["data"]["role_name"] == UserRoleEnum.VIEWER.value

    # List roles
    resp = await authenticated_client.get(f"/api/v1/users/{test_user.id}/roles/")
    assert resp.status_code == 200
    names = [r["role_name"] for r in resp.json()["data"]]
    assert UserRoleEnum.VIEWER.value in names

    # Remove role
    resp = await authenticated_client.delete(
        f"/api/v1/users/{test_user.id}/roles/{UserRoleEnum.VIEWER.value}"
    )
    assert resp.status_code == 200
    assert resp.json()["data"] is True

    resp = await authenticated_client.get(f"/api/v1/users/{test_user.id}/roles/")
    assert resp.status_code == 200
    names = [r["role_name"] for r in resp.json()["data"]]
    assert UserRoleEnum.VIEWER.value not in names
