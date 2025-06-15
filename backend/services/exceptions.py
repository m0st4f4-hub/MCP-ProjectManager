"""
Simple exceptions for single-user mode.
"""
from fastapi import HTTPException, status


class TaskManagerException(Exception):
    """Base exception for task manager."""
    pass


class NotFoundError(TaskManagerException):
    """Resource not found exception."""
    pass


class ValidationError(TaskManagerException):
    """Validation error exception."""
    pass


class ConflictError(TaskManagerException):
    """Conflict error exception."""
    pass


class DuplicateEntityError(ConflictError):
    """Duplicate entity found."""
    def __init__(self, entity_name: str, entity_id: str):
        super().__init__(f"{entity_name} with id '{entity_id}' already exists.")


class EntityNotFoundError(TaskManagerException):
    """Entity not found exception."""
    pass


class ServiceError(TaskManagerException):
    """Service error exception."""
    pass


class AuthorizationError(TaskManagerException):
    """Authorization error exception."""
    pass


# FastAPI HTTP Exceptions for convenience
def not_found_exception(detail: str = "Resource not found"):
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def validation_exception(detail: str = "Validation error"):
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def conflict_exception(detail: str = "Resource conflict"):
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)