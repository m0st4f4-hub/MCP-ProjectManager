"""
Security utilities following FastAPI Security tutorial patterns.
Implements authentication, authorization, and protection mechanisms.
"""

import asyncio
import hashlib
import secrets
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Security
security = HTTPBearer()

# Rate limiting storage
rate_limit_storage: Dict[str, List[datetime]] = defaultdict(list)
login_attempts: Dict[str, List[datetime]] = defaultdict(list)
blocked_ips: Dict[str, datetime] = {}


class SecurityManager:
    """
    Centralized security management following FastAPI patterns.
    """
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt."""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def create_access_token(
        data: dict,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create a JWT access token.
        
        Args:
            data: Dictionary to encode in the token
            expires_delta: Token expiration time
            
        Returns:
            Encoded JWT token
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        
        to_encode.update({"exp": expire, "type": "access"})
        
        return jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
    
    @staticmethod
    def create_refresh_token(
        data: dict,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create a JWT refresh token."""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES
            )
        
        to_encode.update({"exp": expire, "type": "refresh"})
        
        return jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
    
    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Dict:
        """
        Verify and decode a JWT token.
        
        Args:
            token: JWT token to verify
            token_type: Expected token type ('access' or 'refresh')
            
        Returns:
            Decoded token payload
            
        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            
            # Verify token type
            if payload.get("type") != token_type:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            return payload
            
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    @staticmethod
    def generate_api_key() -> str:
        """Generate a secure API key."""
        return secrets.token_urlsafe(32)


class RateLimiter:
    """
    Rate limiting implementation with Redis-like behavior.
    """
    
    def __init__(self):
        self.storage = defaultdict(list)
        self.lock = asyncio.Lock()
    
    async def is_allowed(
        self,
        key: str,
        max_requests: int = 60,
        window_seconds: int = 60
    ) -> bool:
        """
        Check if request is within rate limit.
        
        Args:
            key: Unique identifier (IP, user ID, etc.)
            max_requests: Maximum requests allowed
            window_seconds: Time window in seconds
            
        Returns:
            True if request is allowed, False otherwise
        """
        async with self.lock:
            now = datetime.utcnow()
            cutoff = now - timedelta(seconds=window_seconds)
            
            # Remove old entries
            self.storage[key] = [
                timestamp for timestamp in self.storage[key]
                if timestamp > cutoff
            ]
            
            # Check if limit exceeded
            if len(self.storage[key]) >= max_requests:
                return False
            
            # Add current request
            self.storage[key].append(now)
            return True


class LoginAttemptTracker:
    """
    Track and limit login attempts to prevent brute force attacks.
    """
    
    def __init__(self):
        self.attempts = defaultdict(list)
        self.blocked_until = {}
        self.lock = asyncio.Lock()
    
    async def record_attempt(
        self,
        identifier: str,
        success: bool,
        max_attempts: int = 5,
        lockout_minutes: int = 15
    ) -> None:
        """
        Record a login attempt and enforce lockout if necessary.
        
        Args:
            identifier: Username, email, or IP address
            success: Whether the login was successful
            max_attempts: Maximum failed attempts before lockout
            lockout_minutes: How long to lock the account
        """
        async with self.lock:
            now = datetime.utcnow()
            
            # Check if currently blocked
            if identifier in self.blocked_until:
                if now < self.blocked_until[identifier]:
                    time_left = self.blocked_until[identifier] - now
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=f"Account locked. Try again in {time_left.seconds} seconds."
                    )
                else:
                    # Unblock expired lockout
                    del self.blocked_until[identifier]
                    self.attempts[identifier] = []
            
            if success:
                # Clear attempts on successful login
                self.attempts[identifier] = []
            else:
                # Record failed attempt
                cutoff = now - timedelta(minutes=lockout_minutes)
                self.attempts[identifier] = [
                    attempt for attempt in self.attempts[identifier]
                    if attempt > cutoff
                ]
                self.attempts[identifier].append(now)
                
                # Check if should block
                if len(self.attempts[identifier]) >= max_attempts:
                    self.blocked_until[identifier] = now + timedelta(
                        minutes=lockout_minutes
                    )
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=f"Too many failed attempts. Account locked for {lockout_minutes} minutes."
                    )


# Global instances
security_manager = SecurityManager()
rate_limiter = RateLimiter()
login_tracker = LoginAttemptTracker()


async def get_current_user_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Extract and validate the bearer token from request headers.
    
    Returns:
        The validated token string
    """
    token = credentials.credentials
    
    # Verify token format and signature
    security_manager.verify_token(token, "access")
    
    return token


async def rate_limit_check(
    request: Request,
    max_requests: int = 60
) -> None:
    """
    Rate limiting dependency for FastAPI routes.
    
    Args:
        request: FastAPI request object
        max_requests: Maximum requests per minute
        
    Raises:
        HTTPException: If rate limit exceeded
    """
    client_ip = request.client.host
    
    if not await rate_limiter.is_allowed(
        key=client_ip,
        max_requests=max_requests,
        window_seconds=60
    ):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later."
        )


def secure_hash(data: str, salt: str = "") -> str:
    """
    Create a secure hash of data with optional salt.
    
    Args:
        data: Data to hash
        salt: Optional salt for additional security
        
    Returns:
        Hexadecimal hash string
    """
    hasher = hashlib.sha256()
    hasher.update((data + salt).encode('utf-8'))
    return hasher.hexdigest()


def validate_input_safety(value: str) -> str:
    """
    Basic input validation for SQL injection prevention.
    
    Args:
        value: Input string to validate
        
    Returns:
        The validated input
        
    Raises:
        HTTPException: If dangerous patterns detected
    """
    dangerous_patterns = [
        "';", "--", "/*", "*/", "xp_", "sp_",
        "union select", "drop table", "drop database",
        "insert into", "delete from", "update set",
        "<script", "javascript:", "onload=", "onerror="
    ]
    
    value_lower = value.lower()
    for pattern in dangerous_patterns:
        if pattern in value_lower:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid input detected"
            )
    
    return value