
from backend.main import app


def test_openapi_contains_key_paths():
    """Ensure generated OpenAPI schema exposes core endpoints."""
    schema = app.openapi()
    assert "paths" in schema
    paths = schema["paths"]

    # Basic checks on schema
    assert isinstance(paths, dict)
    assert len(paths) > 0

    # Verify a couple of important endpoints are documented
    expected = [
        "/api/v1/users/",
        "/api/memory/entities/",
    ]
    for path in expected:
        assert path in paths
