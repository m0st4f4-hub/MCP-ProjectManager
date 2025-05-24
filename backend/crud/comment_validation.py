# Placeholder for comment-related validation logic. 

from sqlalchemy.orm import Session
from backend.crud.tasks import get_task_by_project_and_number # Import the correct function
from backend.crud.projects import get_project # Assuming a get_project in projects crud
from backend.crud.users import get_user # Assuming a get_user in users crud
from backend.crud.agents import get_agent # Import get_agent
from typing import Union
import uuid

def task_exists(db: Session, task_project_id: Union[str, uuid.UUID], task_number: int) -> bool:
    """
    Returns True if the task exists.
    """
    # Use get_task_by_project_and_number with correct arguments
    return get_task_by_project_and_number(db, project_id=str(task_project_id), task_number=task_number) is not None

def project_exists(db: Session, project_id: str) -> bool:
    """
    Returns True if the project exists.
    """
    # Assuming get_project takes db and project_id
    return get_project(db, project_id) is not None

def author_exists(db: Session, author_id: str) -> bool:
    """
    Returns True if the author (user or agent) exists.
    """
    # Check if author_id corresponds to a user or an agent
    return get_user(db, user_id=author_id) is not None or get_agent(db, agent_id=author_id) is not None 