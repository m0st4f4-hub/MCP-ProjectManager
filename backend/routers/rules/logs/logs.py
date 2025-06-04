from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from ...database import get_sync_db as get_db
from ...crud import rules as crud_rules
from ...schemas.agent_behavior_log import AgentBehaviorLog, AgentBehaviorLogCreate

router = APIRouter()  # Behavior Logs
@router.get("/", response_model=List[AgentBehaviorLog])


def get_behavior_logs(
    agent_name: Optional[str] = None,
    task_project_id: Optional[str] = None,
    task_number: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get agent behavior logs"""
    return crud_rules.get_agent_behavior_logs(db, agent_name, task_project_id, task_number, limit)

@router.post("/", response_model=AgentBehaviorLog)


def log_behavior(
    behavior_log: AgentBehaviorLogCreate,
    db: Session = Depends(get_db)
):
    """Log agent behavior"""
    return crud_rules.log_agent_behavior(db, behavior_log)
