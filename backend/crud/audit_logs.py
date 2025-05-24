"""CRUD operations for Audit Logs."""

from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
import uuid
import json
from backend import models
from backend.models.audit import AuditLog as AuditLogModel
from backend.schemas.audit_log import AuditLogCreate

# Function to create a new audit log entry
def create_audit_log(db: Session, audit_log: AuditLogCreate) -> AuditLogModel:
    """Create a new audit log entry."""
    db_audit_log = AuditLogModel(
        user_id=audit_log.user_id,
        action_type=audit_log.action,
        description=audit_log.details.get("description"), # Assuming details might have a description field
        details=json.dumps(audit_log.details) if audit_log.details else None # Convert dict to JSON string
    )
    db.add(db_audit_log)
    db.commit()
    db.refresh(db_audit_log)
    return db_audit_log

# Function to get a single audit log entry by ID
def get_audit_log(db: Session, audit_log_id: str) -> Optional[AuditLogModel]:
    """Retrieve a single audit log entry by its ID."""
    return db.query(AuditLogModel).filter(AuditLogModel.id == audit_log_id).first()

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

def get_audit_logs(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[str] = None,
    action: Optional[str] = None
) -> List[AuditLogModel]:
    """Retrieve multiple audit log entries with optional filtering and pagination."""
    query = db.query(AuditLogModel)

    if user_id:
        query = query.filter(AuditLogModel.user_id == user_id)
    
    if action:
        query = query.filter(AuditLogModel.action.ilike(f"%{action}%")) # Case-insensitive search for action

    return query.order_by(AuditLogModel.timestamp.desc()).offset(skip).limit(limit).all()
