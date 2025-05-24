from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
import uuid
import json
from backend import models

# Function to create a new audit log entry
def create_audit_log(
    db: Session,
    entity_type: str,
    entity_id: str,
    action: str,
    user_id: Optional[str] = None,
    details: Optional[dict] = None
) -> models.AuditLog:
    # Explicitly serialize details to JSON string for SQLite
    details_json = json.dumps(details) if details is not None else None

    db_log_entry = models.AuditLog(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        user_id=user_id,
        details=details_json,
        timestamp=datetime.datetime.now(datetime.timezone.utc)
    )
    db.add(db_log_entry)
    db.commit()
    db.refresh(db_log_entry)
    # Optionally refresh user relationship if user_id is present
    # if user_id:
    #     db.refresh(db_log_entry, attribute_names=['user'])
    return db_log_entry

# Function to get a single audit log entry by ID
def get_audit_log(db: Session, log_id: int) -> Optional[models.AuditLog]: # Changed log_id type to int
    # Eagerly load user if needed
    return (
        db.query(models.AuditLog)
        # .options(joinedload(models.AuditLog.user)) # Uncomment if user
        # relationship needs to be eagerly loaded
        .filter(models.AuditLog.id == log_id)
        .first()
    )

# Function to get audit log entries by entity
def get_audit_logs_by_entity(
    db: Session,
    entity_type: str,
    entity_id: str,
    skip: int = 0,
    limit: int = 100
) -> List[models.AuditLog]:
    # Eagerly load user if needed
    return (
        db.query(models.AuditLog)
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

# Function to get audit log entries by user
def get_audit_logs_by_user(
    db: Session,
    user_id: str,
    skip: int = 0,
    limit: int = 100
) -> List[models.AuditLog]:
    # Eagerly load user if needed
    return (
        db.query(models.AuditLog)
        # .options(joinedload(models.AuditLog.user)) # Uncomment if user
        # relationship needs to be eagerly loaded
        .filter(models.AuditLog.user_id == user_id)
        .order_by(models.AuditLog.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

# Function to delete an audit log entry by ID
def delete_audit_log(db: Session, log_id: int) -> bool: # Changed log_id type to int
    db_log = db.query(models.AuditLog).filter(models.AuditLog.id == log_id).first()
    if db_log:
        db.delete(db_log)
        db.commit()
        return True
    return False

# Add functions for getting log entries by date range, action type, etc.
# as needed.
