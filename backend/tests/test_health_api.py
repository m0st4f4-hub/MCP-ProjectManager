"""Tests for Health Check API endpoints."""
import pytest
from fastapi import status


def test_health_check(client):
    """Test basic health check endpoint."""
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "version" in data


def test_detailed_health_check_not_implemented(client):
    """Test detailed health check endpoint returns 404 since it's not implemented."""
    response = client.get("/health/detailed")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_readiness_check_not_implemented(client):
    """Test readiness probe endpoint returns 404 since it's not implemented."""
    response = client.get("/health/ready")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_liveness_check_not_implemented(client):
    """Test liveness probe endpoint returns 404 since it's not implemented."""
    response = client.get("/health/live")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_health_check_response_format(client):
    """Test health check response has correct format."""
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert isinstance(data, dict)
    assert "status" in data
    assert "database" in data


def test_health_check_includes_version(client):
    """Test health check includes version information."""
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert "version" in data
    assert data["version"] == "2.0.1"


def test_health_endpoints_no_authentication(client):
    """Test that the basic health endpoint doesn't require authentication."""
    # Make request without authentication headers
    response = client.get("/health")
    # Should not return 401 Unauthorized
    assert response.status_code != status.HTTP_401_UNAUTHORIZED
    # Should return 200 OK for health checks
    assert response.status_code == status.HTTP_200_OK


def test_health_check_performance(client):
    """Test health check responds quickly."""
    import time
    start_time = time.time()
    response = client.get("/health")
    end_time = time.time()
    
    assert response.status_code == status.HTTP_200_OK
    # Health check should complete in under 1 second
    assert (end_time - start_time) < 1.0


def test_health_check_content_type(client):
    """Test health check returns JSON content type."""
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    assert "application/json" in response.headers.get("content-type", "")


def test_multiple_health_check_calls(client):
    """Test multiple health check calls work consistently."""
    for _ in range(3):
        response = client.get("/health")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"


def test_health_check_consistent_format(client):
    """Test health check always returns consistent format."""
    response1 = client.get("/health")
    response2 = client.get("/health")
    
    assert response1.status_code == status.HTTP_200_OK
    assert response2.status_code == status.HTTP_200_OK
    
    data1 = response1.json()
    data2 = response2.json()
    
    # Same keys should be present
    assert set(data1.keys()) == set(data2.keys())
    # Status should be consistent
    assert data1["status"] == data2["status"] 
