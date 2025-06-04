"""
Authentication middleware for API routes.
This module provides middleware for handling authentication in FastAPI routes.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import logging
import time
import uuid

logger = logging.getLogger(__name__)


class RequestMiddleware(BaseHTTPMiddleware):
    """
    Middleware for request logging, timing, and request ID generation.
    """

    async def dispatch(self, request: Request, call_next):
        """Process a request and add metadata."""  # Generate a unique request ID
        request_id = str(uuid.uuid4())  # Add request ID to the request state
        request.state.request_id = request_id  # Log the request
        logger.info(
            f"Request {request_id}: {request.method} {request.url.path}"
        )  # Time the request
        start_time = time.time()  # Process the request
        try:
            response = await call_next(request)  # Calculate request duration
            duration = time.time() - start_time  # Add custom headers to the response
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Request-Duration"] = f"{duration:.6f}"  # Log the response
            logger.info(
                f"Response {request_id}: {response.status_code} in {duration:.6f}s"
            )

            return response
        except Exception as e:  # Log the error
            logger.error(
                f"Request {request_id} failed: {str(e)}"
            )  # Re-raise the exception to be handled by the exception handlers
            raise

class SecurityMiddleware(BaseHTTPMiddleware):
    """
    Middleware for adding security headers to responses.
    """

    async def dispatch(self, request: Request, call_next):
        """Add security headers to the response."""
        response = await call_next(request)  # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"  # Only add CSP header if not already set (custom docs routes set their own)
        if "Content-Security-Policy" not in response.headers:
            response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' https://fastapi.tiangolo.com"

        return response

def register_middleware(app):
    """Register all middleware."""
    app.add_middleware(RequestMiddleware)
    app.add_middleware(SecurityMiddleware)
