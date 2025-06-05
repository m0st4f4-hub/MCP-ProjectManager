from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .. import models
from ..enums import UserRoleEnum


class UserRoleService:
    """Async service for managing user roles."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def assign_role_to_user(
        self, user_id: str, role_name: str
    ) -> models.UserRole:
        role_enum = UserRoleEnum(role_name)
        result = await self.db.execute(
            select(models.UserRole).filter(
                models.UserRole.user_id == user_id,
                models.UserRole.role_name == role_enum,
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            return existing

        db_user_role = models.UserRole(user_id=user_id, role_name=role_enum)
        self.db.add(db_user_role)
        await self.db.commit()
        await self.db.refresh(db_user_role)
        return db_user_role

    async def remove_role_from_user(self, user_id: str, role_name: str) -> bool:
        role_enum = UserRoleEnum(role_name)
        result = await self.db.execute(
            select(models.UserRole).filter(
                models.UserRole.user_id == user_id,
                models.UserRole.role_name == role_enum,
            )
        )
        db_user_role = result.scalar_one_or_none()
        if db_user_role:
            await self.db.delete(db_user_role)
            await self.db.commit()
            return True
        return False

    async def get_user_roles(self, user_id: str) -> List[models.UserRole]:
        result = await self.db.execute(
            select(models.UserRole).filter(models.UserRole.user_id == user_id)
        )
        return result.scalars().all()

    async def has_role(self, user_id: str, role_name: str) -> bool:
        role_enum = UserRoleEnum(role_name)
        result = await self.db.execute(
            select(models.UserRole).filter(
                models.UserRole.user_id == user_id,
                models.UserRole.role_name == role_enum,
            )
        )
        return result.scalar_one_or_none() is not None
