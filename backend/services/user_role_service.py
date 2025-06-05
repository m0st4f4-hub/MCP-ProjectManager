from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models


class UserRoleService:
    def __init__(self, db: Session):
        self.db = db

    def assign_role_to_user(self, user_id: str, role_name: str) -> Optional[models.UserRole]:
        existing_role = (
            self.db.query(models.UserRole)
            .filter(
                models.UserRole.user_id == user_id,
                models.UserRole.role_name == role_name,
            )
            .first()
        )
        if existing_role:
            return existing_role

        db_user_role = models.UserRole(user_id=user_id, role_name=role_name)
        self.db.add(db_user_role)
        self.db.commit()
        self.db.refresh(db_user_role)
        return db_user_role

    def remove_role_from_user(self, user_id: str, role_name: str) -> bool:
        db_user_role = (
            self.db.query(models.UserRole)
            .filter(
                models.UserRole.user_id == user_id,
                models.UserRole.role_name == role_name,
            )
            .first()
        )
        if db_user_role:
            self.db.delete(db_user_role)
            self.db.commit()
            return True
        return False

    def get_user_roles(self, user_id: str, skip: int = 0, limit: Optional[int] = 100) -> List[models.UserRole]:
        query = (
            self.db.query(models.UserRole)
            .filter(models.UserRole.user_id == user_id)
        )
        if limit is not None:
            query = query.offset(skip).limit(limit)
        return query.all()

    def has_role(self, user_id: str, role_name: str) -> bool:
        return (
            self.db.query(models.UserRole)
            .filter(
                models.UserRole.user_id == user_id,
                models.UserRole.role_name == role_name,
            )
            .first()
            is not None
        )
