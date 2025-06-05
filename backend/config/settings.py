"""Application settings for feature toggles."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration for optional features."""

    ENABLE_MCP: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

__all__ = ["settings", "Settings"]
