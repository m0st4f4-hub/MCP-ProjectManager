"""
Transaction utility for service layer operations.
This module provides a context manager for handling database transactions.
"""

from contextlib import contextmanager, asynccontextmanager
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import logging

# Import service exceptions for consistent error handling
from backend.services.exceptions import ServiceError, EntityNotFoundError, DuplicateEntityError, ValidationError

logger = logging.getLogger(__name__)

@asynccontextmanager
async def service_transaction(db: Session, operation_name: str = "database operation"):
    """Context manager for database transactions in services."""
    try:
        # In an async context, beginning a transaction might be implicit or require specific handling
        # For now, assuming the session handles transaction boundaries correctly with await commit/rollback
        yield db
        await db.commit()
    except SQLAlchemyError as e:
        await db.rollback()
        # Log the error with operation_name for context
        # Example: logger.error(f"SQLAlchemyError during {operation_name}: {e}")
        # Convert SQLAlchemyError to a more generic ServiceError or a specific one if identifiable
        # This helps decouple service layer from direct SQLAlchemy exceptions if needed elsewhere
        if hasattr(e, 'orig') and e.orig is not None:
            if "UNIQUE constraint failed" in str(e.orig).lower():
                # Extract more specific details if possible, or use a generic message
                raise DuplicateEntityError(entity_name="Unknown", entity_id=operation_name) from e
            elif "NOT NULL constraint failed" in str(e.orig).lower():
                raise ValidationError(f"Required field missing during {operation_name}.") from e
        # Add more specific error mappings as needed
        # If e.orig doesn't exist or isn't a standard DBAPIError, or doesn't match known constraints
        raise ServiceError(f"Database error during {operation_name}: {str(e)}") from e
    except (ServiceError, EntityNotFoundError, DuplicateEntityError, ValidationError) as e:
        # Allow service-specific exceptions to propagate directly
        await db.rollback()
        raise
    except Exception as e:
        await db.rollback()
        # Log unexpected errors
        # Example: logger.error(f"Unexpected error during {operation_name}: {e}", exc_info=True)
        raise ServiceError(f"Unexpected error during {operation_name}: {str(e)}") from e
