from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import json

from ...database import get_db
from ...services.audit_log_service import AuditLogService
from ...schemas.api_responses import DataResponse
from ...schemas.audit_log import AuditLog

router = APIRouter()


def get_audit_log_service(db: AsyncSession = Depends(get_db)) -> AuditLogService:
    return AuditLogService(db)


@router.delete("/{log_id}", response_model=DataResponse[AuditLog])
async def delete_audit_log(
    log_id: str,
    audit_log_service: AuditLogService = Depends(get_audit_log_service),
):
    """Delete an audit log by ID."""
    existing_log = await audit_log_service.get_log(log_id)
    if not existing_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit log not found")

    await audit_log_service.delete_log(log_id)
    details = existing_log.details
    if isinstance(details, str):
        try:
            details = json.loads(details)
        except Exception:
            details = None

    log_schema = AuditLog(
        id=existing_log.id,
        user_id=existing_log.user_id,
        action=getattr(existing_log, "action_type", None),
        details=details,
        timestamp=existing_log.timestamp,
    )

    return DataResponse[AuditLog](
        data=log_schema,
        message="Audit log deleted successfully",
    )
