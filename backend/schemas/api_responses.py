"""
Simple API response schemas for single-user mode.
"""
from pydantic import BaseModel, Field
from typing import Optional, Any, List, Dict, TypeVar, Generic

T = TypeVar('T')

class DataResponse(BaseModel, Generic[T]):
    """Standard data response wrapper."""
    data: T = Field(..., description="Response data")
    message: Optional[str] = Field(None, description="Optional message")


class ListResponse(BaseModel, Generic[T]):
    """Standard list response wrapper."""
    data: List[T] = Field(..., description="List of items")
    total: int = Field(..., description="Total number of items")
    page: Optional[int] = Field(None, description="Current page number")
    page_size: Optional[int] = Field(None, description="Number of items per page")


class ErrorResponse(BaseModel):
    """Standard error response."""
    error: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")


class PaginationParams(BaseModel):
    """Pagination parameters."""
    skip: int = Field(default=0, ge=0, description="Number of items to skip")
    limit: int = Field(default=100, ge=1, le=1000, description="Number of items to return")


class MetricsResponse(BaseModel):
    """Metrics response for MCP tools usage."""
    tool_name: str = Field(..., description="Name of the MCP tool")
    call_count: int = Field(default=0, description="Number of times the tool was called")
    success_count: int = Field(default=0, description="Number of successful calls")
    error_count: int = Field(default=0, description="Number of failed calls")
    avg_duration_ms: Optional[float] = Field(None, description="Average execution duration in milliseconds")