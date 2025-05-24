from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional


class UserRoleService:
    def __init__(self, db: Session):
        self.db = db

    def assign_role_to_user(self, user_id: str, role_name: str) -> Optional[models.UserRole]:
        # Check if the user and role exist (optional, depending on schema constraints)
        # user = self.db.query(models.User).filter(models.User.id == user_id).first()
        # role = self.db.query(models.Role).filter(models.Role.name == role_name).first() # Assuming a separate Role model if roles are predefined
        # if not user or not role:
        #     return None

        # Check if the role is already assigned
        existing_role = self.db.query(models.UserRole).filter(
            models.UserRole.user_id == user_id,
            models.UserRole.role_name == role_name
        ).first()

        if existing_role:
            return existing_role  # Role already assigned

        db_user_role = models.UserRole(user_id=user_id, role_name=role_name)
        self.db.add(db_user_role)
        self.db.commit()
        self.db.refresh(db_user_role)
        return db_user_role

    def remove_role_from_user(self, user_id: str, role_name: str) -> bool:
        db_user_role = self.db.query(models.UserRole).filter(
            models.UserRole.user_id == user_id,
            models.UserRole.role_name == role_name
        ).first()

        if db_user_role:
            self.db.delete(db_user_role)
            self.db.commit()
            return True
        return False  # Role not found or not assigned

    def get_user_roles(self, user_id: str) -> List[models.UserRole]:
        return self.db.query(models.UserRole).filter(models.UserRole.user_id == user_id).all()

    # You might add other methods like checking if a user has a specific role
    def has_role(self, user_id: str, role_name: str) -> bool:
        return self.db.query(models.UserRole).filter(
            models.UserRole.user_id == user_id,
            models.UserRole.role_name == role_name
        ).first() is not None
