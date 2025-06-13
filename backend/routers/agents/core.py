from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List, Optional

from database import get_db
from services.agent_service import AgentService
from schemas.agent import Agent, AgentCreate, AgentUpdate
from schemas.api_responses import DataResponse, ListResponse, PaginationParams

async def get_agent_service(db: Annotated[AsyncSession, Depends(get_db)]) -> AgentService:
    """Dependency that provides an AgentService instance."""
    return AgentService(db)

router = APIRouter(
    prefix="/agents",  # Assuming this sub-router will be mounted at /agents
    tags=["Agents"],
)

@router.post("/", response_model=DataResponse[Agent], summary="Create Agent", operation_id="create_agent")
async def create_agent(
    agent: AgentCreate, 
    agent_service: Annotated[AgentService, Depends(get_agent_service)]
):
    """Registers a new agent.
    - **name**: Unique name for the agent (required).
    """
    db_agent = await agent_service.get_agent_by_name(name=agent.name)
    if db_agent:
        raise HTTPException(
            status_code=400, detail="Agent name already registered")
    
    created_agent = await agent_service.create_agent(agent=agent)
    return DataResponse[Agent](data=created_agent, message="Agent created successfully")

@router.get("/", response_model=ListResponse[Agent], summary="Get Agents", operation_id="get_agents")
async def get_agent_list(
    pagination: Annotated[PaginationParams, Depends()],
    search: Annotated[Optional[str], Query(None, description="Search term for agent names and descriptions")],
    status: Annotated[Optional[str], Query(None, description="Filter by agent status")],
    is_archived: Annotated[Optional[bool], Query(None, description="Filter by archived status")],
    sort_by: Annotated[Optional[str], Query("created_at", description="Field to sort by")],
    sort_direction: Annotated[Optional[str], Query("desc", description="Sort direction: asc or desc")],
    agent_service: Annotated[AgentService, Depends(get_agent_service)]
):
    """Retrieves a list of registered agents with optional filtering and pagination."""
    try:
        agents, total_count = await agent_service.get_agents(
            skip=pagination.offset,
            limit=pagination.page_size,
            search=search,
            status=status,
            is_archived=is_archived,
            sort_by=sort_by,
            sort_direction=sort_direction
        )
        
        return ListResponse[Agent](
            data=agents,
            total=total_count,
            page=pagination.page,
            page_size=pagination.page_size,
            has_more=(pagination.offset + len(agents)) < total_count,
            message="Agents retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving agents: {e}")

@router.get("/{agent_name}", response_model=DataResponse[Agent], summary="Get Agent by Name", tags=["Agents"], operation_id="get_agent_by_name")
async def get_agent_by_name(
    agent_name: Annotated[str, Path(description="Name of the agent to retrieve")], 
    agent_service: Annotated[AgentService, Depends(get_agent_service)]
):
    """Retrieves a specific agent by its unique name."""
    db_agent = await agent_service.get_agent_by_name(name=agent_name)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return DataResponse[Agent](data=db_agent, message="Agent retrieved successfully")

@router.get("/id/{agent_id}", response_model=DataResponse[Agent], summary="Get Agent by ID", tags=["Agents"], operation_id="get_agent_by_id")
async def get_agent_by_id_endpoint(
    agent_id: Annotated[str, Path(description="ID of the agent to retrieve")], 
    agent_service: Annotated[AgentService, Depends(get_agent_service)]
):
    """Get agent by ID"""
    db_agent = await agent_service.get_agent(agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return DataResponse[Agent](data=db_agent, message="Agent retrieved successfully")

@router.put("/{agent_id}", response_model=DataResponse[Agent], summary="Update Agent", tags=["Agents"], operation_id="update_agent_by_id")
async def update_agent(
    agent_id: Annotated[str, Path(description="ID of the agent to update")], 
    agent_update: AgentUpdate, 
    agent_service: Annotated[AgentService, Depends(get_agent_service)]
):
    """Update agent"""
    try:
        db_agent = await agent_service.update_agent(
            agent_id=agent_id, agent_update=agent_update)
        if db_agent is None:
            raise HTTPException(status_code=404, detail="Agent not found")
        return DataResponse[Agent](data=db_agent, message="Agent updated successfully")
    except Exception as e:
        print(f"Error updating agent {agent_id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to update agent: {str(e)}")

@router.delete("/{agent_id}", response_model=DataResponse[Agent], summary="Delete Agent", tags=["Agents"], operation_id="delete_agent_by_id")
async def delete_agent(
    agent_id: Annotated[str, Path(description="ID of the agent to delete")], 
    agent_service: Annotated[AgentService, Depends(get_agent_service)]
):
    """Delete agent"""
    db_agent = await agent_service.delete_agent(agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return DataResponse[Agent](data=db_agent, message="Agent deleted successfully")

@router.post("/{agent_id}/archive", response_model=DataResponse[Agent], summary="Archive Agent", tags=["Agents"], operation_id="archive_agent")
async def archive_agent_endpoint(
    agent_id: Annotated[str, Path(description="ID of the agent to archive")], 
    agent_service: Annotated[AgentService, Depends(get_agent_service)]
):
    """Archive agent"""
    try:
        archived_agent = await agent_service.archive_agent(agent_id=agent_id)
        if archived_agent is None:
            raise HTTPException(status_code=404, detail="Agent not found")
        return DataResponse[Agent](data=archived_agent, message="Agent archived successfully")
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error archiving agent {agent_id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Could not archive agent: {str(e)}")

@router.post("/{agent_id}/unarchive", response_model=DataResponse[Agent], summary="Unarchive Agent", tags=["Agents"], operation_id="unarchive_agent")
async def unarchive_agent_endpoint(
    agent_id: Annotated[str, Path(description="ID of the agent to unarchive")], 
    agent_service: Annotated[AgentService, Depends(get_agent_service)]
):
    """Unarchive agent"""
    try:
        unarchived_agent = await agent_service.unarchive_agent(agent_id=agent_id)
        if unarchived_agent is None:
            raise HTTPException(status_code=404, detail="Agent not found")
        return DataResponse[Agent](data=unarchived_agent, message="Agent unarchived successfully")
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error unarchiving agent {agent_id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Could not unarchive agent: {str(e)}")
