from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ...database import get_sync_db as get_db
from ...crud import rules as crud_rules
from ...schemas.agent_role import AgentRole, AgentRoleCreate, AgentRoleUpdate

router = APIRouter()  # Agent Roles Endpoints
@router.get("/", response_model=List[AgentRole])


def get_agent_roles(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all agent roles"""
    return crud_rules.get_agent_roles(db, active_only=active_only)

@router.get("/{agent_name}", response_model=AgentRole)


def get_agent_role(
    agent_name: str,
    db: Session = Depends(get_db)
):
    """Get agent role by name with all details"""
    role = crud_rules.get_agent_role_with_details(db, agent_name)
    if not role:
    raise HTTPException(status_code=404, detail=f"Agent role not found: {agent_name}")
    return role

@router.post("/", response_model=AgentRole)


def create_agent_role(
    role: AgentRoleCreate,
    db: Session = Depends(get_db)
):
    """Create a new agent role"""
    return crud_rules.create_agent_role(db, role)

@router.put("/{role_id}", response_model=AgentRole)


def update_agent_role(
    role_id: str,
    role_update: AgentRoleUpdate,
    db: Session = Depends(get_db)
):
    """Update an agent role"""
    result = crud_rules.update_agent_role(db, role_id, role_update)
    if not result:
    raise HTTPException(status_code=404, detail="Agent role not found")
    return result
