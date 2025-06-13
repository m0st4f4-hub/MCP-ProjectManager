"""
Middleware initialization module.
"""

from .error_handlers import register_exception_handlers
from .request_middleware import register_middleware

try:  # pragma: no cover - optional dependency
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    from slowapi.middleware import SlowAPIMiddleware
    SLOWAPI_AVAILABLE = True
except Exception:  # pragma: no cover - slowapi missing
    SLOWAPI_AVAILABLE = False

from starlette.middleware.base import BaseHTTPMiddleware
from config.app_config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to responses."""

    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        return response


def init_middleware(app):
    """Initialize all middleware."""
    register_exception_handlers(app)
    register_middleware(app)

    if SLOWAPI_AVAILABLE:
        limiter = Limiter(
            key_func=get_remote_address,
            default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"],
        )
        app.state.limiter = limiter
        app.add_exception_handler(
            RateLimitExceeded, _rate_limit_exceeded_handler
        )
        app.add_middleware(SlowAPIMiddleware)

    if SecurityHeadersMiddleware:
        app.add_middleware(SecurityHeadersMiddleware)
