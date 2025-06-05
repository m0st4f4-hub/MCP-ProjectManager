from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Application settings for configurable options like CORS."""

    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def allowed_origins(self) -> List[str]:
        """Return list of allowed origins parsed from CORS_ORIGINS."""
        if not self.CORS_ORIGINS:
            return []
        parts = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return parts or ["*"]

settings = Settings()
