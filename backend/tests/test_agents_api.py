"""Tests for Agents API endpoints."""
import pytest
from fastapi import status
from backend.models.agent import Agent


def test_agent_model_creation(db_session):
    """Test creating an agent model directly."""
    agent = Agent(
        name="Test Agent",
        description="A test agent for automation"
    )
    
    db_session.add(agent)
    db_session.commit()
    db_session.refresh(agent)
    
    assert agent.id is not None
    assert agent.name == "Test Agent"
    assert agent.description == "A test agent for automation"


def test_agent_endpoints_not_implemented(client):
    """Test that agent endpoints return 404 since they're not implemented yet."""
    # Test various agent endpoints to verify they don't exist yet
    endpoints = [
        "/api/v1/agents/",
        "/api/v1/agents/123"
    ]
    
    for endpoint in endpoints:
        response = client.get(endpoint)
        assert response.status_code == status.HTTP_404_NOT_FOUND 
