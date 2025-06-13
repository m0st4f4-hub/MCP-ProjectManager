from sqlalchemy.orm import Session
from typing import List, Optional

from backend import models
from schemas.user import UserRoleCreate, UserRoleUpdate


class UserRoleService:
    def __init__(self, db: Session):
        self.db = db

    def create_user_role(self, user_role: UserRoleCreate) -> models.UserRole:
        db_user_role = models.UserRole(**user_role.model_dump())
        self.db.add(db_user_role)
        self.db.commit()
        self.db.refresh(db_user_role)
        return db_user_role

    def get_user_role(self, user_role_id: str) -> Optional[models.UserRole]:
        return (
            self.db.query(models.UserRole)
            .filter(models.UserRole.id == user_role_id)
            .first()
        )

    def get_user_roles(self, skip: int = 0, limit: int = 100) -> List[models.UserRole]:
        return self.db.query(models.UserRole).offset(skip).limit(limit).all()

    def get_user_roles_by_user_id(self, user_id: str) -> List[models.UserRole]:
        return (
            self.db.query(models.UserRole)
            .filter(models.UserRole.user_id == user_id)
            .all()
        )

    def update_user_role(
        self, user_role_id: str, user_role_update: UserRoleUpdate
    ) -> Optional[models.UserRole]:
        db_user_role = self.get_user_role(user_role_id)
        if not db_user_role:
            return None
        update_data = user_role_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_user_role, key, value)
        self.db.commit()
        self.db.refresh(db_user_role)
        return db_user_role

    def delete_user_role(self, user_role_id: str) -> bool:
        db_user_role = self.get_user_role(user_role_id)
        if not db_user_role:
            return False
        self.db.delete(db_user_role)
        self.db.commit()
        return True

    def get_user_roles_by_role_name(self, role_name: str) -> List[models.UserRole]:
        return (
            self.db.query(models.UserRole)
            .filter(models.UserRole.role_name == role_name)
            .all()
        )

    def assign_role_to_user(self, user_id: str, role_name: str) -> models.UserRole:
        # Check if user already has this role
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

        user_role = UserRoleCreate(user_id=user_id, role_name=role_name)
        return self.create_user_role(user_role)

    def remove_role_from_user(self, user_id: str, role_name: str) -> bool:
        user_role = (
            self.db.query(models.UserRole)
            .filter(
                models.UserRole.user_id == user_id,
                models.UserRole.role_name == role_name,
            )
            .first()
        )
        if not user_role:
            return False
        self.db.delete(user_role)
        self.db.commit()
        return True

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
