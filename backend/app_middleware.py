"""
Middleware components following FastAPI middleware patterns.
Implements security, rate limiting, logging, and CORS handling.
"""

import logging
import time
import uuid
from typing import Callable

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from security import rate_limiter

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add security headers to all responses.
    
    Implements OWASP recommended security headers for web applications.
    """
    
    def __init__(
        self,
        app: ASGIApp,
        force_https: bool = False,
        csp_policy: str = None
    ):
        super().__init__(app)
        self.force_https = force_https
        self.csp_policy = csp_policy or (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' https:; "
            "connect-src 'self' ws: wss:"
        )
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Add security headers to response."""
        response = await call_next(request)
        
        # Basic security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Content Security Policy
        response.headers["Content-Security-Policy"] = self.csp_policy
        
        # HTTPS enforcement
        if self.force_https:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
        
        # Remove server information
        response.headers.pop("Server", None)
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware with configurable limits per endpoint.
    """
    
    def __init__(
        self,
        app: ASGIApp,
        calls: int = 60,
        period: int = 60,
        exempt_paths: list = None
    ):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.exempt_paths = exempt_paths or ["/health", "/metrics", "/docs", "/redoc"]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Apply rate limiting to requests."""
        # Skip rate limiting for exempt paths
        if any(request.url.path.startswith(path) for path in self.exempt_paths):
            return await call_next(request)
        
        # Get client identifier
        client_ip = request.client.host
        user_agent = request.headers.get("user-agent", "unknown")
        client_key = f"{client_ip}:{hash(user_agent) % 1000}"
        
        # Check rate limit
        if not await rate_limiter.is_allowed(
            key=client_key,
            max_requests=self.calls,
            window_seconds=self.period
        ):
            logger.warning(f"Rate limit exceeded for client {client_ip}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Rate limit exceeded. Please try again later.",
                    "retry_after": self.period
                },
                headers={"Retry-After": str(self.period)}
            )
        
        return await call_next(request)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Log HTTP requests and responses with timing information.
    """
    
    def __init__(
        self,
        app: ASGIApp,
        log_requests: bool = True,
        log_responses: bool = True,
        exclude_paths: list = None
    ):
        super().__init__(app)
        self.log_requests = log_requests
        self.log_responses = log_responses
        self.exclude_paths = exclude_paths or ["/health", "/metrics"]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Log request and response information."""
        # Skip logging for excluded paths
        if any(request.url.path.startswith(path) for path in self.exclude_paths):
            return await call_next(request)
        
        # Generate request ID
        request_id = str(uuid.uuid4())[:8]
        
        # Log request
        if self.log_requests:
            logger.info(
                f"[{request_id}] {request.method} {request.url.path} "
                f"from {request.client.host}"
            )
        
        # Process request and measure time
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Add timing headers
        response.headers["X-Process-Time"] = f"{process_time:.4f}"
        response.headers["X-Request-ID"] = request_id
        
        # Log response
        if self.log_responses:
            logger.info(
                f"[{request_id}] {response.status_code} "
                f"({process_time:.4f}s)"
            )
        
        return response


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """
    Global error handling middleware with proper error formatting.
    """
    
    def __init__(self, app: ASGIApp, debug: bool = False):
        super().__init__(app)
        self.debug = debug
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Handle errors globally."""
        try:
            return await call_next(request)
        except Exception as exc:
            # Log the error
            logger.error(
                f"Unhandled error in {request.method} {request.url.path}: {exc}",
                exc_info=True
            )
            
            # Return appropriate error response
            if self.debug:
                # In debug mode, include stack trace
                import traceback
                error_detail = {
                    "error": str(exc),
                    "type": type(exc).__name__,
                    "traceback": traceback.format_exc()
                }
            else:
                # In production, generic error message
                error_detail = {
                    "error": "Internal server error",
                    "message": "An unexpected error occurred"
                }
            
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content=error_detail
            )


class HealthCheckMiddleware(BaseHTTPMiddleware):
    """
    Middleware to handle health checks efficiently.
    """
    
    def __init__(self, app: ASGIApp, health_path: str = "/health"):
        super().__init__(app)
        self.health_path = health_path
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Quick health check response."""
        if request.url.path == self.health_path and request.method == "GET":
            return JSONResponse(
                content={
                    "status": "healthy",
                    "timestamp": time.time(),
                    "service": "task-manager-api"
                }
            )
        
        return await call_next(request)


def init_middleware(app, debug: bool = False) -> None:
    """
    Initialize all middleware components in the correct order.
    
    Middleware order is important - they are applied in reverse order
    of how they are added to the app.
    
    Args:
        app: FastAPI application instance
        debug: Whether to enable debug features
    """
    # Error handling (outermost)
    app.add_middleware(ErrorHandlingMiddleware, debug=debug)
    
    # Security headers
    app.add_middleware(
        SecurityHeadersMiddleware,
        force_https=not debug
    )
    
    # Rate limiting
    app.add_middleware(
        RateLimitMiddleware,
        calls=100 if debug else 60,
        period=60
    )
    
    # Request logging
    app.add_middleware(
        RequestLoggingMiddleware,
        log_requests=debug,
        log_responses=debug
    )
    
    # Health check (innermost, fastest response)
    app.add_middleware(HealthCheckMiddleware)
    
    logger.info("✅ Middleware initialized successfully")