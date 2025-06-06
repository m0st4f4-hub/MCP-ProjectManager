from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ....database import get_sync_db as get_db
from ....crud import rules as crud_rules
from ....schemas.agent_rule_violation import AgentRuleViolation, AgentRuleViolationCreate

router = APIRouter()  # Rule Violations

@router.get("/", response_model=List[AgentRuleViolation])
def get_rule_violations(
    agent_name: Optional[str] = None,
    resolved: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get rule violations with optional filters"""
    return crud_rules.get_rule_violations(db, agent_name, resolved)

@router.post("/", response_model=AgentRuleViolation)
def log_violation(
    violation: AgentRuleViolationCreate,
    db: Session = Depends(get_db)
):
    """Log a rule violation"""
    return crud_rules.log_rule_violation(db, violation)

@router.put("/{violation_id}/resolve")
def resolve_violation(
    violation_id: str,
    resolution_notes: str,
    db: Session = Depends(get_db)
):
    """Mark a rule violation as resolved"""
    result = crud_rules.resolve_rule_violation(db, violation_id, resolution_notes)
    if not result:
        raise HTTPException(status_code=404, detail="Violation not found")
    return result
