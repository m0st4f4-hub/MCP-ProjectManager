"""
Middleware initialization module.
"""

from .error_handlers import register_exception_handlers
from .request_middleware import register_middleware

# Import middleware classes from standalone file
try:
    from ..security import rate_limiter
    from fastapi import Request, HTTPException, status
    from fastapi.responses import JSONResponse
    from starlette.middleware.base import BaseHTTPMiddleware
    import time

    class RateLimitMiddleware(BaseHTTPMiddleware):
        """Rate limiting middleware."""
        
        def __init__(self, app, calls: int = 60, period: int = 60):
            super().__init__(app)
            self.calls = calls
            self.period = period
        
        async def dispatch(self, request: Request, call_next):
            # Get client IP
            client_ip = request.client.host
            
            # Check rate limit for API endpoints only
            if request.url.path.startswith("/api/"):
                allowed = await rate_limiter.check_rate_limit(
                    key=client_ip,
                    max_requests=self.calls,
                    window_seconds=self.period
                )
                
                if not allowed:
                    return JSONResponse(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        content={"detail": "Rate limit exceeded. Please try again later."}
                    )
            
            # Process request
            start_time = time.time()
            response = await call_next(request)
            process_time = time.time() - start_time
            response.headers["X-Process-Time"] = str(process_time)
            
            return response

    class SecurityHeadersMiddleware(BaseHTTPMiddleware):
        """Add security headers to responses."""
        
        async def dispatch(self, request: Request, call_next):
            response = await call_next(request)
            
            # Add security headers
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            
            return response

except ImportError:
    # Fallback if dependencies are not available
    RateLimitMiddleware = None
    SecurityHeadersMiddleware = None

def init_middleware(app):
    """Initialize all middleware."""
    register_exception_handlers(app)
    register_middleware(app)
    
    # Add custom middleware if available
    if RateLimitMiddleware:
        app.add_middleware(RateLimitMiddleware, calls=60, period=60)
    if SecurityHeadersMiddleware:
        app.add_middleware(SecurityHeadersMiddleware)
