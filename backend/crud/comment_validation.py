# Placeholder for comment-related validation logic. 

# from sqlalchemy.orm import Session # Remove synchronous Session import
from backend.crud.tasks import get_task_by_project_and_number # Import the correct function
from backend.crud.projects import get_project # Assuming a get_project in projects crud
from backend.crud.users import get_user # Assuming a get_user in users crud
from backend.crud.agents import get_agent # Import get_agent
from typing import Union
import uuid

# Import AsyncSession for async operations
from sqlalchemy.ext.asyncio import AsyncSession

# Convert to async function and use AsyncSession
async def task_exists(db: AsyncSession, task_project_id: Union[str, uuid.UUID], task_number: int) -> bool:
 """
 Returns True if the task exists.
 """
 # Use get_task_by_project_and_number with correct arguments and await it
 task = await get_task_by_project_and_number(db, project_id=str(task_project_id), task_number=task_number)
 return task is not None

# Convert to async function and use AsyncSession
async def project_exists(db: AsyncSession, project_id: str) -> bool:
 """
 Returns True if the project exists.
 """
 # Assuming get_project takes db and project_id and await it
 project = await get_project(db, project_id)
 return project is not None

# Convert to async function and use AsyncSession
async def author_exists(db: AsyncSession, author_id: str) -> bool:
 """
 Returns True if the author (user or agent) exists.
 """
 # Check if author_id corresponds to a user or an agent and await the calls
 user = await get_user(db, user_id=author_id)
 if user: return True
 agent = await get_agent(db, agent_id=author_id)
 return agent is not None 