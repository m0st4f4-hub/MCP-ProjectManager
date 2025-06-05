from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models


class UserRoleService:
    """Service for managing user role assignments."""

    def __init__(self, db: Session) -> None:
        """Initialize the service with a database session."""
        self.db = db

    def assign_role_to_user(self, user_id: str, role_name: str) -> models.UserRole:
        """Assign a role to a user if it is not already assigned."""
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

    def update_user_role(
        self, user_id: str, old_role_name: str, new_role_name: str
    ) -> Optional[models.UserRole]:
        """Update a user's role name."""
        db_user_role = (
            self.db.query(models.UserRole)
            .filter(
                models.UserRole.user_id == user_id,
                models.UserRole.role_name == old_role_name,
            )
            .first()
        )
        if not db_user_role:
            return None

        db_user_role.role_name = new_role_name
        self.db.commit()
        self.db.refresh(db_user_role)
        return db_user_role

    def delete_user_role(self, user_id: str, role_name: str) -> bool:
        """Delete a specific role from a user."""
        db_user_role = (
            self.db.query(models.UserRole)
            .filter(
                models.UserRole.user_id == user_id,
                models.UserRole.role_name == role_name,
            )
            .first()
        )
        if not db_user_role:
            return False

        self.db.delete(db_user_role)
        self.db.commit()
        return True

    def remove_role_from_user(self, user_id: str, role_name: str) -> bool:
        """Alias for :meth:`delete_user_role`."""
        return self.delete_user_role(user_id, role_name)

    def list_user_roles(self, user_id: Optional[str] = None) -> List[models.UserRole]:
        """List role assignments, optionally filtered by user."""
        query = self.db.query(models.UserRole)
        if user_id is not None:
            query = query.filter(models.UserRole.user_id == user_id)
        return query.all()

    def get_user_roles(self, user_id: str) -> List[models.UserRole]:
        """Return all roles assigned to a user."""
        return (
            self.db.query(models.UserRole)
            .filter(models.UserRole.user_id == user_id)
            .all()
        )

    def has_role(self, user_id: str, role_name: str) -> bool:
        """Check whether a user has a specific role."""
        return (
            self.db.query(models.UserRole)
            .filter(
                models.UserRole.user_id == user_id,
                models.UserRole.role_name == role_name,
            )
            .first()
            is not None
        )
