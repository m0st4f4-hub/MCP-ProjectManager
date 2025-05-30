# Project: project-manager

import pytest
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession

# Import models and schemas directly
# # Import models
from backend import models

# Import specific schemas as needed
from .schemas.agent import AgentCreate, AgentUpdate # Removed broad import

# Import specific model and schemas
from .models.agent import Agent # Added specific model import
from .schemas.agent import AgentCreate, AgentUpdate # Added specific schema imports

# Import specific crud submodule with alias
from backend.crud import agents as crud_agents

# Helper function to create an agent for testing other entities
# This helper is redundant with conftest fixture and can be removed
# def create_test_agent(db: Session, name="Test Agent") -> models.Agent:
# agent_schema = schemas.AgentCreate(name=name)
# return crud_agents.create_agent(db=db, agent=agent_schema)

# --- Agent CRUD Tests ---


async def test_create_and_get_agent(async_db_session: AsyncSession):
 agent_schema = AgentCreate(name="Test Agent Alpha") # Use imported schema
 db_agent = await crud_agents.create_agent(db=async_db_session, agent=agent_schema)
 assert db_agent is not None
 assert db_agent.name == "Test Agent Alpha"
 assert db_agent.id is not None

 retrieved_agent = await crud_agents.get_agent(db=async_db_session, agent_id=db_agent.id)
 assert retrieved_agent is not None
 assert retrieved_agent.id == db_agent.id

 retrieved_by_name = await crud_agents.get_agent_by_name(
 db=async_db_session, name="Test Agent Alpha")
 assert retrieved_by_name is not None
 assert retrieved_by_name.id == db_agent.id


async def test_get_agent_not_found(async_db_session: AsyncSession):
 # Test non-existent agent by ID
 assert await crud_agents.get_agent(db=async_db_session, agent_id=8888) is None
 # Test non-existent agent by name
 assert await crud_agents.get_agent_by_name(
 db=async_db_session, name="NonExistentAgent") is None
 # Test with None values
 assert await crud_agents.get_agent(db=async_db_session, agent_id=None) is None
 assert await crud_agents.get_agent_by_name(db=async_db_session, name=None) is None


async def test_get_agents(async_db_session: AsyncSession):
 agents_before = await crud_agents.get_agents(db=async_db_session)
 # Use the conftest fixture instead of local helper
 # create_test_agent(db_session, name="Agent List Test 1")
 # create_test_agent(db_session, name="Agent List Test 2")
 # Note: Creating agents directly in tests might be better for isolation with rollback
 # For now, I will keep the direct creation but use the imported models/schemas
 agent1_schema = AgentCreate(name="Agent List Test 1")
 await crud_agents.create_agent(db=async_db_session, agent=agent1_schema)
 agent2_schema = AgentCreate(name="Agent List Test 2")
 await crud_agents.create_agent(db=async_db_session, agent=agent2_schema)
 
 agents_after = await crud_agents.get_agents(db=async_db_session)
 assert len(agents_after) == len(agents_before) + 2


async def test_update_agent(async_db_session: AsyncSession):
 # Use the conftest fixture or create directly
 # agent = create_test_agent(db_session, name="Original Agent Name")
 agent_create_schema = AgentCreate(name="Original Agent Name")
 agent = await crud_agents.create_agent(db=async_db_session, agent=agent_create_schema)
 
 update_data = AgentUpdate(name="Updated Agent Name") # Use imported schema
 updated_agent = await crud_agents.update_agent(
 db=async_db_session, agent_id=agent.id, agent_update=update_data)
 assert updated_agent is not None
 assert updated_agent.name == "Updated Agent Name"


async def test_delete_agent(async_db_session: AsyncSession):
 # Use the conftest fixture or create directly
 # agent = create_test_agent(db_session, name="Agent To Delete")
 agent_create_schema = AgentCreate(name="Agent To Delete")
 agent = await crud_agents.create_agent(db=async_db_session, agent=agent_create_schema)
 
 agent_id = agent.id
 deleted_agent = await crud_agents.delete_agent(db=async_db_session, agent_id=agent_id)
 assert deleted_agent is not None
 assert deleted_agent.id == agent_id
 assert await crud_agents.get_agent(db=async_db_session, agent_id=agent_id) is None

# --- Agent CRUD Tests End --- 