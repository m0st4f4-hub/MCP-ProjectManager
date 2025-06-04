from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from ...database import get_db
from ...crud import rules as crud_rules

router = APIRouter()  # Validation and Prompt Generation
@router.post("/validate-task")


def validate_task(
    agent_name: str,
    task_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Validate a task against agent rules"""
    violations = crud_rules.validate_task_against_agent_rules(db, agent_name, task_data)
    return {
    "agent_name": agent_name,
    "violations": violations,
    "is_valid": len(violations) == 0
    }

@router.get("/generate-prompt/{agent_name}")


def generate_prompt(
    agent_name: str,
    db: Session = Depends(get_db)
):
    """Generate a rules-based prompt for an agent"""
    prompt = crud_rules.generate_agent_prompt_from_rules(db, agent_name)
    return {
    "agent_name": agent_name,
    "prompt": prompt
    }
