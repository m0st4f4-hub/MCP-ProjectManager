"""Application entry point."""
from .app_factory import create_app, include_app_routers

app = create_app()

__all__ = ["app", "include_app_routers"]
