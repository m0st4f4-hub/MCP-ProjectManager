from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    database_url: str = "sqlite+aiosqlite:///./sql_app.db"
    secret_key: str = "changeme"
    mcp_enabled: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
