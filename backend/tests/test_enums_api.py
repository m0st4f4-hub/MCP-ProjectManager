"""Tests for Enums API endpoints."""
import pytest
from fastapi import status
from backend.enums import TaskStatusEnum, ProjectStatus, ProjectPriority, UserRoleEnum


def test_enum_endpoints_not_implemented(client):
    """Test that enum endpoints return 404 since they're not implemented yet."""
    # Test various enum endpoints to verify they don't exist yet
    endpoints = [
        "/api/v1/enums/task-statuses",
        "/api/v1/enums/project-statuses",
        "/api/v1/enums/project-priorities",
        "/api/v1/enums/user-roles"
    ]
    
    for endpoint in endpoints:
        response = client.get(endpoint)
        assert response.status_code == status.HTTP_404_NOT_FOUND


def test_enums_exist():
    """Test that our enums can be imported and have values."""
    # Test TaskStatusEnum - using actual enum values from enums.py
    assert hasattr(TaskStatusEnum, 'TO_DO')
    assert hasattr(TaskStatusEnum, 'IN_PROGRESS') 
    assert hasattr(TaskStatusEnum, 'COMPLETED')
    
    # Test ProjectStatus
    assert hasattr(ProjectStatus, 'ACTIVE')
    assert hasattr(ProjectStatus, 'COMPLETED')
    
    # Test ProjectPriority
    assert hasattr(ProjectPriority, 'LOW')
    assert hasattr(ProjectPriority, 'MEDIUM')
    assert hasattr(ProjectPriority, 'HIGH')
    
    # Test UserRoleEnum
    assert hasattr(UserRoleEnum, 'USER')
    assert hasattr(UserRoleEnum, 'ADMIN') 
