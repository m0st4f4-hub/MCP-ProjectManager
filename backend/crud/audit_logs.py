"""CRUD operations for Audit Logs."""

from sqlalchemy.orm import Session
from typing import List, Optional
import json
from backend import models
from backend.models.audit import AuditLog as AuditLogModel
from backend.schemas.audit_log import AuditLogCreate, AuditLogUpdate  # Import async equivalents and necessary functions
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete


async def create_audit_log(db: AsyncSession, audit_log: AuditLogCreate) -> AuditLogModel:
    """Create a new audit log entry."""
    db_audit_log = AuditLogModel(
    user_id=audit_log.user_id,
    action_type=audit_log.action,
    description=audit_log.details.get("description"),  # Assuming details might have a description field
    details=json.dumps(audit_log.details) if audit_log.details else None  # Convert dict to JSON string
    )
    db.add(db_audit_log)  # Await commit and refresh
    await db.commit()
    await db.refresh(db_audit_log)
    return db_audit_log  # Function to get a single audit log entry by ID  # Convert to async function and use AsyncSession


async def get_audit_log(db: AsyncSession, audit_log_id: str) -> Optional[AuditLogModel]:
    """Retrieve a single audit log entry by its ID."""  # Use async execute with select
    result = await db.execute(select(AuditLogModel).filter(AuditLogModel.id == audit_log_id))  # Use .scalar_one_or_none() for a single result
    return result.scalar_one_or_none()  # Function to get audit log entries by entity  # Convert to async function and use AsyncSession


async def get_audit_logs_by_entity(
db: AsyncSession,
entity_type: str,
entity_id: str,
skip: int = 0,
limit: int = 100
) -> List[models.AuditLog]:  # Eagerly load user if needed  # Use async execute with select, offset, and limit
    result = await db.execute(
    select(models.AuditLog)  # .options(joinedload(models.AuditLog.user))  # Uncomment if user  # relationship needs to be eagerly loaded
    .filter(
    models.AuditLog.entity_type == entity_type,
    models.AuditLog.entity_id == entity_id
    )
    .order_by(models.AuditLog.timestamp.desc())
    .offset(skip)
    .limit(limit)
    )  # Use .scalars().all() for multiple results
    return result.scalars().all()  # Function to get audit log entries by user  # Convert to async function and use AsyncSession


async def get_audit_logs_by_user(
db: AsyncSession,
user_id: str,
skip: int = 0,
limit: int = 100
) -> List[models.AuditLog]:  # Eagerly load user if needed  # Use async execute with select, offset, and limit
    result = await db.execute(
    select(models.AuditLog)  # .options(joinedload(models.AuditLog.user))  # Uncomment if user  # relationship needs to be eagerly loaded
    .filter(models.AuditLog.user_id == user_id)
    .order_by(models.AuditLog.timestamp.desc())
    .offset(skip)
    .limit(limit)
    )  # Use .scalars().all() for multiple results
    return result.scalars().all()  # Function to delete an audit log entry by ID  # Convert to async function and use AsyncSession


async def delete_audit_log(db: AsyncSession, log_id: int) -> bool:  # Changed log_id type to int  # Use async execute with select first to get the object if we want to return it
    db_log = await get_audit_log(db, str(log_id))  # Await the async function call and convert log_id to string
    if db_log:
        await db.delete(db_log)  # Await the async delete operation
        await db.commit()  # Await commit
        return True
    return False  # Add functions for getting log entries by date range, action type, etc.  # as needed.  # Convert to async function and use AsyncSession


async def get_audit_logs(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[str] = None,
    action: Optional[str] = None
) -> List[AuditLogModel]:
    """Retrieve multiple audit log entries with optional filtering and pagination."""
    # Use async select and execute
    query = select(AuditLogModel)

    if user_id:
        query = query.filter(AuditLogModel.user_id == user_id)

    if action:
        query = query.filter(AuditLogModel.action.ilike(f"%{action}%"))  # Case-insensitive search for action

    result = await db.execute(query.order_by(AuditLogModel.timestamp.desc()).offset(skip).limit(limit))
    return result.scalars().all()


async def update_audit_log(
    db: AsyncSession,
    audit_log_id: str,
    audit_log_update: AuditLogUpdate
) -> Optional[AuditLogModel]:
    """Update an existing audit log entry."""
    # Get the existing audit log
    db_audit_log = await get_audit_log(db, audit_log_id)
    if not db_audit_log:
        return None
    
    # Update fields that are provided in the update schema
    update_data = audit_log_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "action":
            # Map 'action' from schema to 'action_type' in model
            db_audit_log.action_type = value
        elif field == "details":
            # Convert dict to JSON string for storage
            db_audit_log.details = json.dumps(value) if value else None
        elif hasattr(db_audit_log, field):
            setattr(db_audit_log, field, value)
    
    # Commit the changes
    await db.commit()
    await db.refresh(db_audit_log)
    return db_audit_log
