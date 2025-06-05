import os
import logging
from typing import Dict

try:
    import redis  # type: ignore
except Exception:  # pragma: no cover - redis optional
    redis = None

logger = logging.getLogger(__name__)


class ToolMetricsService:
    """Service for tracking MCP tool invocation counts."""

    _counts: Dict[str, int] = {}
    _redis_client = None

    @classmethod
    def _get_redis_client(cls):
        if cls._redis_client is not None:
            return cls._redis_client
        redis_url = os.getenv("REDIS_URL")
        if redis_url and redis is not None:
            try:
                cls._redis_client = redis.from_url(redis_url, decode_responses=True)
            except Exception as e:  # pragma: no cover - redis connection failure
                logger.error(f"Failed to connect to Redis: {e}")
                cls._redis_client = None
        return cls._redis_client

    @classmethod
    def increment(cls, tool_name: str) -> None:
        client = cls._get_redis_client()
        if client:
            try:
                client.hincrby("mcp_tool_metrics", tool_name, 1)
            except Exception as e:  # pragma: no cover - redis failure
                logger.error(f"Redis error updating metrics: {e}")
        else:
            cls._counts[tool_name] = cls._counts.get(tool_name, 0) + 1

    @classmethod
    def get_counts(cls) -> Dict[str, int]:
        client = cls._get_redis_client()
        if client:
            try:
                metrics = client.hgetall("mcp_tool_metrics")
                return {k: int(v) for k, v in metrics.items()}
            except Exception as e:  # pragma: no cover - redis failure
                logger.error(f"Redis error fetching metrics: {e}")
        return dict(cls._counts)
