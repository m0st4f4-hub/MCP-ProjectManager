"""
Middleware initialization module.
"""

from .error_handlers import register_exception_handlers
from .request_middleware import register_middleware

def init_middleware(app):
 """Initialize all middleware."""
 register_exception_handlers(app)
 register_middleware(app)

# This makes 'middleware' a Python package
