"""
Configuration package initialization.
"""

from .logging_config import configure_logging
# from .router_config import configure_routers # Removed for Alembic compatibility

__all__ = ['configure_logging'] # Removed 'configure_routers'
