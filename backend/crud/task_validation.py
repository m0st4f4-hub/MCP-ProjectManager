from sqlalchemy.orm import Session
from backend.crud.projects import get_project # Assuming a get_project in projects crud
from backend.crud.agents import get_agent # Assuming a get_agent in agents crud
from typing import Optional

def project_exists(db: Session, project_id: str) -> bool:
    """
    Returns True if the project exists.
    """
    return get_project(db, project_id) is not None

def agent_exists(db: Session, agent_id: str) -> bool:
    """
    Returns True if the agent exists.
    """
    return get_agent(db, agent_id) is not None 