from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional

from ....database import get_sync_db as get_db
from ....services.agent_service import AgentService
from ....schemas.agent import Agent, AgentCreate, AgentUpdate
from ....schemas.api_responses import DataResponse

def get_agent_service(db: Session = Depends(get_db)) -> AgentService:
    """Dependency that provides an AgentService instance."""
    return AgentService(db)

router = APIRouter(
    prefix="/agents",  # Assuming this sub-router will be mounted at /agents
    tags=["Agents"],
)

@router.post("/", response_model=Agent, summary="Create Agent", operation_id="create_agent")


def create_agent(agent: AgentCreate, db: Session = Depends(get_db)):
    """Registers a new agent.
    - **name**: Unique name for the agent (required).
    """  # Instantiate AgentService
    agent_service = AgentService(db)

    db_agent = agent_service.get_agent_by_name(name=agent.name)
    if db_agent:
        raise HTTPException(
            status_code=400, detail="Agent name already registered")
    return agent_service.create_agent(agent=agent)

@router.get("/", response_model=DataResponse[List[Agent]], summary="Get Agents", operation_id="get_agents")
async def get_agent_list(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[str] = None,
    is_archived: Optional[bool] = Query(
        False, description="Filter by archived status. False for non-archived,"
            "True for archived, null/None for all."),
    db: Session = Depends(get_db)
):
    """Retrieves a list of registered agents with optional filtering and pagination."""
    agent_service = AgentService(db)
    agents = agent_service.get_agents(
        skip=skip,
        limit=limit,
        search=search,
        status=status,
        is_archived=is_archived
    )
    return DataResponse[List[Agent]](data=agents, message="Agents retrieved successfully")

@router.get("/{agent_name}", response_model=Agent, summary="Get Agent by Name", tags=["Agents"], operation_id="get_agent_by_name")


def get_agent_by_name(agent_name: str, db: Session = Depends(get_db)):
    """Retrieves a specific agent by its unique name."""  # Instantiate AgentService
    agent_service = AgentService(db)
    db_agent = agent_service.get_agent_by_name(name=agent_name)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent

@router.get("/id/{agent_id}", response_model=Agent, summary="Get Agent by ID", tags=["Agents"], operation_id="get_agent_by_id")


def get_agent_by_id_endpoint(agent_id: str, db: Session = Depends(get_db)):  # Instantiate AgentService
    agent_service = AgentService(db)
    db_agent = agent_service.get_agent(agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent

@router.put("/{agent_id}", response_model=Agent, summary="Update Agent", tags=["Agents"], operation_id="update_agent_by_id")


def update_agent(agent_id: str, agent_update: AgentUpdate, db: Session = Depends(get_db)):  # Instantiate AgentService
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


def delete_agent(agent_id: str, db: Session = Depends(get_db)):  # Instantiate AgentService
    agent_service = AgentService(db)
    db_agent = agent_service.delete_agent(agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent

@router.post("/{agent_id}/archive", response_model=Agent, summary="Archive Agent", tags=["Agents"], operation_id="archive_agent")


def archive_agent_endpoint(agent_id: str, db: Session = Depends(get_db)):  # Instantiate AgentService
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


def unarchive_agent_endpoint(agent_id: str, db: Session = Depends(get_db)):  # Instantiate AgentService
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
