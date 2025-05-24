# Task ID: rules_framework_implementation
# Agent Role: ImplementationSpecialist  
# Request ID: rules_integration
# Project: task-manager
# Timestamp: 2025-05-23T15:30:00Z

"""
API Router for Rules Framework
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from ..database import get_db
from ..crud import rules as crud_rules
# from ..schemas import (
#     AgentPromptTemplate, AgentPromptTemplateCreate, AgentPromptTemplateUpdate,
#     AgentRuleViolation, AgentRuleViolationCreate,
#     AgentBehaviorLog, AgentBehaviorLogCreate,
#     Workflow, WorkflowCreate, WorkflowUpdate
# ) # Removed broad import

# Import schemas directly
from backend.schemas.agent_prompt_template import AgentPromptTemplate, AgentPromptTemplateCreate, AgentPromptTemplateUpdate
from backend.schemas.agent_rule_violation import AgentRuleViolation, AgentRuleViolationCreate
from backend.schemas.agent_behavior_log import AgentBehaviorLog, AgentBehaviorLogCreate
from backend.schemas.workflow import Workflow, WorkflowCreate, WorkflowUpdate
from backend.schemas.universal_mandate import UniversalMandate, UniversalMandateCreate, UniversalMandateUpdate
from backend.schemas.agent_role import AgentRole, AgentRoleCreate, AgentRoleUpdate

router = APIRouter(prefix="/rules", tags=["rules"])

# Universal Mandates Endpoints
@router.get("/mandates", response_model=List[UniversalMandate])
def get_mandates(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all universal mandates"""
    return crud_rules.get_universal_mandates(db, active_only=active_only)

@router.post("/mandates", response_model=UniversalMandate)
def create_mandate(
    mandate: UniversalMandateCreate,
    db: Session = Depends(get_db)
):
    """Create a new universal mandate"""
    return crud_rules.create_universal_mandate(db, mandate)

@router.put("/mandates/{mandate_id}", response_model=UniversalMandate)
def update_mandate(
    mandate_id: str,
    mandate_update: UniversalMandateUpdate,
    db: Session = Depends(get_db)
):
    """Update a universal mandate"""
    result = crud_rules.update_universal_mandate(db, mandate_id, mandate_update)
    if not result:
        raise HTTPException(status_code=404, detail="Mandate not found")
    return result

# Agent Roles Endpoints
@router.get("/agent-roles", response_model=List[AgentRole])
def get_agent_roles(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all agent roles"""
    return crud_rules.get_agent_roles(db, active_only=active_only)

@router.get("/agent-roles/{agent_name}", response_model=AgentRole)
def get_agent_role(
    agent_name: str,
    db: Session = Depends(get_db)
):
    """Get agent role by name with all details"""
    role = crud_rules.get_agent_role_with_details(db, agent_name)
    if not role:
        raise HTTPException(status_code=404, detail=f"Agent role not found: {agent_name}")
    return role

@router.post("/agent-roles", response_model=AgentRole)
def create_agent_role(
    role: AgentRoleCreate,
    db: Session = Depends(get_db)
):
    """Create a new agent role"""
    return crud_rules.create_agent_role(db, role)

@router.put("/agent-roles/{role_id}", response_model=AgentRole)
def update_agent_role(
    role_id: str,
    role_update: AgentRoleUpdate,
    db: Session = Depends(get_db)
):
    """Update an agent role"""
    result = crud_rules.update_agent_role(db, role_id, role_update)
    if not result:
        raise HTTPException(status_code=404, detail="Agent role not found")
    return result

# Agent Capabilities
@router.post("/agent-roles/{agent_role_id}/capabilities")
def add_capability(
    agent_role_id: str,
    capability: str,
    description: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Add a capability to an agent role"""
    return crud_rules.add_agent_capability(db, agent_role_id, capability, description)

@router.delete("/capabilities/{capability_id}")
def remove_capability(
    capability_id: str,
    db: Session = Depends(get_db)
):
    """Remove an agent capability"""
    success = crud_rules.remove_agent_capability(db, capability_id)
    if not success:
        raise HTTPException(status_code=404, detail="Capability not found")
    return {"message": "Capability removed successfully"}

# Agent Forbidden Actions
@router.post("/agent-roles/{agent_role_id}/forbidden-actions")
def add_forbidden_action(
    agent_role_id: str,
    action: str,
    reason: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Add a forbidden action to an agent role"""
    return crud_rules.add_forbidden_action(db, agent_role_id, action, reason)

@router.delete("/forbidden-actions/{action_id}")
def remove_forbidden_action(
    action_id: str,
    db: Session = Depends(get_db)
):
    """Remove a forbidden action"""
    success = crud_rules.remove_forbidden_action(db, action_id)
    if not success:
        raise HTTPException(status_code=404, detail="Forbidden action not found")
    return {"message": "Forbidden action removed successfully"}

# Prompt Templates
@router.get("/agent-roles/{agent_name}/prompt-template", response_model=AgentPromptTemplate)
def get_prompt_template(
    agent_name: str,
    template_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get prompt template for an agent"""
    template = crud_rules.get_agent_prompt_template(db, agent_name, template_name)
    if not template:
        raise HTTPException(status_code=404, detail="Prompt template not found")
    return template

@router.post("/prompt-templates", response_model=AgentPromptTemplate)
def create_prompt_template(
    template: AgentPromptTemplateCreate,
    db: Session = Depends(get_db)
):
    """Create a new prompt template"""
    return crud_rules.create_agent_prompt_template(db, template)

@router.put("/prompt-templates/{template_id}", response_model=AgentPromptTemplate)
def update_prompt_template(
    template_id: str,
    template_update: AgentPromptTemplateUpdate,
    db: Session = Depends(get_db)
):
    """Update a prompt template"""
    result = crud_rules.update_agent_prompt_template(db, template_id, template_update)
    if not result:
        raise HTTPException(status_code=404, detail="Prompt template not found")
    return result

# Rule Violations
@router.get("/violations", response_model=List[AgentRuleViolation])
def get_rule_violations(
    agent_name: Optional[str] = None,
    resolved: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get rule violations with optional filters"""
    return crud_rules.get_rule_violations(db, agent_name, resolved)

@router.post("/violations", response_model=AgentRuleViolation)
def log_violation(
    violation: AgentRuleViolationCreate,
    db: Session = Depends(get_db)
):
    """Log a rule violation"""
    return crud_rules.log_rule_violation(db, violation)

@router.put("/violations/{violation_id}/resolve")
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

# Behavior Logs
@router.get("/behavior-logs", response_model=List[AgentBehaviorLog])
def get_behavior_logs(
    agent_name: Optional[str] = None,
    task_project_id: Optional[str] = None,
    task_number: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get agent behavior logs"""
    return crud_rules.get_agent_behavior_logs(db, agent_name, task_project_id, task_number, limit)

@router.post("/behavior-logs", response_model=AgentBehaviorLog)
def log_behavior(
    behavior_log: AgentBehaviorLogCreate,
    db: Session = Depends(get_db)
):
    """Log agent behavior"""
    return crud_rules.log_agent_behavior(db, behavior_log)

# Workflows
@router.get("/workflows", response_model=List[Workflow])
def get_workflows(
    workflow_type: Optional[str] = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get workflows"""
    return crud_rules.get_workflows(db, workflow_type, active_only)

@router.get("/workflows/{workflow_id}", response_model=Workflow)
def get_workflow(
    workflow_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific workflow with steps"""
    workflow = crud_rules.get_workflow(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.post("/workflows", response_model=Workflow)
def create_workflow(
    workflow: WorkflowCreate,
    db: Session = Depends(get_db)
):
    """Create a new workflow"""
    return crud_rules.create_workflow(db, workflow)

# Validation and Prompt Generation
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
