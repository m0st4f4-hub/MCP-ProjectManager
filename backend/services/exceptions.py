"""
Service exceptions for consistent error handling.
This module defines custom exceptions for the service layer.
"""

class ServiceError(Exception):
    """Base class for service layer exceptions."""
    pass

class EntityNotFoundError(ServiceError):
    """Raised when an entity is not found."""
    def __init__(self, entity_type: str, entity_id: str):
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.message = f"{entity_type} with ID {entity_id} not found"
        super().__init__(self.message)

class ValidationError(ServiceError):
    """Raised when validation fails."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)

class DuplicateEntityError(ServiceError):
    """Raised when attempting to create a duplicate entity."""
    def __init__(self, entity_type: str, identifier: str):
        self.entity_type = entity_type
        self.identifier = identifier
        self.message = f"{entity_type} with identifier {identifier} already exists"
        super().__init__(self.message)

class AuthorizationError(ServiceError):
    """Raised when an operation is not authorized."""
    def __init__(self, message: str = "Operation not authorized"):
        self.message = message
        super().__init__(message)

class DependencyError(ServiceError):
    """Raised when a dependency operation fails."""
    def __init__(self, dependency: str, message: str):
        self.dependency = dependency
        self.message = f"Dependency error in {dependency}: {message}"
        super().__init__(self.message)

# Aliases for compatibility
NotFoundError = EntityNotFoundError
PermissionError = AuthorizationError
