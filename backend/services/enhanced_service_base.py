from typing import List, Dict, Any, Optional, Union, TypeVar, Generic
from abc import ABC, abstractmethod
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, or_
from sqlalchemy.orm import selectinload, joinedload
from pydantic import BaseModel, ValidationError
import logging
import time
import json
from datetime import datetime, timedelta

from backend.core.async_utils import async_redis, async_retry, async_timeout
from .exceptions import ValidationError as CustomValidationError, NotFoundError, PermissionError

logger = logging.getLogger(__name__)

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")

class CacheManager:
    """Redis-based cache manager for services."""
    
    def __init__(self, default_ttl: int = 3600):
        self.default_ttl = default_ttl
    
    def _make_key(self, prefix: str, identifier: str) -> str:
        """Create cache key."""
        return f"cache:{prefix}:{identifier}"
    
    async def get(self, prefix: str, identifier: str) -> Optional[Dict[str, Any]]:
        """Get cached data."""
        try:
            redis = await async_redis.get_redis()
            key = self._make_key(prefix, identifier)
            data = await redis.get(key)
            
            if data:
                return json.loads(data)
        except Exception as e:
            logger.warning(f"Cache get failed for {prefix}:{identifier}: {str(e)}")
        
        return None
    
    async def set(
        self, 
        prefix: str, 
        identifier: str, 
        data: Dict[str, Any], 
        ttl: Optional[int] = None
    ):
        """Set cached data."""
        try:
            redis = await async_redis.get_redis()
            key = self._make_key(prefix, identifier)
            ttl = ttl or self.default_ttl
            
            await redis.setex(key, ttl, json.dumps(data, default=str))
        except Exception as e:
            logger.warning(f"Cache set failed for {prefix}:{identifier}: {str(e)}")
    
    async def delete(self, prefix: str, identifier: str):
        """Delete cached data."""
        try:
            redis = await async_redis.get_redis()
            key = self._make_key(prefix, identifier)
            await redis.delete(key)
        except Exception as e:
            logger.warning(f"Cache delete failed for {prefix}:{identifier}: {str(e)}")
    
    async def invalidate_pattern(self, pattern: str):
        """Invalidate cache keys matching pattern."""
        try:
            redis = await async_redis.get_redis()
            keys = await redis.keys(f"cache:{pattern}*")
            if keys:
                await redis.delete(*keys)
                logger.info(f"Invalidated {len(keys)} cache keys for pattern: {pattern}")
        except Exception as e:
            logger.warning(f"Cache pattern invalidation failed for {pattern}: {str(e)}")

class ServiceMetrics:
    """Service performance metrics collector."""
    
    def __init__(self, service_name: str):
        self.service_name = service_name
        self.redis_key = f"metrics:{service_name}"
    
    async def record_operation(
        self, 
        operation: str, 
        duration: float, 
        success: bool = True,
        error_type: Optional[str] = None
    ):
        """Record operation metrics."""
        try:
            redis = await async_redis.get_redis()
            
            # Increment counters
            await redis.hincrby(self.redis_key, f"{operation}:count", 1)
            await redis.hincrby(self.redis_key, f"{operation}:success" if success else f"{operation}:error", 1)
            
            # Record duration stats
            durations_key = f"{self.redis_key}:durations:{operation}"
            await redis.lpush(durations_key, duration)
            await redis.ltrim(durations_key, 0, 999)  # Keep last 1000 entries
            
            # Record error types
            if not success and error_type:
                await redis.hincrby(self.redis_key, f"{operation}:error:{error_type}", 1)
            
            # Set expiry
            await redis.expire(self.redis_key, 86400)  # 24 hours
            await redis.expire(durations_key, 86400)
            
        except Exception as e:
            logger.warning(f"Failed to record metrics: {str(e)}")
    
    async def get_metrics(self) -> Dict[str, Any]:
        """Get service metrics."""
        try:
            redis = await async_redis.get_redis()
            metrics = await redis.hgetall(self.redis_key)
            
            # Calculate average durations
            for key in metrics.keys():
                if key.endswith(':count'):
                    operation = key.replace(':count', '')
                    durations_key = f"{self.redis_key}:durations:{operation}"
                    durations = await redis.lrange(durations_key, 0, -1)
                    
                    if durations:
                        avg_duration = sum(float(d) for d in durations) / len(durations)
                        metrics[f"{operation}:avg_duration"] = round(avg_duration, 4)
            
            return metrics
        except Exception as e:
            logger.warning(f"Failed to get metrics: {str(e)}")
            return {}

class EnhancedServiceBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType], ABC):
    """Enhanced base service with caching, metrics, and validation."""
    
    def __init__(self, model_class, cache_prefix: str = None):
        self.model = model_class
        self.cache_prefix = cache_prefix or model_class.__tablename__
        self.cache = CacheManager()
        self.metrics = ServiceMetrics(self.__class__.__name__)
    
    def _timing_decorator(self, operation: str):
        """Decorator to time operations and record metrics."""
        def decorator(func):
            async def wrapper(*args, **kwargs):
                start_time = time.time()
                success = True
                error_type = None
                
                try:
                    result = await func(*args, **kwargs)
                    return result
                except Exception as e:
                    success = False
                    error_type = type(e).__name__
                    raise
                finally:
                    duration = time.time() - start_time
                    await self.metrics.record_operation(operation, duration, success, error_type)
            
            return wrapper
        return decorator
    
    @abstractmethod
    def _validate_create(self, data: CreateSchemaType) -> CreateSchemaType:
        """Validate create data."""
        pass
    
    @abstractmethod
    def _validate_update(self, data: UpdateSchemaType) -> UpdateSchemaType:
        """Validate update data."""
        pass
    
    async def _check_permissions(self, user_id: str, action: str, resource_id: str = None) -> bool:
        """Check user permissions for action."""
        # Override in subclasses for specific permission logic
        return True
    
    async def _invalidate_cache(self, resource_id: str):
        """Invalidate cache for resource."""
        await self.cache.delete(self.cache_prefix, resource_id)
        await self.cache.invalidate_pattern(f"{self.cache_prefix}:list:*")
    
    @async_retry(max_retries=3)
    @async_timeout(30.0)
    async def create(
        self, 
        db: AsyncSession, 
        data: CreateSchemaType,
        user_id: str,
        **kwargs
    ) -> ModelType:
        """Create new resource."""
        async def _create():
            # Validate permissions
            if not await self._check_permissions(user_id, "create"):
                raise PermissionError("Insufficient permissions to create resource")
            
            # Validate data
            validated_data = self._validate_create(data)
            
            # Create object
            db_obj = self.model(**validated_data.dict(), **kwargs)
            db.add(db_obj)
            await db.flush()
            await db.refresh(db_obj)
            
            # Invalidate cache
            await self._invalidate_cache(str(db_obj.id))
            
            logger.info(f"Created {self.model.__name__} with ID: {db_obj.id}")
            return db_obj
        
        return await self._timing_decorator("create")(_create)()
    
    @async_retry(max_retries=3)
    @async_timeout(30.0)
    async def get_by_id(
        self, 
        db: AsyncSession, 
        resource_id: str,
        user_id: str = None,
        use_cache: bool = True
    ) -> Optional[ModelType]:
        """Get resource by ID with caching."""
        async def _get():
            # Check cache first
            if use_cache:
                cached = await self.cache.get(self.cache_prefix, resource_id)
                if cached:
                    logger.debug(f"Cache hit for {self.model.__name__}:{resource_id}")
                    return self.model(**cached)
            
            # Query database
            query = select(self.model).where(self.model.id == resource_id)
            result = await db.execute(query)
            db_obj = result.scalar_one_or_none()
            
            if not db_obj:
                raise NotFoundError(f"{self.model.__name__} not found")
            
            # Check permissions
            if user_id and not await self._check_permissions(user_id, "read", resource_id):
                raise PermissionError("Insufficient permissions to access resource")
            
            # Cache result
            if use_cache:
                await self.cache.set(self.cache_prefix, resource_id, db_obj.to_dict())
            
            return db_obj
        
        return await self._timing_decorator("get_by_id")(_get)()
    
    @async_retry(max_retries=3)
    @async_timeout(60.0)
    async def list_with_filters(
        self,
        db: AsyncSession,
        user_id: str = None,
        filters: Dict[str, Any] = None,
        page: int = 1,
        page_size: int = 50,
        order_by: str = "created_at",
        order_direction: str = "desc",
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """List resources with filtering and pagination."""
        async def _list():
            # Create cache key
            cache_key = f"list:{page}:{page_size}:{order_by}:{order_direction}:{hash(str(filters))}"
            
            # Check cache
            if use_cache:
                cached = await self.cache.get(self.cache_prefix, cache_key)
                if cached:
                    logger.debug(f"Cache hit for {self.model.__name__} list")
                    return cached
            
            # Build query
            query = select(self.model)
            
            # Apply filters
            if filters:
                conditions = []
                for field, value in filters.items():
                    if hasattr(self.model, field):
                        if isinstance(value, list):
                            conditions.append(getattr(self.model, field).in_(value))
                        else:
                            conditions.append(getattr(self.model, field) == value)
                
                if conditions:
                    query = query.where(and_(*conditions))
            
            # Apply ordering
            if hasattr(self.model, order_by):
                order_field = getattr(self.model, order_by)
                if order_direction.lower() == "desc":
                    order_field = order_field.desc()
                query = query.order_by(order_field)
            
            # Count total
            count_query = select(func.count()).select_from(query.subquery())
            total_result = await db.execute(count_query)
            total = total_result.scalar()
            
            # Apply pagination
            offset = (page - 1) * page_size
            query = query.offset(offset).limit(page_size)
            
            # Execute query
            result = await db.execute(query)
            items = result.scalars().all()
            
            # Prepare response
            response = {
                "items": [item.to_dict() for item in items],
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": (total + page_size - 1) // page_size
            }
            
            # Cache result
            if use_cache:
                await self.cache.set(self.cache_prefix, cache_key, response, ttl=300)  # 5 minute cache
            
            return response
        
        return await self._timing_decorator("list")(_list)()
    
    @async_retry(max_retries=3)
    @async_timeout(30.0)
    async def update(
        self,
        db: AsyncSession,
        resource_id: str,
        data: UpdateSchemaType,
        user_id: str,
        partial: bool = True
    ) -> ModelType:
        """Update resource."""
        async def _update():
            # Get existing resource
            db_obj = await self.get_by_id(db, resource_id, user_id, use_cache=False)
            
            # Check permissions
            if not await self._check_permissions(user_id, "update", resource_id):
                raise PermissionError("Insufficient permissions to update resource")
            
            # Validate data
            validated_data = self._validate_update(data)
            
            # Update fields
            update_data = validated_data.dict(exclude_unset=partial)
            for field, value in update_data.items():
                if hasattr(db_obj, field):
                    setattr(db_obj, field, value)
            
            # Update timestamp
            if hasattr(db_obj, 'updated_at'):
                db_obj.updated_at = datetime.utcnow()
            
            await db.flush()
            await db.refresh(db_obj)
            
            # Invalidate cache
            await self._invalidate_cache(resource_id)
            
            logger.info(f"Updated {self.model.__name__} with ID: {resource_id}")
            return db_obj
        
        return await self._timing_decorator("update")(_update)()
    
    @async_retry(max_retries=3)
    @async_timeout(30.0)
    async def delete(
        self,
        db: AsyncSession,
        resource_id: str,
        user_id: str,
        soft_delete: bool = True
    ) -> bool:
        """Delete resource."""
        async def _delete():
            # Get existing resource
            db_obj = await self.get_by_id(db, resource_id, user_id, use_cache=False)
            
            # Check permissions
            if not await self._check_permissions(user_id, "delete", resource_id):
                raise PermissionError("Insufficient permissions to delete resource")
            
            if soft_delete and hasattr(db_obj, 'is_deleted'):
                # Soft delete
                db_obj.is_deleted = True
                if hasattr(db_obj, 'deleted_at'):
                    db_obj.deleted_at = datetime.utcnow()
                await db.flush()
            else:
                # Hard delete
                await db.delete(db_obj)
            
            # Invalidate cache
            await self._invalidate_cache(resource_id)
            
            logger.info(f"Deleted {self.model.__name__} with ID: {resource_id}")
            return True
        
        return await self._timing_decorator("delete")(_delete)()
    
    async def get_metrics(self) -> Dict[str, Any]:
        """Get service performance metrics."""
        return await self.metrics.get_metrics()
    
    async def health_check(self) -> Dict[str, Any]:
        """Service health check."""
        try:
            # Test cache connection
            redis = await async_redis.get_redis()
            await redis.ping()
            cache_healthy = True
        except Exception:
            cache_healthy = False
        
        metrics = await self.get_metrics()
        
        return {
            "service": self.__class__.__name__,
            "model": self.model.__name__,
            "cache_healthy": cache_healthy,
            "metrics": metrics,
            "timestamp": datetime.utcnow().isoformat()
        }
