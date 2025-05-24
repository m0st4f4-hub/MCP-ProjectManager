# Project: project-manager

import pytest
from sqlalchemy.orm import Session
import uuid
import time # Added import for audit log timestamp
import json

# Import models and schemas directly
from backend import models
from backend.schemas.agent import AgentCreate
from backend.schemas.audit_log import AuditLogCreate

# Import specific crud submodules with aliases
from backend.crud import agents as crud_agents # Needed for audit logs
from backend.crud import audit_logs as crud_audit_logs

# Helper function to create an agent for testing other entities
def create_test_agent(db: Session, name="Test Agent") -> models.Agent:
    agent_schema = AgentCreate(name=name)
    return crud_agents.create_agent(db=db, agent=agent_schema)

# --- Audit Log CRUD Tests ---

def test_create_and_get_audit_log(db_session: Session):
    agent = create_test_agent(db_session)
    log_time = int(time.time())
    audit_log_data = AuditLogCreate(
        user_id=str(agent.id),
        action="TEST_ACTION",
        details={"key": "value"}
    )
    db_log = crud_audit_logs.create_audit_log(db_session, audit_log=audit_log_data)
    assert db_log is not None
    assert db_log.user_id == str(agent.id)
    assert db_log.action_type == "TEST_ACTION"
    assert json.loads(db_log.details) == {"key": "value"}

    retrieved_log = crud_audit_logs.get_audit_log(db_session, audit_log_id=db_log.id)
    assert retrieved_log is not None
    assert retrieved_log.id == db_log.id


def test_get_audit_log_not_found(db_session: Session):
    assert crud_audit_logs.get_audit_log(db_session, audit_log_id=99999) is None


def test_get_audit_logs_by_agent(db_session: Session):
    agent1 = create_test_agent(db_session, name="Agent Audit 1")
    agent2 = create_test_agent(db_session, name="Agent Audit 2")

    # Create logs for agent 1
    log_data_1 = AuditLogCreate(user_id=str(agent1.id), action="ACTION_A", details={})
    log_data_2 = AuditLogCreate(user_id=str(agent1.id), action="ACTION_B", details={})
    crud_audit_logs.create_audit_log(db_session, audit_log=log_data_1)
    crud_audit_logs.create_audit_log(db_session, audit_log=log_data_2)

    # Create log for agent 2
    log_data_3 = AuditLogCreate(user_id=str(agent2.id), action="ACTION_C", details={})
    crud_audit_logs.create_audit_log(db_session, audit_log=log_data_3)

    # Get logs for agent 1 - Using get_audit_logs and filtering manually
    all_logs = crud_audit_logs.get_audit_logs(db_session)
    agent1_logs = [log for log in all_logs if log.user_id == str(agent1.id)]
    assert len(agent1_logs) == 2
    assert all(log.action_type in ["ACTION_A", "ACTION_B"] for log in agent1_logs)
    assert all(log.user_id == str(agent1.id) for log in agent1_logs)

    # Get logs for agent 2
    agent2_logs = [log for log in all_logs if log.user_id == str(agent2.id)]
    assert len(agent2_logs) == 1
    assert all(log.action_type == "ACTION_C" for log in agent2_logs)
    assert all(log.user_id == str(agent2.id) for log in agent2_logs)

    # Get logs for a non-existent agent
    non_existent_agent_id = str(uuid.uuid4())
    non_existent_logs = [log for log in all_logs if log.user_id == non_existent_agent_id]
    assert len(non_existent_logs) == 0


def test_delete_audit_log(db_session: Session):
    agent = create_test_agent(db_session)
    log_time = int(time.time())
    audit_log_data = AuditLogCreate(
        user_id=str(agent.id),
        action="TO_BE_DELETED",
        details={}
    )
    db_log = crud_audit_logs.create_audit_log(db_session, audit_log=audit_log_data)
    log_id = db_log.id

    deleted = crud_audit_logs.delete_audit_log(db_session, log_id=log_id)
    assert deleted is True
    assert crud_audit_logs.get_audit_log(db_session, audit_log_id=log_id) is None

    # Try deleting a non-existent log
    deleted_not_found = crud_audit_logs.delete_audit_log(db_session, log_id=99999)
    assert deleted_not_found is False

# --- Audit Log CRUD Tests End --- 