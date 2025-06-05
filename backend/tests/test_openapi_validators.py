import pytest
from backend.main import app

def test_openapi_no_validator_error():
    """OpenAPI generation should not raise validator errors."""
    try:
        schema = app.openapi()
    except RuntimeError as exc:
        pytest.fail(f"OpenAPI generation failed: {exc}")
    assert "paths" in schema
