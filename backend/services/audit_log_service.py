from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
import uuid
from backend import models


class AuditLogService:
    def __init__(self, db: Session):
        self.db = db

    def create_log_entry(
        self,
        entity_type: str,
        entity_id: str,
        action: str,
        user_id: Optional[str] = None,
        details: Optional[dict] = None
    ) -> models.AuditLog:
        db_log_entry = models.AuditLog(
            id=str(uuid.uuid4()),
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            user_id=user_id,
            details=details,
            timestamp=datetime.datetime.now(datetime.timezone.utc)
        )
        self.db.add(db_log_entry)
        self.db.commit()
        self.db.refresh(db_log_entry)
        # Optionally refresh user relationship if user_id is present
        # if user_id:
        #     self.db.refresh(db_log_entry, attribute_names=['user'])
        return db_log_entry

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

    # Add methods for getting log entries by date range, action type, etc.
    # as needed.
