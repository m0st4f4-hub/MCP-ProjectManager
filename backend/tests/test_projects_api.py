"""Tests for Projects API endpoints."""
import pytest
from fastapi import status
from enums import ProjectStatus, ProjectPriority, ProjectVisibility
from models.project import Project


def test_create_project(client, sample_user):
    """Test creating a new project."""
    project_data = {
        "name": "New Test Project",
        "description": "A new project for testing",
        "status": ProjectStatus.ACTIVE.value,
        "priority": ProjectPriority.HIGH.value,
        "visibility": ProjectVisibility.TEAM.value,
        "owner_id": sample_user.id
    }
    
    response = client.post("/api/v1/projects/projects/", json=project_data)
    assert response.status_code == status.HTTP_201_CREATED
    
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == project_data["name"]
    assert data["data"]["status"] == project_data["status"]
    assert data["data"]["priority"] == project_data["priority"]
    assert data["data"]["visibility"] == project_data["visibility"]
    assert data["data"]["owner_id"] == sample_user.id


def test_get_projects_list(client, sample_project):
    """Test getting list of projects with pagination."""
    response = client.get("/api/v1/projects/projects/")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert "pagination" in data
    assert len(data["data"]) >= 1
    assert data["data"][0]["id"] == sample_project.id


def test_get_project_by_id(client, sample_project):
    """Test getting a specific project by ID."""
    response = client.get(f"/api/v1/projects/projects/{sample_project.id}")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["success"] is True
    assert data["data"]["id"] == sample_project.id
    assert data["data"]["name"] == sample_project.name


def test_get_project_not_found(client):
    """Test getting non-existent project returns 404."""
    response = client.get("/api/v1/projects/projects/99999")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_project(client, sample_project):
    """Test updating a project."""
    update_data = {
        "name": "Updated Project Name",
        "status": ProjectStatus.COMPLETED.value,
        "priority": ProjectPriority.LOW.value
    }
    
    response = client.put(f"/api/v1/projects/projects/{sample_project.id}", json=update_data)
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == update_data["name"]
    assert data["data"]["status"] == update_data["status"]
    assert data["data"]["priority"] == update_data["priority"]


def test_delete_project(client, sample_project):
    """Test deleting a project."""
    response = client.delete(f"/api/v1/projects/projects/{sample_project.id}")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["success"] is True
    
    # Verify project is deleted
    get_response = client.get(f"/api/v1/projects/projects/{sample_project.id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND


def test_filter_projects_by_status(client, db_session, sample_user):
    """Test filtering projects by status."""
    active_project = Project(
        name="Active Project",
        description="Active project",
        status=ProjectStatus.ACTIVE,
        priority=ProjectPriority.MEDIUM,
        visibility=ProjectVisibility.TEAM,
        owner_id=sample_user.id
    )
    
    db_session.add(active_project)
    db_session.commit()
    
    response = client.get("/api/v1/projects/projects/?status=active")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["success"] is True


def test_filter_projects_by_priority(client, db_session, sample_user):
    """Test filtering projects by priority."""
    high_project = Project(
        name="High Priority Project",
        description="High priority project",
        status=ProjectStatus.ACTIVE,
        priority=ProjectPriority.HIGH,
        visibility=ProjectVisibility.TEAM,
        owner_id=sample_user.id
    )
    
    db_session.add(high_project)
    db_session.commit()
    
    response = client.get("/api/v1/projects/projects/?priority=high")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["success"] is True


def test_search_projects(client, db_session, sample_user):
    """Test searching projects by name and description."""
    searchable_project = Project(
        name="Searchable Project Alpha",
        description="This project contains alpha keywords",
        status=ProjectStatus.ACTIVE,
        priority=ProjectPriority.MEDIUM,
        visibility=ProjectVisibility.TEAM,
        owner_id=sample_user.id
    )
    
    db_session.add(searchable_project)
    db_session.commit()
    
    response = client.get("/api/v1/projects/projects/?search=alpha")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["success"] is True


def test_archive_project(client, sample_project):
    """Test archiving a project."""
    response = client.post(f"/api/v1/projects/projects/{sample_project.id}/archive")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["success"] is True


def test_unarchive_project(client, db_session, sample_project):
    """Test unarchiving a project."""
    sample_project.is_archived = True
    db_session.commit()
    
    response = client.post(f"/api/v1/projects/projects/{sample_project.id}/unarchive")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["success"] is True


def test_pagination(client, db_session, sample_user):
    """Test project pagination."""
    # Create multiple projects
    projects = []
    for i in range(15):
        project = Project(
            name=f"Project {i}",
            description=f"Description {i}",
            status=ProjectStatus.ACTIVE,
            priority=ProjectPriority.MEDIUM,
            visibility=ProjectVisibility.TEAM,
            owner_id=sample_user.id
        )
        projects.append(project)
    
    db_session.add_all(projects)
    db_session.commit()
    
    # Test first page
    response = client.get("/api/v1/projects/projects/?page=1&page_size=10")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) == 10
    assert data["pagination"]["page"] == 1
    assert data["pagination"]["page_size"] == 10
    assert data["pagination"]["total"] >= 15
