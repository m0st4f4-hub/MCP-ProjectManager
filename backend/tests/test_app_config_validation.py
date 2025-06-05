import pytest

from backend.config.app_config import Settings, validate_settings


def test_validate_settings_missing_secret_key():
    cfg = Settings(SECRET_KEY="", ALGORITHM="HS256", ACCESS_TOKEN_EXPIRE_MINUTES=30)
    with pytest.raises(ValueError) as exc:
        validate_settings(cfg)
    assert "SECRET_KEY" in str(exc.value)


def test_validate_settings_missing_algorithm():
    cfg = Settings(SECRET_KEY="key", ALGORITHM="", ACCESS_TOKEN_EXPIRE_MINUTES=30)
    with pytest.raises(ValueError) as exc:
        validate_settings(cfg)
    assert "ALGORITHM" in str(exc.value)
