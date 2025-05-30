# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional
# Assuming BaseModel might be needed for request/response schemas
from pydantic import BaseModel

# from .. import schemas # Removed broad import
# Import Agent schemas directly
from ..schemas.agent import Agent, AgentCreate, AgentUpdate # Added direct imports
# from ..schemas.agent_rule import AgentRule # Removed incorrect import for AgentRule
from ..schemas.agent_role import AgentRole # Added import for AgentRole

# Import AgentService from the service layer
from ..services.agent_service import AgentService
from ..crud import agents as crud_agents
from ..database import get_db # Import database dependency


def get_agent_service(db: Session = Depends(get_db)) -> AgentService:
 """Dependency that provides an AgentService instance."""
 return AgentService(db)


router = APIRouter(
 tags=["Agents"],
)


@router.post("/", response_model=Agent, summary="Create Agent", operation_id="create_agent")
def create_agent(agent: AgentCreate, db: Session = Depends(get_db)):
 """Registers a new agent.
 - **name**: Unique name for the agent (required).
 """
 # Instantiate AgentService
 agent_service = AgentService(db)

 db_agent = agent_service.get_agent_by_name(name=agent.name)
 if db_agent:
 raise HTTPException(
 status_code=400, detail="Agent name already registered")
 return agent_service.create_agent(agent=agent)


@router.get("/", response_model=List[Agent], summary="Get Agents", operation_id="get_agents")
def get_agent_list(
 search: Optional[str] = None, # Added search parameter
 # Added status parameter (though Agent model doesn't have status yet)
 status: Optional[str] = None,
 is_archived: Optional[bool] = Query(
 False, description="Filter by archived status. False for non-archived, True for archived, null/None for all."), # ADDED
 db: Session = Depends(get_db) # ADDED db session dependency
):
 """Retrieves a list of registered agents with optional filtering."""
 # Instantiate AgentService
 agent_service = AgentService(db)
 agents = agent_service.get_agents(
 search=search, status=status, is_archived=is_archived) # Pass new params
 return agents


@router.get("/{agent_name}", response_model=Agent, summary="Get Agent by Name", tags=["Agents"], operation_id="get_agent_by_name")
def get_agent_by_name(agent_name: str, db: Session = Depends(get_db)):
 """Retrieves a specific agent by its unique name."""
 # Instantiate AgentService
 agent_service = AgentService(db)
 db_agent = agent_service.get_agent_by_name(name=agent_name)
 if db_agent is None:
 raise HTTPException(status_code=404, detail="Agent not found")
 return db_agent

# --- Agent GetById/Update/Delete Endpoints ---
# Added GET by ID for consistency


@router.get("/id/{agent_id}", response_model=Agent, summary="Get Agent by ID", tags=["Agents"], operation_id="get_agent_by_id")
def get_agent_by_id_endpoint(agent_id: str, db: Session = Depends(get_db)):
 # Instantiate AgentService
 agent_service = AgentService(db)
 db_agent = agent_service.get_agent(agent_id=agent_id)
 if db_agent is None:
 raise HTTPException(status_code=404, detail="Agent not found")
 return db_agent


@router.put("/{agent_id}", response_model=Agent, summary="Update Agent", tags=["Agents"], operation_id="update_agent_by_id")
def update_agent(agent_id: str, agent_update: AgentUpdate, db: Session = Depends(get_db)):
 # Instantiate AgentService
 agent_service = AgentService(db)
 try:
 db_agent = agent_service.update_agent(
 agent_id=agent_id, agent_update=agent_update)
 if db_agent is None:
 raise HTTPException(status_code=404, detail="Agent not found")
 return db_agent
 except Exception as e:
 print(f"Error updating agent {agent_id}: {e}")
 raise HTTPException(
 status_code=500, detail=f"Failed to update agent: {str(e)}")


@router.delete("/{agent_id}", response_model=Agent, summary="Delete Agent", tags=["Agents"], operation_id="delete_agent_by_id")
def delete_agent(agent_id: str, db: Session = Depends(get_db)):
 # Instantiate AgentService
 agent_service = AgentService(db)
 db_agent = agent_service.delete_agent(agent_id=agent_id)
 if db_agent is None:
 raise HTTPException(status_code=404, detail="Agent not found")
 return db_agent

# --- Archive Endpoints ---
# Note: Assuming the Agent model has is_archived field, as queried in get_agent_list


@router.post("/{agent_id}/archive", response_model=Agent, summary="Archive Agent", tags=["Agents"], operation_id="archive_agent")
def archive_agent_endpoint(agent_id: str, db: Session = Depends(get_db)):
 # Instantiate AgentService
 agent_service = AgentService(db)
 try:
 archived_agent = agent_service.archive_agent(agent_id=agent_id)
 if archived_agent is None:
 raise HTTPException(status_code=404, detail="Agent not found")
 return archived_agent
 except HTTPException as e:
 raise e
 except Exception as e:
 print(f"Error archiving agent {agent_id}: {e}")
 raise HTTPException(
 status_code=500, detail=f"Could not archive agent: {str(e)}")


@router.post("/{agent_id}/unarchive", response_model=Agent, summary="Unarchive Agent", tags=["Agents"], operation_id="unarchive_agent")
def unarchive_agent_endpoint(agent_id: str, db: Session = Depends(get_db)):
 # Instantiate AgentService
 agent_service = AgentService(db)
 try:
 unarchived_agent = agent_service.unarchive_agent(agent_id=agent_id)
 if unarchived_agent is None:
 raise HTTPException(status_code=404, detail="Agent not found")
 return unarchived_agent
 except HTTPException as e:
 raise e
 except Exception as e:
 print(f"Error unarchiving agent {agent_id}: {e}")
 raise HTTPException(
 status_code=500, detail=f"Could not unarchive agent: {str(e)}")

# --- Agent Role Management ---
# Note: If roles can be assigned to agents, endpoints can be added here
# @router.post("/{agent_id}/roles/", response_model=AgentRole, ...)
# @router.get("/{agent_id}/roles/", response_model=List[AgentRole], ...)
# @router.delete("/{agent_id}/roles/{role_id}", ...)

# --- Agent Capabilities and Rules ---
# These would be managed through separate endpoints if they are complex entities
# Or could be included as part of the AgentUpdate schema if they are simple fields

# --- Advanced Features ---
# Task assignment to agents might be handled in the Tasks router
# Communication/messaging between agents could be separate endpoints
# Agent performance metrics could be tracked separately
