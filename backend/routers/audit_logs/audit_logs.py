# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List

from ....database import get_db
from ....services.audit_log_service import AuditLogService
from ....schemas.audit_log import AuditLog, AuditLogCreate
from ....schemas.api_responses import DataResponse, ListResponse


router = APIRouter(
    prefix="/audit_logs",
    tags=["Audit Logs"],
)


async def get_audit_log_service(db: Annotated[AsyncSession, Depends(get_db)]) -> AuditLogService:
    return AuditLogService(db)


@router.post(
    "/",
    response_model=DataResponse[AuditLog],
    status_code=status.HTTP_201_CREATED,
    summary="Create Audit Log Entry",
    operation_id="create_audit_log_entry"
)
async def create_audit_log(
    audit_log: AuditLogCreate,
    audit_service: Annotated[AuditLogService, Depends(get_audit_log_service)]
):
    """
    Creates a new audit log entry.

    Note: In a real application, creation would likely happen internally in services
    or endpoints when relevant actions occur, not typically via a direct public
    endpoint. This endpoint is included for completeness based on service methods.
    
    - **entity_type**: Type of entity being audited
    - **entity_id**: ID of the entity
    - **action**: Action performed
    - **user_id**: User who performed the action
    - **details**: Additional details about the action
    """
    try:
        new_log = await audit_service.create_audit_log(audit_log)
        return DataResponse(
            data=new_log,
            message="Audit log entry created successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating audit log entry: {str(e)}"
        )


@router.get(
    "/",
    response_model=ListResponse[AuditLog],
    summary="Get Audit Logs",
    operation_id="get_audit_logs"
)
async def get_audit_logs(
    skip: Annotated[int, Query(0, ge=0, description="Number of entries to skip")],
    limit: Annotated[int, Query(100, ge=1, le=100, description="Maximum number of entries to return")],
    user_id: Annotated[str, Query(None, description="Filter by user ID")],
    action: Annotated[str, Query(None, description="Filter by action type")],
    audit_service: Annotated[AuditLogService, Depends(get_audit_log_service)]
):
    """Get audit log entries with optional filtering."""
    try:
        logs = await audit_service.get_audit_logs(
            skip=skip, limit=limit, user_id=user_id, action=action
        )
        return ListResponse(
            data=logs,
            total=len(logs),
            message="Audit logs retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving audit logs: {str(e)}"
        )


@router.get(
    "/{audit_log_id}",
    response_model=DataResponse[AuditLog],
    summary="Get Audit Log Entry",
    operation_id="get_audit_log_entry"
)
async def get_audit_log(
    audit_log_id: Annotated[str, Path(description="Audit log ID")],
    audit_service: Annotated[AuditLogService, Depends(get_audit_log_service)]
):
    """Get a specific audit log entry by ID."""
    try:
        log = await audit_service.get_audit_log(audit_log_id)
        if not log:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit log entry not found"
            )
        return DataResponse(
            data=log,
            message="Audit log entry retrieved successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving audit log entry: {str(e)}"
        )


@router.get(
    "/entity/{entity_type}/{entity_id}",
    response_model=ListResponse[AuditLog],
    summary="Get Audit Log Entries by Entity",
    operation_id="get_audit_log_entries_by_entity"
)
def get_audit_log_entries_by_entity_endpoint(
    entity_type: Annotated[str, Path(description="Type of the entity (e.g., 'project', 'task')")],
    entity_id: Annotated[str, Path(description="ID of the entity")],
    skip: Annotated[int, Query(0, description="Skip the first N entries")],
    limit: Annotated[int, Query(100, description="Limit the number of entries returned")],
    audit_log_service: Annotated[AuditLogService, Depends(get_audit_log_service)]
):
    """
    Retrieves audit log entries for a specific entity type and ID.
    
    Returns a paginated list of audit log entries for the specified entity.
    """
    entries = audit_log_service.get_log_entries_by_entity(
        entity_type=entity_type, entity_id=entity_id, skip=skip, limit=limit
    )
    return ListResponse(
        data=entries,
        total=len(entries),
        page=int(skip/limit) + 1 if limit > 0 else 1,
        page_size=limit,
        has_more=len(entries) == limit,
        message=f"Retrieved {len(entries)} audit log entries for {entity_type}/{entity_id}"
    )


@router.get(
    "/user/{user_id}",
    response_model=ListResponse[AuditLog],
    summary="Get Audit Log Entries by User",
    operation_id="get_audit_log_entries_by_user"
)
def get_audit_log_entries_by_user_endpoint(
    user_id: Annotated[str, Path(description="ID of the user")],
    skip: Annotated[int, Query(0, description="Skip the first N entries")],
    limit: Annotated[int, Query(100, description="Limit the number of entries returned")],
    audit_log_service: Annotated[AuditLogService, Depends(get_audit_log_service)]
):
    """
    Retrieves audit log entries for a specific user.
    
    Returns a paginated list of all actions performed by the specified user.
    """
    entries = audit_log_service.get_log_entries_by_user(
        user_id=user_id, skip=skip, limit=limit
    )
    return ListResponse(
        data=entries,
        total=len(entries),
        page=int(skip/limit) + 1 if limit > 0 else 1,
        page_size=limit,
        has_more=len(entries) == limit,
        message=f"Retrieved {len(entries)} audit log entries for user {user_id}"
    )

