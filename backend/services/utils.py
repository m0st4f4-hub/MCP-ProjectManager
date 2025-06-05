"""
Transaction utility for service layer operations.
This module provides a context manager for handling database transactions.
"""

from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import logging  # Import service exceptions for consistent error handling
from .exceptions import (
    ServiceError,
    EntityNotFoundError,
    DuplicateEntityError,
    ValidationError
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def service_transaction(
    db: Session, operation_name: str = "database operation"
):
    """Context manager for database transactions in services."""
    try:
        # Assume the session handles transaction boundaries correctly
        yield db
        await db.commit()
    except SQLAlchemyError as err:
        await db.rollback()
        if hasattr(err, "orig") and err.orig is not None:
            if "UNIQUE constraint failed" in str(err.orig).lower():
                raise DuplicateEntityError(
                    entity_name="Unknown", entity_id=operation_name
                ) from err
            elif "NOT NULL constraint failed" in str(err.orig).lower():
                raise ValidationError(
                    f"Required field missing during {operation_name}."
                ) from err
        raise ServiceError(
            f"Database error during {operation_name}: {err}"
        ) from err
    except (
        ServiceError,
        EntityNotFoundError,
        DuplicateEntityError,
        ValidationError,
    ):
        await db.rollback()
        raise
    except Exception as err:  # Log unexpected errors
        await db.rollback()
        raise ServiceError(
            f"Unexpected error during {operation_name}: {err}"
        ) from err
