"""Service layer for Audit Logs."""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import datetime
import uuid
import json
from backend import models

from backend.schemas.audit_log import AuditLogCreate
from backend.models.audit import AuditLog as AuditLogModel
from backend.crud import audit_logs as audit_log_crud # Alias to avoid name collision
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession


class AuditLogService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_log(
        self,
        action: str,
        user_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> AuditLogModel:
        """Helper method to create an audit log entry.

        Args:
            action: Description of the action.
            user_id: ID of the user performing the action (if any).
            details: JSON-serializable dictionary of action details.
        Returns:
            The created AuditLog database model instance.
        """
        audit_log_create = AuditLogCreate(
            user_id=user_id,
            action=action,
            details=details
        )
        # Create the audit log entry using the CRUD function
        # Pass the async session to the CRUD function
        await audit_log_crud.create_audit_log(self.db, audit_log_create)
        return audit_log_create

    def get_log(self, audit_log_id: str) -> Optional[AuditLogModel]:
        """Retrieve a single audit log entry by its ID."""
        return audit_log_crud.get_audit_log(db=self.db, audit_log_id=audit_log_id)

    def get_logs(
        self,
        skip: int = 0,
        limit: int = 100,
        user_id: Optional[str] = None,
        action: Optional[str] = None
    ) -> List[AuditLogModel]:
        """Retrieve multiple audit log entries with optional filtering and pagination."""
        return audit_log_crud.get_audit_logs(
            db=self.db,
            skip=skip,
            limit=limit,
            user_id=user_id,
            action=action
        )

    def get_log_entry(self, log_id: str) -> Optional[models.AuditLog]:
        # Eagerly load user if needed
        return (
            self.db.query(models.AuditLog)
            # .options(joinedload(models.AuditLog.user)) # Uncomment if user
            # relationship needs to be eagerly loaded
            .filter(models.AuditLog.id == log_id)
            .first()
        )

    def get_log_entries_by_entity(
        self,
        entity_type: str,
        entity_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[models.AuditLog]:
        # Eagerly load user if needed
        return (
            self.db.query(models.AuditLog)
            # .options(joinedload(models.AuditLog.user)) # Uncomment if user
            # relationship needs to be eagerly loaded
            .filter(
                models.AuditLog.entity_type == entity_type,
                models.AuditLog.entity_id == entity_id
            )
            .order_by(models.AuditLog.timestamp.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_log_entries_by_user(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[models.AuditLog]:
        # Eagerly load user if needed
        return (
            self.db.query(models.AuditLog)
            # .options(joinedload(models.AuditLog.user)) # Uncomment if user
            # relationship needs to be eagerly loaded
            .filter(models.AuditLog.user_id == user_id)
            .order_by(models.AuditLog.timestamp.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_audit_logs(self) -> List[models.AuditLog]:
        """
        Retrieve all audit logs.
        """
        return self.db.query(models.AuditLog).all()

    def get_audit_logs_by_entity(self, entity_id: str) -> List[models.AuditLog]:
        """
        Retrieve audit logs for a specific entity.
        """
        return self.db.query(models.AuditLog).filter(models.AuditLog.entity_id == entity_id).all()

    # Add methods for getting log entries by date range, action type, etc.
    # as needed.
