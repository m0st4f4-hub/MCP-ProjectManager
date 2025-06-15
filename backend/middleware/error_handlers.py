"""
Error handling middleware for API routes.
This module provides middleware for handling exceptions in FastAPI routes.
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from schemas.api_responses import ErrorResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import traceback
import uuid
from datetime import datetime, timezone

from backend.services.exceptions import (
    ServiceError,
    EntityNotFoundError,
    ValidationError,
    DuplicateEntityError,
    AuthorizationError,
    ConflictError,
)

logger = logging.getLogger(__name__)

async def service_exception_handler(request: Request, exc: ServiceError):
    """Handle service layer exceptions."""
    error_id = str(uuid.uuid4())

    if isinstance(exc, EntityNotFoundError):
        status_code = status.HTTP_404_NOT_FOUND
    elif isinstance(exc, ValidationError):
        status_code = status.HTTP_400_BAD_REQUEST
    elif isinstance(exc, (DuplicateEntityError, ConflictError)):
        status_code = status.HTTP_409_CONFLICT
    elif isinstance(exc, AuthorizationError):
        status_code = status.HTTP_403_FORBIDDEN
    else:
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

    logger.error(
        f"Service error {error_id}: {exc.__class__.__name__} - {str(exc)}"
    )

    err = ErrorResponse(
        message=str(exc),
        error_code=exc.__class__.__name__,
        error_details={"error_id": error_id}
    )
    return JSONResponse(status_code=status_code, content=err.model_dump())

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors."""
    error_id = str(uuid.uuid4())

    logger.error(f"Validation error {error_id}: {exc}")

    err = ErrorResponse(
        message="Validation error",
        error_code="RequestValidationError",
        error_details={"errors": exc.errors(), "error_id": error_id}
    )
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content=err.model_dump())

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions."""
    error_id = str(uuid.uuid4())

    logger.error(f"HTTP error {error_id}: {exc.status_code} - {exc.detail}")

    err = ErrorResponse(
        message=exc.detail,
        error_code=f"HTTP{exc.status_code}",
        error_details={"error_id": error_id}
    )
    return JSONResponse(status_code=exc.status_code, content=err.model_dump())

async def general_exception_handler(request: Request, exc: Exception):
    """Handle unhandled exceptions."""
    error_id = str(uuid.uuid4())

    logger.error(
        f"Unhandled exception {error_id}: {exc.__class__.__name__} - {str(exc)}"
    )
    logger.error(traceback.format_exc())

    err = ErrorResponse(
        message="Internal server error",
        error_code="InternalServerError",
        error_details={"error_id": error_id}
    )
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=err.model_dump())

def register_exception_handlers(app):
    """Register all exception handlers."""
    app.add_exception_handler(ServiceError, service_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
