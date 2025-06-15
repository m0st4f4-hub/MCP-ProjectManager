"""Tests for Users API endpoints."""
import pytest
from fastapi import status
from backend.enums import UserRoleEnum
from backend.models.user import User


def test_create_user(client):
    """Test creating a new user."""
    user_data = {
        "username": "newuser",
        "email": "newuser@example.com",
        "full_name": "New User",
        "password": "password123",
        "roles": [UserRoleEnum.ENGINEER.value]
    }
    
    response = client.post("/api/v1/users/", json=user_data)
    assert response.status_code == status.HTTP_201_CREATED
    
    data = response.json()
    assert data["success"] is True
    assert data["data"]["username"] == user_data["username"]


def test_get_users_list(client, sample_user):
    """Test getting list of users with pagination."""
    response = client.get("/api/v1/users/")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert "pagination" in data


def test_filter_users_by_role(client, db_session):
    """Test filtering users by role."""
    admin_user = User(
        username="admin_user",
        email="admin@example.com",
        full_name="Admin User",
        hashed_password="hashedpassword",
        disabled=False,
        roles=[UserRoleEnum.ADMIN]
    )
    
    db_session.add(admin_user)
    db_session.commit()
    
    response = client.get("/api/v1/users/?role=admin")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["success"] is True


def test_search_users(client, db_session):
    """Test searching users by username, email, or full_name."""
    searchable_user = User(
        username="searchable_user",
        email="search@example.com",
        full_name="Search Test User",
        hashed_password="hashedpassword",
        disabled=False,
        roles=[UserRoleEnum.ENGINEER]
    )
    
    db_session.add(searchable_user)
    db_session.commit()
    
    response = client.get("/api/v1/users/?search=searchable")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["success"] is True
