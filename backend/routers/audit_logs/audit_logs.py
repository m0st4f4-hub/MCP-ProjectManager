# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session
from typing import List

from ....database import get_sync_db as get_db
from ....services.audit_log_service import AuditLogService

from ....schemas.audit_log import AuditLog, AuditLogCreate


router = APIRouter(
    prefix="/audit_logs",
    tags=["Audit Logs"],
)


def get_audit_log_service(db: Session = Depends(get_db)) -> AuditLogService:
    return AuditLogService(db)


@router.post(
    "/",
    response_model=AuditLog,
    summary="Create Audit Log Entry",
    operation_id="create_audit_log_entry"
)
def create_audit_log_entry_endpoint(
    log_entry: AuditLogCreate,
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Creates a new audit log entry.

    Note: In a real application, creation would likely happen internally in services
    or endpoints when relevant actions occur, not typically via a direct public
    endpoint. This endpoint is included for completeness based on service methods.
    """
    try:
        return audit_log_service.create_log_entry(
            entity_type=log_entry.entity_type,
            entity_id=log_entry.entity_id,
            action=log_entry.action,
            user_id=log_entry.user_id,
            details=log_entry.details
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )


@router.get(
    "/{log_id}",
    response_model=AuditLog,
    summary="Get Audit Log Entry by ID",
    operation_id="get_audit_log_entry_by_id"
)
def get_audit_log_entry_by_id_endpoint(
    log_id: str = Path(
        ..., description="ID of the audit log entry to retrieve."
    ),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Retrieves a specific audit log entry by its ID."""
    db_log_entry = audit_log_service.get_log_entry(log_id=log_id)
    if db_log_entry is None:
        raise HTTPException(
            status_code=404, detail="Audit log entry not found"
        )
    return db_log_entry


@router.get(
    "/entity/{entity_type}/{entity_id}",
    response_model=List[AuditLog],
    summary="Get Audit Log Entries by Entity",
    operation_id="get_audit_log_entries_by_entity"
)
def get_audit_log_entries_by_entity_endpoint(
    entity_type: str = Path(...,
        description="Type of the entity (e.g., 'project', 'task')."),
    entity_id: str = Path(..., description="ID of the entity."),
    skip: int = Query(0, description="Skip the first N entries."),
    limit: int = Query(
        100, description="Limit the number of entries returned."),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Retrieves audit log entries for a specific entity type and ID."""
    return audit_log_service.get_log_entries_by_entity(
        entity_type=entity_type, entity_id=entity_id, skip=skip, limit=limit
    )


@router.get(
    "/user/{user_id}",
    response_model=List[AuditLog],
    summary="Get Audit Log Entries by User",
    operation_id="get_audit_log_entries_by_user"
)
def get_audit_log_entries_by_user_endpoint(
    user_id: str = Path(..., description="ID of the user."),
    skip: int = Query(0, description="Skip the first N entries."),
    limit: int = Query(
        100, description="Limit the number of entries returned."),
    audit_log_service: AuditLogService = Depends(get_audit_log_service)
):
    """Retrieves audit log entries for a specific user."""
    return audit_log_service.get_log_entries_by_user(
        user_id=user_id, skip=skip, limit=limit
    )

