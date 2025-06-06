import asyncio
import logging
from typing import Any, Callable, Optional, Dict, List
from functools import wraps
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import QueuePool
import aioredis
import time

from core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class AsyncDatabaseManager:
    """Async database connection manager with pooling."""
    
    def __init__(self):
        self.engine = None
        self.session_factory = None
        self._initialized = False
    
    async def initialize(self):
        """Initialize async database engine and session factory."""
        if self._initialized:
            return
        
        database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
        
        self.engine = create_async_engine(
            database_url,
            poolclass=QueuePool,
            pool_size=20,
            max_overflow=30,
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=settings.DEBUG,
            future=True
        )
        
        self.session_factory = async_sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
        
        self._initialized = True
        logger.info("Async database manager initialized")
    
    @asynccontextmanager
    async def get_session(self):
        """Get async database session."""
        if not self._initialized:
            await self.initialize()
        
        async with self.session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
    
    async def close(self):
        """Close all connections."""
        if self.engine:
            await self.engine.dispose()
            self._initialized = False
            logger.info("Async database manager closed")

# Global async database manager
async_db = AsyncDatabaseManager()

class AsyncRedisManager:
    """Async Redis connection manager."""
    
    def __init__(self):
        self.redis_pool = None
        self._initialized = False
    
    async def initialize(self):
        """Initialize Redis connection pool."""
        if self._initialized:
            return
        
        self.redis_pool = aioredis.ConnectionPool.from_url(
            f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}",
            max_connections=20,
            retry_on_timeout=True,
            decode_responses=True
        )
        
        self._initialized = True
        logger.info("Async Redis manager initialized")
    
    async def get_redis(self) -> aioredis.Redis:
        """Get Redis connection."""
        if not self._initialized:
            await self.initialize()
        
        return aioredis.Redis(connection_pool=self.redis_pool)
    
    async def close(self):
        """Close Redis connections."""
        if self.redis_pool:
            await self.redis_pool.disconnect()
            self._initialized = False
            logger.info("Async Redis manager closed")

# Global async Redis manager
async_redis = AsyncRedisManager()

def async_retry(
    max_retries: int = 3,
    delay: float = 1.0,
    exponential_backoff: bool = True,
    exceptions: tuple = (Exception,)
):
    """Async retry decorator with exponential backoff."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    
                    if attempt == max_retries:
                        logger.error(
                            f"Function {func.__name__} failed after {max_retries} retries: {str(e)}"
                        )
                        raise
                    
                    wait_time = delay
                    if exponential_backoff:
                        wait_time = delay * (2 ** attempt)
                    
                    logger.warning(
                        f"Function {func.__name__} failed (attempt {attempt + 1}/{max_retries + 1}), "
                        f"retrying in {wait_time}s: {str(e)}"
                    )
                    
                    await asyncio.sleep(wait_time)
            
            raise last_exception
        
        return wrapper
    return decorator

def async_timeout(seconds: float):
    """Async timeout decorator."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await asyncio.wait_for(func(*args, **kwargs), timeout=seconds)
            except asyncio.TimeoutError:
                logger.error(f"Function {func.__name__} timed out after {seconds} seconds")
                raise
        
        return wrapper
    return decorator

class AsyncTaskQueue:
    """Simple async task queue using Redis."""
    
    def __init__(self, queue_name: str = "default"):
        self.queue_name = f"queue:{queue_name}"
        self.processing_key = f"processing:{queue_name}"
    
    async def enqueue(self, task_data: Dict[str, Any], priority: int = 0):
        """Add task to queue with priority."""
        redis = await async_redis.get_redis()
        
        task_payload = {
            "id": str(time.time()),
            "data": task_data,
            "priority": priority,
            "enqueued_at": time.time()
        }
        
        # Use sorted set for priority queue
        await redis.zadd(self.queue_name, {str(task_payload): priority})
        logger.info(f"Enqueued task with priority {priority}")
    
    async def dequeue(self, timeout: int = 10) -> Optional[Dict[str, Any]]:
        """Dequeue task with timeout."""
        redis = await async_redis.get_redis()
        
        # Blocking pop from sorted set (highest priority first)
        result = await redis.bzpopmax(self.queue_name, timeout=timeout)
        
        if result:
            queue_name, task_str, priority = result
            try:
                import json
                task_data = json.loads(task_str)
                
                # Move to processing set
                await redis.sadd(self.processing_key, task_str)
                
                logger.info(f"Dequeued task with priority {priority}")
                return task_data
            except json.JSONDecodeError:
                logger.error(f"Failed to decode task: {task_str}")
        
        return None
    
    async def complete_task(self, task_id: str):
        """Mark task as completed."""
        redis = await async_redis.get_redis()
        
        # Remove from processing set
        await redis.srem(self.processing_key, task_id)
        logger.info(f"Completed task {task_id}")
    
    async def get_queue_stats(self) -> Dict[str, int]:
        """Get queue statistics."""
        redis = await async_redis.get_redis()
        
        pending_count = await redis.zcard(self.queue_name)
        processing_count = await redis.scard(self.processing_key)
        
        return {
            "pending": pending_count,
            "processing": processing_count,
            "total": pending_count + processing_count
        }

class AsyncBatchProcessor:
    """Process items in batches asynchronously."""
    
    def __init__(self, batch_size: int = 10, max_concurrency: int = 5):
        self.batch_size = batch_size
        self.semaphore = asyncio.Semaphore(max_concurrency)
    
    async def process_batch(
        self,
        items: List[Any],
        processor_func: Callable,
        *args,
        **kwargs
    ) -> List[Any]:
        """Process items in batches with concurrency control."""
        results = []
        
        # Split into batches
        batches = [
            items[i:i + self.batch_size]
            for i in range(0, len(items), self.batch_size)
        ]
        
        async def process_single_batch(batch):
            async with self.semaphore:
                batch_results = []
                for item in batch:
                    try:
                        result = await processor_func(item, *args, **kwargs)
                        batch_results.append(result)
                    except Exception as e:
                        logger.error(f"Failed to process item {item}: {str(e)}")
                        batch_results.append(None)
                return batch_results
        
        # Process all batches concurrently
        batch_tasks = [process_single_batch(batch) for batch in batches]
        batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
        
        # Flatten results
        for batch_result in batch_results:
            if isinstance(batch_result, Exception):
                logger.error(f"Batch processing failed: {str(batch_result)}")
            else:
                results.extend(batch_result)
        
        return results

# Utility functions
async def run_in_background(coro, name: str = None):
    """Run coroutine in background task."""
    task = asyncio.create_task(coro, name=name)
    logger.info(f"Started background task: {name or 'unnamed'}")
    return task

async def gather_with_limit(limit: int, *coroutines):
    """Gather coroutines with concurrency limit."""
    semaphore = asyncio.Semaphore(limit)
    
    async def limited_coro(coro):
        async with semaphore:
            return await coro
    
    return await asyncio.gather(*[limited_coro(coro) for coro in coroutines])

# Startup and shutdown handlers
async def startup_async_services():
    """Initialize all async services."""
    await async_db.initialize()
    await async_redis.initialize()
    logger.info("All async services initialized")

async def shutdown_async_services():
    """Cleanup all async services."""
    await async_db.close()
    await async_redis.close()
    logger.info("All async services shut down")
