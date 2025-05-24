# Project: project-manager

import pytest
from sqlalchemy.orm import Session

# Import models and schemas directly
from backend import models, schemas

# Import specific crud submodule with alias
from backend.crud import agents as crud_agents

# Helper function to create an agent for testing other entities
def create_test_agent(db: Session, name="Test Agent") -> models.Agent:
    agent_schema = schemas.AgentCreate(name=name)
    return crud_agents.create_agent(db=db, agent=agent_schema)

# --- Agent CRUD Tests ---


def test_create_and_get_agent(db_session: Session):
    agent_schema = schemas.AgentCreate(name="Test Agent Alpha")
    db_agent = crud_agents.create_agent(db=db_session, agent=agent_schema)
    assert db_agent is not None
    assert db_agent.name == "Test Agent Alpha"
    assert db_agent.id is not None

    retrieved_agent = crud_agents.get_agent(db=db_session, agent_id=db_agent.id)
    assert retrieved_agent is not None
    assert retrieved_agent.id == db_agent.id

    retrieved_by_name = crud_agents.get_agent_by_name(
        db=db_session, name="Test Agent Alpha")
    assert retrieved_by_name is not None
    assert retrieved_by_name.id == db_agent.id


def test_get_agent_not_found(db_session: Session):
    # Test non-existent agent by ID
    assert crud_agents.get_agent(db=db_session, agent_id=8888) is None
    # Test non-existent agent by name
    assert crud_agents.get_agent_by_name(
        db=db_session, name="NonExistentAgent") is None
    # Test with None values
    assert crud_agents.get_agent(db=db_session, agent_id=None) is None
    assert crud_agents.get_agent_by_name(db=db_session, name=None) is None


def test_get_agents(db_session: Session):
    agents_before = crud_agents.get_agents(db=db_session)
    create_test_agent(db_session, name="Agent List Test 1")
    create_test_agent(db_session, name="Agent List Test 2")
    agents_after = crud_agents.get_agents(db=db_session)
    assert len(agents_after) == len(agents_before) + 2


def test_update_agent(db_session: Session):
    agent = create_test_agent(db_session, name="Original Agent Name")
    update_data = schemas.AgentUpdate(name="Updated Agent Name")
    updated_agent = crud_agents.update_agent(
        db=db_session, agent_id=agent.id, agent_update=update_data)
    assert updated_agent is not None
    assert updated_agent.name == "Updated Agent Name"


def test_delete_agent(db_session: Session):
    agent = create_test_agent(db_session, name="Agent To Delete")
    agent_id = agent.id
    deleted_agent = crud_agents.delete_agent(db=db_session, agent_id=agent_id)
    assert deleted_agent is not None
    assert deleted_agent.id == agent_id
    assert crud_agents.get_agent(db=db_session, agent_id=agent_id) is None

# --- Agent CRUD Tests End --- 