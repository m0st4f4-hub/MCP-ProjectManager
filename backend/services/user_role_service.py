from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional


class UserRoleService:
    def __init__(self, db: Session):
        """Initialize with a database session."""
        self.db = db

    def assign_role_to_user(self, user_id: str, role_name: str) -> Optional[models.UserRole]:
        """Assign a role to a user if not already assigned."""
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
        """Remove a role from a user."""
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
        """List roles assigned to a user."""
        return self.db.query(models.UserRole).filter(models.UserRole.user_id == user_id).all()

    def has_role(self, user_id: str, role_name: str) -> bool:
        """Return ``True`` if the user has the specified role."""
        return self.db.query(models.UserRole).filter(
        models.UserRole.user_id == user_id,
        models.UserRole.role_name == role_name
        ).first() is not None
