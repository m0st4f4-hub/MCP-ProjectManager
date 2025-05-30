# Project: project-manager

import pytest
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession
import uuid
import time # Added import for audit log timestamp
import json

# Import models and schemas directly
from backend import models
from .schemas.agent import AgentCreate
from .schemas.audit_log import AuditLogCreate

# Import specific crud submodules with aliases
from backend.crud import agents as crud_agents # Needed for audit logs
from backend.crud import audit_logs as crud_audit_logs

# Helper function to create an agent for testing other entities
async def create_test_agent(db: AsyncSession, name="Test Agent") -> models.Agent:
 agent_schema = AgentCreate(name=name)
 return await crud_agents.create_agent(db=db, agent=agent_schema)

# --- Audit Log CRUD Tests ---

async def test_create_and_get_audit_log(async_db_session: AsyncSession):
 agent = await create_test_agent(async_db_session)
 log_time = int(time.time())
 audit_log_data = AuditLogCreate(
 user_id=str(agent.id),
 action="TEST_ACTION",
 details={"key": "value"}
 )
 db_log = await crud_audit_logs.create_audit_log(async_db_session, audit_log=audit_log_data)
 assert db_log is not None
 assert db_log.user_id == str(agent.id)
 assert db_log.action_type == "TEST_ACTION"
 assert json.loads(db_log.details) == {"key": "value"}

 retrieved_log = await crud_audit_logs.get_audit_log(async_db_session, audit_log_id=db_log.id)
 assert retrieved_log is not None
 assert retrieved_log.id == db_log.id


async def test_get_audit_log_not_found(async_db_session: AsyncSession):
 assert await crud_audit_logs.get_audit_log(async_db_session, audit_log_id=99999) is None


async def test_get_audit_logs_by_agent(async_db_session: AsyncSession):
 agent1 = await create_test_agent(async_db_session, name="Agent Audit 1")
 agent2 = await create_test_agent(async_db_session, name="Agent Audit 2")

 # Create logs for agent 1
 log_data_1 = AuditLogCreate(user_id=str(agent1.id), action="ACTION_A", details={})
 log_data_2 = AuditLogCreate(user_id=str(agent1.id), action="ACTION_B", details={})
 await crud_audit_logs.create_audit_log(async_db_session, audit_log=log_data_1)
 await crud_audit_logs.create_audit_log(async_db_session, audit_log=log_data_2)

 # Create log for agent 2
 log_data_3 = AuditLogCreate(user_id=str(agent2.id), action="ACTION_C", details={})
 await crud_audit_logs.create_audit_log(async_db_session, audit_log=log_data_3)

 # Get logs for agent 1 - Using get_audit_logs and filtering manually
 all_logs = await crud_audit_logs.get_audit_logs(async_db_session)
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
 all_logs_non_existent = await crud_audit_logs.get_audit_logs(async_db_session)
 non_existent_logs = [log for log in all_logs_non_existent if log.user_id == non_existent_agent_id]
 assert len(non_existent_logs) == 0


async def test_delete_audit_log(async_db_session: AsyncSession):
 agent = await create_test_agent(async_db_session)
 log_time = int(time.time())
 audit_log_data = AuditLogCreate(
 user_id=str(agent.id),
 action="TO_BE_DELETED",
 details={}
 )
 db_log = await crud_audit_logs.create_audit_log(async_db_session, audit_log=audit_log_data)
 log_id = db_log.id

 deleted = await crud_audit_logs.delete_audit_log(async_db_session, log_id=log_id)
 assert deleted is True
 assert await crud_audit_logs.get_audit_log(async_db_session, audit_log_id=log_id) is None

 # Try deleting a non-existent log
 deleted_not_found = await crud_audit_logs.delete_audit_log(async_db_session, log_id=99999)
 assert deleted_not_found is False

# --- Audit Log CRUD Tests End --- 