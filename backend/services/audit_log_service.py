"""
Service for managing audit logs.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from backend import models
from sqlalchemy import select

class AuditLogService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_log(self, user_id: str, action: str, details: Optional[dict] = None) -> models.AuditLog:
        """Creates a new audit log entry."""
        log_entry = models.AuditLog(
            user_id=user_id,
            action=action,
            details=details
        )
        self.db.add(log_entry)
        await self.db.commit()
        await self.db.refresh(log_entry)
        return log_entry

    async def get_logs(self, skip: int = 0, limit: int = 100) -> List[models.AuditLog]:
        """Retrieves a list of audit logs."""
        result = await self.db.execute(
            select(models.AuditLog)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all() 