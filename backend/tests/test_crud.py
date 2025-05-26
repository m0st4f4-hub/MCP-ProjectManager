# This file previously contained all CRUD and service tests for the backend.
# As of the latest refactor, all tests have been modularized into dedicated files:
#   - test_projects_crud.py
#   - test_agents_crud.py
#   - test_tasks_crud.py
#   - test_project_members_crud.py
#   - test_project_file_associations_crud.py
#   - test_task_file_associations_crud.py
#   - test_task_dependencies_crud.py
#   - test_audit_logs_crud.py
#   - test_comments_crud.py
#
# Please add new tests to the appropriate file above.

# This file is intentionally left as a stub for legacy reference.

# Task ID: 211
# Agent Role: BuilderAgent
# Request ID: (Inherited from Overmind)
# Project: project-manager
# Timestamp: 2025-05-09T20:40:00Z

import pytest
from sqlalchemy.orm import Session
import uuid
from unittest import mock
import time
from fastapi import HTTPException

# Import AsyncSession
from sqlalchemy.ext.asyncio import AsyncSession

# Import models and schemas directly, including ProjectMemberRole
# Import models
from backend import models

# Import specific schemas as needed
from backend.schemas.agent import AgentCreate, AgentUpdate
from backend.schemas.task import TaskCreate, TaskUpdate
from backend.schemas.project import ProjectCreate, ProjectUpdate
from backend.models.base import ProjectMemberRole # Import ProjectMemberRole from base

# Import memory_crud for file association helpers
from backend.crud import memory as memory_crud

# Import specific crud submodules with aliases
from backend.crud import projects as crud_projects
from backend.crud import tasks as crud_tasks
from backend.crud import agents as crud_agents
from backend.crud import project_members as crud_project_members
from backend.crud import project_file_associations as crud_project_file_associations
from backend.crud import task_file_associations as crud_task_file_associations
from backend.crud import task_dependencies as crud_task_dependencies

# Helper functions used across multiple test files


# Convert to async function and use AsyncSession
async def create_test_project(db: AsyncSession, name="Test Project") -> models.Project:
    project_schema = schemas.ProjectCreate(
        name=name, description="A test project")
    # Await the CRUD call
    project = await crud_projects.create_project(db=db, project=project_schema)
    # Await session operations if necessary within helpers, though CRUD functions should handle commits/refreshes now.
    # Assuming CRUD functions handle commit/refresh internally.
    return project


# Convert to async function and use AsyncSession
async def create_test_agent(db: AsyncSession, name="Test Agent") -> models.Agent:
    agent_schema = schemas.AgentCreate(name=name)
    # Await the CRUD call
    agent = await crud_agents.create_agent(db=db, agent=agent_schema)
    # Assuming CRUD functions handle commit/refresh internally.
    return agent


# Convert to async function and use AsyncSession
async def create_test_task(db: AsyncSession, project_id: uuid.UUID, title="Test Task", agent_id: int | None = None) -> models.Task:
    task_create_schema = schemas.TaskCreate(title=title, project_id=str(project_id), agent_id=agent_id)
    # Await the CRUD call
    task = await crud_tasks.create_task(db, project_id, task=task_create_schema, agent_id=agent_id) # Check if project_id is needed here based on create_task signature
    # Updated based on previous observations of create_task signature (db, task: TaskCreate)
    task_create_schema_corrected = schemas.TaskCreate(title=title, project_id=str(project_id), agent_id=agent_id) # Recreate schema with correct type
    task = await crud_tasks.create_task(db, task=task_create_schema_corrected)
    # Assuming CRUD functions handle commit/refresh internally.
    return task


# Convert to async function and use AsyncSession
async def create_test_project_member(db: AsyncSession, project_id: uuid.UUID, agent_id: int, role: ProjectMemberRole = ProjectMemberRole.MEMBER) -> models.ProjectMember:
    member_schema = schemas.ProjectMemberCreate(
        project_id=str(project_id),
        agent_id=agent_id,
        role=role
    )
    # Await the CRUD call
    member = await crud_project_members.create_project_member(db, member_schema)
    # Assuming CRUD functions handle commit/refresh internally.
    return member


# Convert to async function and use AsyncSession
async def create_test_memory_entity(db: AsyncSession, name: str, entity_type: str, content: str) -> models.MemoryEntity:
    entity_schema = schemas.MemoryEntityCreate(name=name, entity_type=entity_type, content=content)
    # Await the CRUD call
    entity = await memory_crud.create_memory_entity(db, entity_schema)
    # Assuming CRUD functions handle commit/refresh internally.
    return entity


# Convert to async function and use AsyncSession
async def create_test_project_file_association(db: AsyncSession, project_id: uuid.UUID, file_memory_entity_id: int) -> models.ProjectFileAssociation:
    association_schema = schemas.ProjectFileAssociationCreate(
        project_id=str(project_id),
        file_memory_entity_id=file_memory_entity_id
    )
    # Await the CRUD call
    association = await crud_project_file_associations.create_project_file_association(db, association_schema)
    # Assuming CRUD functions handle commit/refresh internally.
    return association


# Convert to async function and use AsyncSession
async def create_test_task_file_association(db: AsyncSession, task_project_id: uuid.UUID, task_task_number: int, file_memory_entity_id: int) -> models.TaskFileAssociation:
    association_schema = schemas.TaskFileAssociationCreate(
        task_project_id=str(task_project_id),
        task_task_number=task_task_number,
        file_memory_entity_id=file_memory_entity_id
    )
    # Await the CRUD call
    association = await crud_task_file_associations.create_task_file_association(db, association_schema)
    # Assuming CRUD functions handle commit/refresh internally.
    return association


# Convert to async function and use AsyncSession
async def create_test_task_dependency(db: AsyncSession, dependent_task_project_id: uuid.UUID, dependent_task_task_number: int, dependency_task_project_id: uuid.UUID, dependency_task_task_number: int) -> models.TaskDependency:
    dependency_schema = schemas.TaskDependencyCreate(
        dependent_task_project_id=str(dependent_task_project_id),
        dependent_task_task_number=dependent_task_task_number,
        dependency_task_project_id=str(dependency_task_project_id),
        dependency_task_task_number=dependency_task_task_number
    )
    # Await the CRUD call
    dependency = await crud_task_dependencies.create_task_dependency(db, dependency_schema)
    # Assuming CRUD functions handle commit/refresh internally.
    return dependency


# All CRUD tests have been moved to dedicated test_*.py files in this directory.
# This file now only contains shared helper functions.

