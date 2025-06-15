from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.orm import Session
from typing import Annotated, List, Optional

from ....database import get_db
from ....crud import rules as crud_rules
from ....schemas.agent_rule_violation import AgentRuleViolation, AgentRuleViolationCreate
from ....schemas.api_responses import DataResponse, ListResponse

router = APIRouter(
    prefix="/violations",
    tags=["Rule Violations"]
)

@router.get(
    "/", 
    response_model=ListResponse[AgentRuleViolation],
    summary="Get Rule Violations",
    operation_id="get_rule_violations"
)
def get_rule_violations(
    db: Annotated[Session, Depends(get_db)],
    agent_name: Annotated[Optional[str], Query(description="Filter by agent name")] = None,
    resolved: Annotated[Optional[bool], Query(description="Filter by resolution status")] = None,
):
    """
    Get rule violations with optional filters.
    
    Returns a list of rule violations based on the specified filters.
    """
    violations = crud_rules.get_rule_violations(db, agent_name, resolved)
    return ListResponse(
        data=violations,
        total=len(violations),
        page=1,
        page_size=len(violations),
        has_more=False,
        message="Rule violations retrieved successfully"
    )

@router.post(
    "/", 
    response_model=DataResponse[AgentRuleViolation],
    status_code=status.HTTP_201_CREATED,
    summary="Log Rule Violation",
    operation_id="log_rule_violation"
)
def log_violation(
    violation: AgentRuleViolationCreate,
    db: Annotated[Session, Depends(get_db)]
):
    """
    Log a rule violation.
    
    - **agent_name**: Name of the agent that violated the rule
    - **rule_name**: Name of the rule that was violated
    - **violation_details**: Details about the violation
    - **severity**: Severity level of the violation
    """
    logged_violation = crud_rules.log_rule_violation(db, violation)
    return DataResponse(data=logged_violation, message="Rule violation logged successfully")

@router.put(
    "/{violation_id}/resolve",
    response_model=DataResponse[AgentRuleViolation],
    summary="Resolve Rule Violation",
    operation_id="resolve_rule_violation"
)
def resolve_violation(
    violation_id: Annotated[str, Path(description="ID of the violation to resolve")],
    resolution_notes: Annotated[str, Query(description="Notes about the resolution")],
    db: Annotated[Session, Depends(get_db)]
):
    """
    Mark a rule violation as resolved.
    
    Updates the violation status to resolved and adds resolution notes.
    """
    result = crud_rules.resolve_rule_violation(db, violation_id, resolution_notes)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Violation not found")
    return DataResponse(data=result, message="Rule violation resolved successfully")
