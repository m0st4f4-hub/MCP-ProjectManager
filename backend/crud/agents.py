from sqlalchemy.orm import Session
from .. import models
from typing import List, Optional
import uuid

# from .. import schemas # Removed package import
from backend.schemas.agent import AgentCreate, AgentUpdate


def create_agent(db: Session, agent: AgentCreate) -> models.Agent:
    """Create a new agent."""
    # Check if an agent with the same name already exists
    existing_agent = get_agent_by_name(db, agent.name)
    if existing_agent:
        raise ValueError(f"Agent with name '{agent.name}' already exists")

    db_agent = models.Agent(
        id=str(uuid.uuid4()),
        name=agent.name
    )
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent


def get_agent(db: Session, agent_id: str) -> Optional[models.Agent]:
    """Get a single agent by ID."""
    return db.query(models.Agent).filter(models.Agent.id == agent_id).first()


def get_agent_by_name(db: Session, name: str) -> Optional[models.Agent]:
    """Get a single agent by name."""
    return db.query(models.Agent).filter(models.Agent.name == name).first()


def get_agents(db: Session, skip: int = 0, limit: int = 100) -> List[models.Agent]:
    """Get multiple agents with skip and limit."""
    return db.query(models.Agent).offset(skip).limit(limit).all()


def update_agent(db: Session, agent_id: str, agent_update: AgentUpdate) -> Optional[models.Agent]:
    """Update an agent."""
    db_agent = get_agent(db, agent_id)
    if db_agent:
        # Check for duplicate name if name is being updated
        if agent_update.name is not None and agent_update.name != db_agent.name:
            existing_agent_with_name = get_agent_by_name(db, agent_update.name)
            if existing_agent_with_name and existing_agent_with_name.id != agent_id:
                 raise ValueError(f"Agent with name '{agent_update.name}' already exists for another agent")

        if agent_update.name is not None:
            db_agent.name = agent_update.name
        db.commit()
        db.refresh(db_agent)
    return db_agent


def delete_agent(db: Session, agent_id: str) -> Optional[models.Agent]:
    """Delete an agent."""
    db_agent = get_agent(db, agent_id)
    if db_agent:
        db.delete(db_agent)
        db.commit()
    return db_agent
