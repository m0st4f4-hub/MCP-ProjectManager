from sqlalchemy.orm import Session
from .. import models
from typing import List, Optional
import uuid

# from .. import schemas # Removed package import
from backend.schemas.agent import AgentCreate, AgentUpdate

# Import async equivalents and necessary functions
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

# Convert to async function and use AsyncSession
async def create_agent(db: AsyncSession, agent: AgentCreate) -> models.Agent:
 """Create a new agent."""
 # Check if an agent with the same name already exists
 existing_agent = await get_agent_by_name(db, agent.name)
 if existing_agent:
 raise ValueError(f"Agent with name '{agent.name}' already exists")

 db_agent = models.Agent(
 id=str(uuid.uuid4()),
 name=agent.name
 )
 db.add(db_agent)
 await db.commit()
 await db.refresh(db_agent)
 return db_agent

# Convert to async function and use AsyncSession
async def get_agent(db: AsyncSession, agent_id: str) -> Optional[models.Agent]:
 """Get a single agent by ID."""
 result = await db.execute(select(models.Agent).filter(models.Agent.id == agent_id))
 return result.scalar_one_or_none()

# Convert to async function and use AsyncSession
async def get_agent_by_name(db: AsyncSession, name: str) -> Optional[models.Agent]:
 """Get a single agent by name."""
 result = await db.execute(select(models.Agent).filter(models.Agent.name == name))
 return result.scalar_one_or_none()

# Convert to async function and use AsyncSession
async def get_agents(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[models.Agent]:
 """Get multiple agents with skip and limit."""
 result = await db.execute(select(models.Agent).offset(skip).limit(limit))
 return result.scalars().all()

# Convert to async function and use AsyncSession
async def update_agent(db: AsyncSession, agent_id: str, agent_update: AgentUpdate) -> Optional[models.Agent]:
 """Update an agent."""
 db_agent = await get_agent(db, agent_id)
 if db_agent:
 # Check for duplicate name if name is being updated
 if agent_update.name is not None and agent_update.name != db_agent.name:
 existing_agent_with_name = await get_agent_by_name(db, agent_update.name)
 if existing_agent_with_name and existing_agent_with_name.id != agent_id:
 raise ValueError(f"Agent with name '{agent_update.name}' already exists for another agent")

 if agent_update.name is not None:
 db_agent.name = agent_update.name
 await db.commit()
 await db.refresh(db_agent)
 return db_agent

# Convert to async function and use AsyncSession
async def delete_agent(db: AsyncSession, agent_id: str) -> Optional[models.Agent]:
 """Delete an agent."""
 db_agent = await get_agent(db, agent_id)
 if db_agent:
 await db.delete(db_agent)
 await db.commit()
 return db_agent
