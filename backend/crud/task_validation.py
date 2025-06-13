from sqlalchemy.ext.asyncio import AsyncSession
from crud.projects import get_project  # Assuming a get_project in projects crud
from crud.agents import get_agent  # Assuming a get_agent in agents crud
from typing import Optional

async def project_exists(db: AsyncSession, project_id: str) -> bool:
    """
    Returns True if the project exists.
    """
    project = await get_project(db, project_id)
    return project is not None

async def agent_exists(db: AsyncSession, agent_id: str) -> bool:
    """
    Returns True if the agent exists.
    """
    agent = await get_agent(db, agent_id)
    return agent is not None
