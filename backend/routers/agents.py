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

# from .. import schemas  # Removed broad import
# Import Agent schemas directly
from backend.schemas.agent import Agent, AgentCreate, AgentUpdate # Added direct imports
# from backend.schemas.agent_rule import AgentRule # Removed incorrect import for AgentRule
from backend.schemas.agent_role import AgentRole # Added import for AgentRole

# Import AgentService from the service layer
from ..services.agent_service import AgentService
from ..crud import agents as crud_agents
from ..database import get_db  # Import database dependency


def get_agent_service(db: Session = Depends(get_db)) -> AgentService:
    """Dependency that provides an AgentService instance."""
    return AgentService(db)


router = APIRouter(
    prefix="/agents",
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
    search: Optional[str] = None,  # Added search parameter
    # Added status parameter (though Agent model doesn't have status yet)
    status: Optional[str] = None,
    is_archived: Optional[bool] = Query(
        False, description="Filter by archived status. False for non-archived, True for archived, null/None for all."),  # ADDED
    db: Session = Depends(get_db)  # ADDED db session dependency
):
    """Retrieves a list of registered agents with optional filtering."""
    # Instantiate AgentService
    agent_service = AgentService(db)
    agents = agent_service.get_agents(
        search=search, status=status, is_archived=is_archived)  # Pass new params
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
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Unexpected error in PUT /agents/{agent_id}: {e}")
        # Check if the exception wraps an HTTPException
        if isinstance(e.__cause__, HTTPException) or isinstance(e.args[0], HTTPException):
            http_exc = e.__cause__ if isinstance(
                e.__cause__, HTTPException) else e.args[0]
            raise http_exc
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {e}")


@router.delete("/{agent_id}", response_model=Agent, summary="Delete Agent", tags=["Agents"], operation_id="delete_agent_by_id")
def delete_agent(agent_id: str, db: Session = Depends(get_db)):
    # Instantiate AgentService
    agent_service = AgentService(db)
    db_agent = agent_service.delete_agent(agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent  # Return the deleted object


@router.post("/{agent_id}/archive", response_model=Agent, summary="Archive Agent", tags=["Agents"], operation_id="archive_agent")
def archive_agent_endpoint(
    agent_id: str,
    # Assuming get_agent_service provides an AgentService instance
    agent_service: AgentService = Depends(get_agent_service)
):
    """Archives an agent."""
    try:
        # Note: The dependency injection for agent_service here is different from other endpoints.
        # Consider aligning this pattern if possible, or ensure get_agent_service is correctly implemented.
        archived_agent = agent_service.archive_agent(agent_id)
        if archived_agent is None:
            raise HTTPException(status_code=404, detail="Agent not found")
        return archived_agent
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error archiving agent {agent_id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to archive agent: {str(e)}")


@router.post("/{agent_id}/unarchive", response_model=Agent, summary="Unarchive Agent", tags=["Agents"], operation_id="unarchive_agent")
def unarchive_agent_endpoint(
    agent_id: str,
    # Assuming get_agent_service provides an AgentService instance
    agent_service: AgentService = Depends(get_agent_service)
):
    """Unarchives an agent."""
    try:
        # Note: The dependency injection for agent_service here is different from other endpoints.
        # Consider aligning this pattern if possible, or ensure get_agent_service is correctly implemented.
        unarchived_agent = agent_service.unarchive_agent(agent_id)
        if unarchived_agent is None:
            raise HTTPException(status_code=404, detail="Agent not found")
        return unarchived_agent
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error unarchiving agent {agent_id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to unarchive agent: {str(e)}")

# --- Agent Rule Endpoints ---


@router.post("/{agent_id}/rules/", response_model=AgentRole, summary="Add Rule to Agent", tags=["Agent Rules"], operation_id="add_rule_to_agent")
def add_rule_to_agent_endpoint(
    agent_id: str,
    rule_id: str,  # Assuming rule_id is passed in the request body
    # Assuming get_agent_service provides an AgentService instance
    agent_service: AgentService = Depends(get_agent_service)
):
    """Adds a rule association to an agent."""
    # Note: The dependency injection for agent_service here is different from other endpoints.
    # Consider aligning this pattern if possible, or ensure get_agent_service is correctly implemented.
    # Note: The actual rule validation and existence check might happen in the service layer
    db_agent_rule = agent_service.add_rule_to_agent(
        agent_id=agent_id, rule_id=rule_id)
    if db_agent_rule is None:
        # This might indicate agent or rule not found, or rule already associated
        # Service layer should provide more specific error handling if needed
        raise HTTPException(
            status_code=400, detail="Could not add rule to agent or rule already exists")
    return db_agent_rule


@router.delete("/{agent_id}/rules/{rule_id}", response_model=dict, summary="Remove Rule from Agent", tags=["Agent Rules"], operation_id="remove_rule_from_agent")
def remove_rule_from_agent_endpoint(
    agent_id: str,
    rule_id: str,
    # Assuming get_agent_service provides an AgentService instance
    agent_service: AgentService = Depends(get_agent_service)
):
    """Removes a rule association from an agent."""
    # Note: The dependency injection for agent_service here is different from other endpoints.
    # Consider aligning this pattern if possible, or ensure get_agent_service is correctly implemented.
    success = agent_service.remove_rule_from_agent(
        agent_id=agent_id, rule_id=rule_id)
    if not success:
        raise HTTPException(
            status_code=404, detail="Agent rule association not found")
    return {"message": "Agent rule association removed successfully"}


@router.get("/{agent_id}/rules/", response_model=List[AgentRole], summary="Get Agent Rules", tags=["Agent Rules"], operation_id="get_agent_rules")
def get_agent_rules_endpoint(
    agent_id: str,
    # Assuming get_agent_service provides an AgentService instance
    agent_service: AgentService = Depends(get_agent_service)
):
    """Retrieves all rule associations for a specific agent."""
    # Note: The dependency injection for agent_service here is different from other endpoints.
    # Consider aligning this pattern if possible, or ensure get_agent_service is correctly implemented.
    # Check if agent exists before returning rules (optional, depending on desired behavior)
    # agent = agent_service.get_agent(agent_id)
    # if not agent:
    #    raise HTTPException(status_code=404, detail="Agent not found")

    return agent_service.get_agent_rules(agent_id=agent_id)

# TODO: Implement endpoints for agent rule content/details if needed
