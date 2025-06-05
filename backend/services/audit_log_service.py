"""
Service layer for audit log operations.
Provides high-level business logic for audit logs.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

# Import CRUD operations
from backend.crud import audit_logs as audit_log_crud
from backend.models.audit import AuditLog as AuditLogModel
from backend.schemas.audit_log import AuditLogCreate, AuditLogUpdate

from sqlalchemy.ext.asyncio import AsyncSession  # Import AsyncSession


class AuditLogService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_log(
        self,
        action: str,
        user_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> AuditLogModel:
        """Create an audit log entry.

        :param action: Description of the action
        :param user_id: ID of the acting user, if any
        :param details: Optional details about the event
        :returns: The created ``AuditLog`` model
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

    async def get_log(self, audit_log_id: str) -> Optional[AuditLogModel]:
        """Retrieve a single audit log entry.

        :param audit_log_id: ID of the log to fetch
        :returns: The ``AuditLog`` instance or ``None``
        """
        return await audit_log_crud.get_audit_log(db=self.db, audit_log_id=audit_log_id)

    async def get_logs(
        self,
        skip: int = 0,
        limit: int = 100,
        user_id: Optional[str] = None,
        action_filter: Optional[str] = None
    ) -> List[AuditLogModel]:
        """Return multiple audit logs.

        :param skip: Number of records to skip
        :param limit: Maximum number of records
        :param user_id: Filter logs for a specific user
        :param action_filter: Filter by action string
        :returns: A list of ``AuditLog`` records
        """
        return await audit_log_crud.get_audit_logs(
            db=self.db,
            skip=skip,
            limit=limit,
            user_id=user_id,
            action_filter=action_filter
        )

    async def update_log(
        self,
        audit_log_id: str,
        audit_log_update: AuditLogUpdate
    ) -> Optional[AuditLogModel]:
        """Update an audit log entry.

        :param audit_log_id: ID of the log to update
        :param audit_log_update: Fields to modify
        :returns: The updated ``AuditLog`` or ``None``
        """
        return await audit_log_crud.update_audit_log(
            db=self.db,
            audit_log_id=audit_log_id,
            audit_log_update=audit_log_update
        )

    async def delete_log(self, audit_log_id: str) -> Optional[AuditLogModel]:
        """Delete an audit log entry.

        :param audit_log_id: ID of the log to remove
        :returns: The deleted ``AuditLog`` or ``None``
        """
        return await audit_log_crud.delete_audit_log(
            db=self.db,
            audit_log_id=audit_log_id
        )

    async def log_user_action(
        self,
        user_id: str,
        action: str,
        details: Optional[Dict[str, Any]] = None
    ) -> AuditLogModel:
        """Record an action performed by a user.

        :param user_id: Acting user ID
        :param action: Action description
        :param details: Optional action details
        :returns: The created ``AuditLog``
        """
        return await self.create_log(
            action=action,
            user_id=user_id,
            details=details
        )

    async def log_system_action(
        self,
        action: str,
        details: Optional[Dict[str, Any]] = None
    ) -> AuditLogModel:
        """Record a system generated action.

        :param action: Action description
        :param details: Optional action details
        :returns: The created ``AuditLog``
        """
        return await self.create_log(
            action=action,
            user_id=None,  # System actions don't have a user
            details=details
        )
