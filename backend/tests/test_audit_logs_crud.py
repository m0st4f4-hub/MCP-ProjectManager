# Project: project-manager

import pytest
from sqlalchemy.orm import Session
import uuid
import time # Added import for audit log timestamp

# Import models and schemas directly
from backend import models, schemas

# Import specific crud submodules with aliases
from backend.crud import agents as crud_agents # Needed for audit logs
from backend.crud import audit_logs as crud_audit_logs

# Helper function to create an agent for testing other entities
def create_test_agent(db: Session, name="Test Agent") -> models.Agent:
    agent_schema = schemas.AgentCreate(name=name)
    return crud_agents.create_agent(db=db, agent=agent_schema)

# --- Audit Log CRUD Tests ---

def test_create_and_get_audit_log(db_session: Session):
    agent = create_test_agent(db_session)
    log_time = int(time.time())
    audit_log_data = schemas.AuditLogCreate(
        agent_id=agent.id,
        action="TEST_ACTION",
        timestamp=log_time,
        details={"key": "value"},
        entity_type="agent",
        entity_id=agent.id
    )
    db_log = crud_audit_logs.create_audit_log(db_session, log=audit_log_data)
    assert db_log is not None
    assert db_log.agent_id == agent.id
    assert db_log.action == "TEST_ACTION"
    assert db_log.timestamp == log_time
    assert db_log.details == {"key": "value"}

    retrieved_log = crud_audit_logs.get_audit_log(db_session, log_id=db_log.id)
    assert retrieved_log is not None
    assert retrieved_log.id == db_log.id


def test_get_audit_log_not_found(db_session: Session):
    assert crud_audit_logs.get_audit_log(db_session, log_id=99999) is None


def test_get_audit_logs_by_agent(db_session: Session):
    agent1 = create_test_agent(db_session, name="Agent Audit 1")
    agent2 = create_test_agent(db_session, name="Agent Audit 2")

    log_time1 = int(time.time()) - 10
    log_time2 = int(time.time()) - 5

    # Create logs for agent 1
    log_data_1 = schemas.AuditLogCreate(agent_id=agent1.id, action="ACTION_A", timestamp=log_time1, details={}, entity_type="agent", entity_id=agent1.id)
    log_data_2 = schemas.AuditLogCreate(agent_id=agent1.id, action="ACTION_B", timestamp=log_time2, details={}, entity_type="agent", entity_id=agent1.id)
    crud_audit_logs.create_audit_log(db_session, log=log_data_1)
    crud_audit_logs.create_audit_log(db_session, log=log_data_2)

    # Create log for agent 2
    log_data_3 = schemas.AuditLogCreate(agent_id=agent2.id, action="ACTION_C", timestamp=int(time.time()), details={})
    crud_audit_logs.create_audit_log(db_session, log=log_data_3)

    # Get logs for agent 1
    agent1_logs = crud_audit_logs.get_audit_logs_by_agent(db_session, agent_id=agent1.id)
    assert len(agent1_logs) == 2
    assert all(log.agent_id == agent1.id for log in agent1_logs)

    # Get logs for agent 2
    agent2_logs = crud_audit_logs.get_audit_logs_by_agent(db_session, agent_id=agent2.id)
    assert len(agent2_logs) == 1
    assert all(log.agent_id == agent2.id for log in agent2_logs)

    # Get logs for a non-existent agent
    non_existent_logs = crud_audit_logs.get_audit_logs_by_agent(db_session, agent_id=99999)
    assert len(non_existent_logs) == 0


def test_delete_audit_log(db_session: Session):
    agent = create_test_agent(db_session)
    log_time = int(time.time())
    audit_log_data = schemas.AuditLogCreate(
        agent_id=agent.id,
        action="TO_BE_DELETED",
        timestamp=log_time,
        details={},
        entity_type="agent",
        entity_id=agent.id
    )
    db_log = crud_audit_logs.create_audit_log(db_session, log=audit_log_data)
    log_id = db_log.id

    deleted = crud_audit_logs.delete_audit_log(db_session, log_id=log_id)
    assert deleted is True
    assert crud_audit_logs.get_audit_log(db_session, log_id=log_id) is None

    # Try deleting a non-existent log
    deleted_not_found = crud_audit_logs.delete_audit_log(db_session, log_id=99999)
    assert deleted_not_found is False

# --- Audit Log CRUD Tests End --- 