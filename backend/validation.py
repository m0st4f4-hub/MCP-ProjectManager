"""
Input validation utilities.
"""
from pydantic import BaseModel, validator, Field
from typing import Optional
import re
from fastapi import HTTPException, status


class ValidationMixin:
    """Mixin for common validation patterns."""
    
    @staticmethod
    def validate_no_sql_injection(v: str, field_name: str = "field") -> str:
        """Validate string doesn't contain SQL injection patterns."""
        if not v:
            return v
            
        sql_patterns = [
            r"(^|[^a-zA-Z])union\s+select",
            r"(^|[^a-zA-Z])drop\s+(table|database)",
            r"(^|[^a-zA-Z])delete\s+from",
            r"(^|[^a-zA-Z])insert\s+into",
            r"(^|[^a-zA-Z])update\s+.+\s+set",
            r"--",
            r"/\*.*\*/",
            r"';",
            r'";'
        ]
        
        for pattern in sql_patterns:
            if re.search(pattern, v.lower()):
                raise ValueError(f"Invalid characters in {field_name}")
        
        return v
    
    @staticmethod
    def validate_safe_string(v: str, max_length: int = 255) -> str:
        """Validate string is safe and within length limits."""
        if not v:
            return v
            
        # Check length
        if len(v) > max_length:
            raise ValueError(f"String exceeds maximum length of {max_length}")
        
        # Basic XSS prevention
        dangerous_patterns = ["<script", "javascript:", "onerror=", "onclick="]
        for pattern in dangerous_patterns:
            if pattern in v.lower():
                raise ValueError("Invalid content detected")
        
        return v.strip()


def validate_id_format(v: str) -> str:
    """Validate ID format (UUID without hyphens)."""
    if not re.match(r'^[a-f0-9]{32}$', v):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )
    return v


def validate_pagination(skip: int = 0, limit: int = 100) -> tuple:
    """Validate pagination parameters."""
    if skip < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skip value must be non-negative"
        )
    
    if limit < 1 or limit > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 1000"
        )
    
    return skip, limit
