import pytest
from pydantic import ValidationError
from backend.schemas.user import UserRoleCreate
from backend.enums import UserRoleEnum


def test_user_role_create_valid():
    role = UserRoleCreate(user_id="u1", role_name=UserRoleEnum.ADMIN)
    assert role.user_id == "u1"
    assert role.role_name is UserRoleEnum.ADMIN


def test_user_role_create_invalid_role():
    with pytest.raises(ValidationError):
        UserRoleCreate(user_id="u1", role_name="invalid")
