"""
Base Service Layer with Async Repository Pattern and Unified Error Handling.
Provides consistent patterns for all service implementations.
"""

from abc import ABC, abstractmethod
from typing import TypeVar, Generic, List, Optional, Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_
from sqlalchemy.orm import selectinload
import logging
from datetime import datetime

from .exceptions import EntityNotFoundError, ValidationError, DuplicateEntityError
from ..models.base import BaseModel

T = TypeVar('T', bound=BaseModel)
logger = logging.getLogger(__name__)


class AsyncRepository(Generic[T], ABC):
    """Base async repository for consistent data access patterns."""
    
    def __init__(self, db: AsyncSession, model_class: type[T]):
        self.db = db
        self.model_class = model_class
        
    async def get_by_id(self, entity_id: str, include_archived: bool = False) -> Optional[T]:
        """Get entity by ID with optional archived inclusion."""
        query = select(self.model_class).where(self.model_class.id == entity_id)
        
        # Filter archived if model supports it
        if hasattr(self.model_class, 'is_archived') and not include_archived:
            query = query.where(self.model_class.is_archived == False)
            
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_id_or_raise(self, entity_id: str, include_archived: bool = False) -> T:
        """Get entity by ID or raise EntityNotFoundError."""
        entity = await self.get_by_id(entity_id, include_archived)
        if not entity:
            raise EntityNotFoundError(f"{self.model_class.__name__} with id {entity_id} not found")
        return entity
    
    async def list_all(
        self, 
        skip: int = 0, 
        limit: int = 100,
        include_archived: bool = False,
        order_by: Optional[str] = None
    ) -> List[T]:
        """List entities with pagination and filtering."""
        query = select(self.model_class)
        
        # Filter archived if model supports it
        if hasattr(self.model_class, 'is_archived') and not include_archived:
            query = query.where(self.model_class.is_archived == False)
            
        # Apply ordering
        if order_by:
            if hasattr(self.model_class, order_by):
                query = query.order_by(getattr(self.model_class, order_by))
        elif hasattr(self.model_class, 'created_at'):
            query = query.order_by(self.model_class.created_at.desc())
            
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def count_all(self, include_archived: bool = False) -> int:
        """Count total entities."""
        from sqlalchemy import func
        query = select(func.count(self.model_class.id))
        
        if hasattr(self.model_class, 'is_archived') and not include_archived:
            query = query.where(self.model_class.is_archived == False)
            
        result = await self.db.execute(query)
        return result.scalar_one()
    
    async def create(self, entity_data: Dict[str, Any]) -> T:
        """Create new entity."""
        try:
            entity = self.model_class(**entity_data)
            self.db.add(entity)
            await self.db.flush()  # Get ID without committing
            await self.db.refresh(entity)
            return entity
        except Exception as e:
            logger.error(f"Error creating {self.model_class.__name__}: {e}")
            raise ValidationError(f"Failed to create {self.model_class.__name__}: {str(e)}")
    
    async def update(self, entity_id: str, update_data: Dict[str, Any]) -> T:
        """Update existing entity."""
        entity = await self.get_by_id_or_raise(entity_id)
        
        try:
            # Update fields
            for key, value in update_data.items():
                if hasattr(entity, key):
                    setattr(entity, key, value)
            
            # Update timestamp if available
            if hasattr(entity, 'updated_at'):
                entity.updated_at = datetime.utcnow()
                
            await self.db.flush()
            await self.db.refresh(entity)
            return entity
        except Exception as e:
            logger.error(f"Error updating {self.model_class.__name__} {entity_id}: {e}")
            raise ValidationError(f"Failed to update {self.model_class.__name__}: {str(e)}")
    
    async def delete(self, entity_id: str, soft_delete: bool = True) -> bool:
        """Delete entity (soft delete by default if supported)."""
        entity = await self.get_by_id_or_raise(entity_id)
        
        try:
            if soft_delete and hasattr(entity, 'is_archived'):
                # Soft delete
                entity.is_archived = True
                if hasattr(entity, 'archived_at'):
                    entity.archived_at = datetime.utcnow()
                await self.db.flush()
            else:
                # Hard delete
                await self.db.delete(entity)
                await self.db.flush()
            return True
        except Exception as e:
            logger.error(f"Error deleting {self.model_class.__name__} {entity_id}: {e}")
            raise ValidationError(f"Failed to delete {self.model_class.__name__}: {str(e)}")
    
    async def exists(self, entity_id: str) -> bool:
        """Check if entity exists."""
        entity = await self.get_by_id(entity_id)
        return entity is not None
    
    async def find_by_field(self, field_name: str, field_value: Any) -> List[T]:
        """Find entities by field value."""
        if not hasattr(self.model_class, field_name):
            raise ValidationError(f"Field {field_name} not found on {self.model_class.__name__}")
            
        query = select(self.model_class).where(getattr(self.model_class, field_name) == field_value)
        result = await self.db.execute(query)
        return list(result.scalars().all())


class BaseService(ABC):
    """Base service class with common patterns and error handling."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self._setup_repositories()
    
    @abstractmethod
    def _setup_repositories(self):
        """Setup repositories needed by the service."""
        pass
    
    async def start_transaction(self):
        """Start a new transaction."""
        # AsyncSession handles transactions automatically
        pass
    
    async def commit_transaction(self):
        """Commit current transaction."""
        await self.db.commit()
    
    async def rollback_transaction(self):
        """Rollback current transaction."""
        await self.db.rollback()
    
    def validate_required_fields(self, data: Dict[str, Any], required_fields: List[str]):
        """Validate that required fields are present."""
        missing_fields = [field for field in required_fields if field not in data or data[field] is None]
        if missing_fields:
            raise ValidationError(f"Missing required fields: {', '.join(missing_fields)}")
    
    def sanitize_string_fields(self, data: Dict[str, Any], string_fields: List[str]) -> Dict[str, Any]:
        """Sanitize string fields to prevent injection."""
        sanitized = data.copy()
        for field in string_fields:
            if field in sanitized and isinstance(sanitized[field], str):
                # Basic sanitization - strip whitespace and limit length
                sanitized[field] = sanitized[field].strip()[:1000]  # Reasonable limit
        return sanitized
    
    async def log_operation(self, operation: str, entity_type: str, entity_id: str, details: Optional[Dict] = None):
        """Log service operations for audit trail."""
        from .audit_log_service import AuditLogService
        audit_service = AuditLogService(self.db)
        await audit_service.create_log(
            action=operation,
            entity_type=entity_type,
            entity_id=entity_id,
            user_id="system",  # Single-user mode
            details=details or {}
        )


class TransactionMixin:
    """Mixin to provide transaction management decorators."""
    
    @staticmethod
    def transactional(func):
        """Decorator to wrap service methods in transactions with automatic rollback."""
        async def wrapper(self, *args, **kwargs):
            try:
                result = await func(self, *args, **kwargs)
                await self.commit_transaction()
                return result
            except Exception as e:
                await self.rollback_transaction()
                logger.error(f"Transaction rolled back due to error in {func.__name__}: {e}")
                raise
        return wrapper


# Service registry for dependency injection
class ServiceRegistry:
    """Central registry for service instances to avoid circular dependencies."""
    
    def __init__(self):
        self._services: Dict[str, Any] = {}
    
    def register(self, service_name: str, service_instance: Any):
        """Register a service instance."""
        self._services[service_name] = service_instance
    
    def get(self, service_name: str) -> Any:
        """Get a service instance."""
        if service_name not in self._services:
            raise ValueError(f"Service {service_name} not registered")
        return self._services[service_name]
    
    def exists(self, service_name: str) -> bool:
        """Check if service is registered."""
        return service_name in self._services


# Global service registry instance
service_registry = ServiceRegistry()