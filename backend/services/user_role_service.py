from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models


class UserRoleService:
    """Service for managing user role assignments."""

    def __init__(self, db: Session) -> None:
        """Initialize the service with a database session."""
        self.db = db

    def assign_role_to_user(
        self, user_id: str, role_name: str
    ) -> Optional[models.UserRole]:
        """Assign a role to a user if it is not already assigned."""
        existing = (
            self.db.query(models.UserRole)
            .filter(
                models.UserRole.user_id == user_id,
                models.UserRole.role_name == role_name,
            )
            .first()
        )
        if existing:
            return existing

        db_user_role = models.UserRole(user_id=user_id, role_name=role_name)
        self.db.add(db_user_role)
        self.db.commit()
        self.db.refresh(db_user_role)
        return db_user_role

    def update_user_role(
        self, user_id: str, old_role_name: str, new_role_name: str
    ) -> Optional[models.UserRole]:
        """Update a user's role from ``old_role_name`` to ``new_role_name``."""
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

        # Prevent duplicate assignments
        duplicate = (
            self.db.query(models.UserRole)
            .filter(
                models.UserRole.user_id == user_id,
                models.UserRole.role_name == new_role_name,
            )
            .first()
        )
        if duplicate:
            return duplicate

        db_user_role.role_name = new_role_name
        self.db.commit()
        self.db.refresh(db_user_role)
        return db_user_role

    def delete_user_role(self, user_id: str, role_name: str) -> bool:
        """Remove a role from a user."""
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

    def list_user_roles(self, user_id: Optional[str] = None) -> List[models.UserRole]:
        """Return all user role assignments, optionally filtered by ``user_id``."""
        query = self.db.query(models.UserRole)
        if user_id is not None:
            query = query.filter(models.UserRole.user_id == user_id)
        return query.all()

    def has_role(self, user_id: str, role_name: str) -> bool:
        """Return ``True`` if the given user has ``role_name`` assigned."""
        return (
            self.db.query(models.UserRole)
            .filter(
                models.UserRole.user_id == user_id,
                models.UserRole.role_name == role_name,
            )
            .first()
            is not None
        )
