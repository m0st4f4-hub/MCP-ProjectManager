"""
Security utilities for the application.
"""
from fastapi import HTTPException, Request, status
from datetime import datetime, timedelta
from typing import Dict, Optional
import asyncio
from collections import defaultdict

class RateLimiter:
    """Rate limiter implementation for API endpoints."""
    
    def __init__(self):
        self.requests: Dict[str, list] = defaultdict(list)
        self.lock = asyncio.Lock()
    
    async def check_rate_limit(
        self, 
        key: str, 
        max_requests: int = 60, 
        window_seconds: int = 60
    ) -> bool:
        """
        Check if the rate limit has been exceeded.
        
        Args:
            key: Unique identifier (e.g., IP address, user ID)
            max_requests: Maximum number of requests allowed
            window_seconds: Time window in seconds
            
        Returns:
            True if within limit, False if exceeded
        """
        async with self.lock:
            now = datetime.now()
            cutoff = now - timedelta(seconds=window_seconds)
            
            # Clean old requests
            self.requests[key] = [
                req_time for req_time in self.requests[key]
                if req_time > cutoff
            ]
            
            # Check if limit exceeded
            if len(self.requests[key]) >= max_requests:
                return False
            
            # Add current request
            self.requests[key].append(now)
            return True


class LoginAttemptTracker:
    """Track login attempts for brute force protection."""
    
    def __init__(self):
        self.attempts: Dict[str, list] = defaultdict(list)
        self.locked_accounts: Dict[str, datetime] = {}
        self.lock = asyncio.Lock()
    
    async def record_attempt(
        self, 
        username: str, 
        success: bool,
        max_attempts: int = 5,
        lockout_minutes: int = 15
    ) -> None:
        """Record a login attempt."""
        async with self.lock:
            now = datetime.now()
            
            # Check if account is locked
            if username in self.locked_accounts:
                if now < self.locked_accounts[username]:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=f"Account locked due to too many failed attempts. Try again later."
                    )
                else:
                    # Unlock account
                    del self.locked_accounts[username]
                    self.attempts[username] = []
            
            if success:
                # Clear attempts on successful login
                self.attempts[username] = []
            else:
                # Record failed attempt
                cutoff = now - timedelta(minutes=lockout_minutes)
                self.attempts[username] = [
                    attempt for attempt in self.attempts[username]
                    if attempt > cutoff
                ]
                self.attempts[username].append(now)
                
                # Check if should lock account
                if len(self.attempts[username]) >= max_attempts:
                    self.locked_accounts[username] = now + timedelta(minutes=lockout_minutes)
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=f"Too many failed login attempts. Account locked for {lockout_minutes} minutes."
                    )


# Global instances
rate_limiter = RateLimiter()
login_tracker = LoginAttemptTracker()


async def check_request_rate_limit(request: Request, max_requests: int = 60):
    """Dependency to check rate limit based on IP address."""
    client_ip = request.client.host
    
    if not await rate_limiter.check_rate_limit(client_ip, max_requests=max_requests):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later."
        )


def validate_sql_safe(value: str) -> str:
    """
    Basic SQL injection prevention by validating input.
    
    Args:
        value: Input string to validate
        
    Returns:
        The input value if safe
        
    Raises:
        HTTPException if SQL injection patterns detected
    """
    # Common SQL injection patterns
    sql_patterns = [
        "';", "--", "/*", "*/", "xp_", "sp_",
        "union select", "drop table", "drop database",
        "insert into", "delete from", "update set"
    ]
    
    value_lower = value.lower()
    for pattern in sql_patterns:
        if pattern in value_lower:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid input detected"
            )
    
    return value
