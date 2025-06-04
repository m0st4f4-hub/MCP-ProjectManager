"""
API response models for consistent API responses.
This module defines Pydantic models for API responses.
"""

from typing import Generic, TypeVar, List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime, UTC  # Generic type for data

T = TypeVar('T')


class BaseResponse(BaseModel):
    """Base response model for all API responses."""
    success: bool = True
    message: str = "Operation successful"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))


class DataResponse(BaseResponse, Generic[T]):
    """Response model for single entity responses."""
    data: T


class ListResponse(BaseResponse, Generic[T]):
    """Response model for list responses with pagination."""
    data: List[T]
    total: int
    page: int = 1
    page_size: int
    has_more: bool = False


class ErrorResponse(BaseModel):
    """Response model for error responses."""
    success: bool = False
    message: str
    error_code: Optional[str] = None
    error_details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))


class PaginationParams(BaseModel):
    """Model for pagination parameters."""
    page: int = 1
    page_size: int = 100

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size
