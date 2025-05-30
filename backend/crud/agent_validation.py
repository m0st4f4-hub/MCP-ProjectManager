from sqlalchemy.orm import Session
from backend.crud.agents import get_agent_by_name
from typing import Optional

def agent_name_exists(db: Session, name: str, exclude_agent_id: Optional[str] = None) -> bool:
 """
 Checks if an agent with the given name already exists.
 If exclude_agent_id is provided, it excludes the agent with that ID from the check.
 """
 agent = get_agent_by_name(db, name)
 if agent and (exclude_agent_id is None or agent.id != exclude_agent_id):
 return True
 return False 