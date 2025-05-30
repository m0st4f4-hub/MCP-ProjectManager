# Task ID: rules_framework_implementation
# Agent Role: ImplementationSpecialist 
# Request ID: rules_integration
# Project: task-manager
# Timestamp: 2025-05-23T15:30:00Z

"""
CRUD operations for the Rules Framework
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from typing import List, Optional, Dict, Any
from ..models import (
 UniversalMandate, AgentRole, AgentCapability, AgentForbiddenAction,
 AgentVerificationRequirement, AgentHandoffCriteria, AgentErrorProtocol,
 Workflow, WorkflowStep, AgentPromptTemplate, AgentRuleViolation,
 AgentBehaviorLog
)
from backend.schemas.universal_mandate import UniversalMandateCreate, UniversalMandateUpdate
from backend.schemas.agent_role import AgentRoleCreate, AgentRoleUpdate
from backend.schemas.workflow import WorkflowCreate, WorkflowUpdate
from backend.schemas.agent_prompt_template import AgentPromptTemplateCreate, AgentPromptTemplateUpdate
from backend.schemas.agent_rule_violation import AgentRuleViolationCreate
from backend.schemas.agent_behavior_log import AgentBehaviorLogCreate

# Universal Mandates CRUD
def get_universal_mandates(db: Session, active_only: bool = True) -> List[UniversalMandate]:
 """Get all universal mandates"""
 query = db.query(UniversalMandate)
 if active_only:
 query = query.filter(UniversalMandate.is_active == True)
 return query.order_by(UniversalMandate.priority.desc()).all()

def get_universal_mandate(db: Session, mandate_id: str) -> Optional[UniversalMandate]:
 """Get a specific universal mandate by ID"""
 return db.query(UniversalMandate).filter(UniversalMandate.id == mandate_id).first()

def create_universal_mandate(db: Session, mandate: UniversalMandateCreate) -> UniversalMandate:
 """Create a new universal mandate"""
 db_mandate = UniversalMandate(**mandate.model_dump())
 db.add(db_mandate)
 db.commit()
 db.refresh(db_mandate)
 return db_mandate

def update_universal_mandate(db: Session, mandate_id: str, mandate_update: UniversalMandateUpdate) -> Optional[UniversalMandate]:
 """Update a universal mandate"""
 db_mandate = get_universal_mandate(db, mandate_id)
 if not db_mandate:
 return None
 
 update_data = mandate_update.model_dump(exclude_unset=True)
 for field, value in update_data.items():
 setattr(db_mandate, field, value)
 
 db.commit()
 db.refresh(db_mandate)
 return db_mandate

# Agent Roles CRUD
def get_agent_roles(db: Session, active_only: bool = True) -> List[AgentRole]:
 """Get all agent roles"""
 query = db.query(AgentRole)
 if active_only:
 query = query.filter(AgentRole.is_active == True)
 return query.order_by(AgentRole.name).all()

def get_agent_role_by_name(db: Session, agent_name: str) -> Optional[AgentRole]:
 """Get agent role by name (matches Agent.name)"""
 return db.query(AgentRole).filter(AgentRole.name == agent_name).first()

def get_agent_role_with_details(db: Session, agent_name: str) -> Optional[AgentRole]:
 """Get agent role with all related details by name"""
 return db.query(AgentRole)\
 .options(
 joinedload(AgentRole.capabilities),
 joinedload(AgentRole.forbidden_actions),
 joinedload(AgentRole.verification_requirements),
 joinedload(AgentRole.handoff_criteria),
 joinedload(AgentRole.error_protocols)
 )\
 .filter(AgentRole.name == agent_name)\
 .first()

def create_agent_role(db: Session, role: AgentRoleCreate) -> AgentRole:
 """Create a new agent role"""
 db_role = AgentRole(**role.model_dump())
 db.add(db_role)
 db.commit()
 db.refresh(db_role)
 return db_role

def update_agent_role(db: Session, role_id: str, role_update: AgentRoleUpdate) -> Optional[AgentRole]:
 """Update an agent role"""
 db_role = db.query(AgentRole).filter(AgentRole.id == role_id).first()
 if not db_role:
 return None
 
 update_data = role_update.model_dump(exclude_unset=True)
 for field, value in update_data.items():
 setattr(db_role, field, value)
 
 db.commit()
 db.refresh(db_role)
 return db_role

# Agent Capabilities
def add_agent_capability(db: Session, agent_role_id: str, capability: str, description: str = None) -> AgentCapability:
 """Add a capability to an agent role"""
 db_capability = AgentCapability(
 agent_role_id=agent_role_id,
 capability=capability,
 description=description
 )
 db.add(db_capability)
 db.commit()
 db.refresh(db_capability)
 return db_capability

def remove_agent_capability(db: Session, capability_id: str) -> bool:
 """Remove an agent capability"""
 db_capability = db.query(AgentCapability).filter(AgentCapability.id == capability_id).first()
 if db_capability:
 db.delete(db_capability)
 db.commit()
 return True
 return False

# Agent Forbidden Actions
def add_forbidden_action(db: Session, agent_role_id: str, action: str, reason: str = None) -> AgentForbiddenAction:
 """Add a forbidden action to an agent role"""
 db_action = AgentForbiddenAction(
 agent_role_id=agent_role_id,
 action=action,
 reason=reason
 )
 db.add(db_action)
 db.commit()
 db.refresh(db_action)
 return db_action

def remove_forbidden_action(db: Session, action_id: str) -> bool:
 """Remove a forbidden action"""
 db_action = db.query(AgentForbiddenAction).filter(AgentForbiddenAction.id == action_id).first()
 if db_action:
 db.delete(db_action)
 db.commit()
 return True
 return False

# Prompt Templates
def get_agent_prompt_template(db: Session, agent_name: str, template_name: str = None) -> Optional[AgentPromptTemplate]:
 """Get prompt template for an agent by name"""
 query = db.query(AgentPromptTemplate)\
 .join(AgentRole)\
 .filter(AgentRole.name == agent_name)\
 .filter(AgentPromptTemplate.is_active == True)
 
 if template_name:
 query = query.filter(AgentPromptTemplate.template_name == template_name)
 else:
 query = query.filter(AgentPromptTemplate.is_default == True)
 
 return query.first()

def create_agent_prompt_template(db: Session, template: AgentPromptTemplateCreate) -> AgentPromptTemplate:
 """Create a new prompt template"""
 db_template = AgentPromptTemplate(**template.model_dump())
 db.add(db_template)
 db.commit()
 db.refresh(db_template)
 return db_template

def update_agent_prompt_template(db: Session, template_id: str, template_update: AgentPromptTemplateUpdate) -> Optional[AgentPromptTemplate]:
 """Update a prompt template"""
 db_template = db.query(AgentPromptTemplate).filter(AgentPromptTemplate.id == template_id).first()
 if not db_template:
 return None
 
 update_data = template_update.model_dump(exclude_unset=True)
 for field, value in update_data.items():
 setattr(db_template, field, value)
 
 db.commit()
 db.refresh(db_template)
 return db_template

# Rule Violations
def log_rule_violation(db: Session, violation: AgentRuleViolationCreate) -> AgentRuleViolation:
 """Log a rule violation"""
 db_violation = AgentRuleViolation(**violation.model_dump())
 db.add(db_violation)
 db.commit()
 db.refresh(db_violation)
 return db_violation

def get_rule_violations(db: Session, agent_name: str = None, resolved: bool = None) -> List[AgentRuleViolation]:
 """Get rule violations with optional filters"""
 query = db.query(AgentRuleViolation)
 
 if agent_name:
 query = query.filter(AgentRuleViolation.agent_name == agent_name)
 
 if resolved is not None:
 query = query.filter(AgentRuleViolation.resolved == resolved)
 
 return query.order_by(AgentRuleViolation.created_at.desc()).all()

def resolve_rule_violation(db: Session, violation_id: str, resolution_notes: str) -> Optional[AgentRuleViolation]:
 """Mark a rule violation as resolved"""
 from datetime import datetime, timezone
 
 db_violation = db.query(AgentRuleViolation).filter(AgentRuleViolation.id == violation_id).first()
 if not db_violation:
 return None
 
 db_violation.resolved = True
 db_violation.resolution_notes = resolution_notes
 db_violation.resolved_at = datetime.now(timezone.utc)
 
 db.commit()
 db.refresh(db_violation)
 return db_violation

# Behavior Logs
def log_agent_behavior(db: Session, behavior_log: AgentBehaviorLogCreate) -> AgentBehaviorLog:
 """Log agent behavior"""
 db_log = AgentBehaviorLog(**behavior_log.model_dump())
 db.add(db_log)
 db.commit()
 db.refresh(db_log)
 return db_log

def get_agent_behavior_logs(db: Session, agent_name: str = None, task_project_id: str = None, task_number: int = None, limit: int = 100) -> List[AgentBehaviorLog]:
 """Get agent behavior logs with optional filters"""
 query = db.query(AgentBehaviorLog)
 
 if agent_name:
 query = query.filter(AgentBehaviorLog.agent_name == agent_name)
 
 if task_project_id:
 query = query.filter(AgentBehaviorLog.task_project_id == task_project_id)
 
 if task_number:
 query = query.filter(AgentBehaviorLog.task_number == task_number)
 
 return query.order_by(AgentBehaviorLog.created_at.desc()).limit(limit).all()

# Workflows
def get_workflows(db: Session, workflow_type: str = None, active_only: bool = True) -> List[Workflow]:
 """Get workflows with optional filtering"""
 query = db.query(Workflow).options(joinedload(Workflow.steps))
 
 if active_only:
 query = query.filter(Workflow.is_active == True)
 
 if workflow_type:
 query = query.filter(Workflow.workflow_type == workflow_type)
 
 return query.order_by(Workflow.name).all()

def get_workflow(db: Session, workflow_id: str) -> Optional[Workflow]:
 """Get a specific workflow with steps"""
 return db.query(Workflow)\
 .options(
 joinedload(Workflow.steps).joinedload(WorkflowStep.agent_role)
 )\
 .filter(Workflow.id == workflow_id)\
 .first()

def create_workflow(db: Session, workflow: WorkflowCreate) -> Workflow:
 """Create a new workflow"""
 db_workflow = Workflow(**workflow.model_dump())
 db.add(db_workflow)
 db.commit()
 db.refresh(db_workflow)
 return db_workflow

# Rules Validation Functions
def validate_task_against_agent_rules(db: Session, agent_name: str, task_data: Dict[str, Any]) -> List[Dict[str, str]]:
 """Validate a task against agent rules and return list of violations as dictionaries."""
 violations = []
 
 agent_role = get_agent_role_with_details(db, agent_name)
 if not agent_role:
 violations.append({
 "violation_type": "no_rules_defined",
 "violated_rule_category": "N/A",
 "violated_rule_identifier": "N/A",
 "description": f"No rules defined for agent: {agent_name}"
 })
 return violations
 
 # Check forbidden actions
 requested_actions = task_data.get('actions', [])
 for forbidden in agent_role.forbidden_actions:
 if forbidden.is_active:
 for action in requested_actions:
 if forbidden.action.lower() in action.lower():
 violations.append({
 "violation_type": "forbidden_action",
 "violated_rule_category": "forbidden_action",
 "violated_rule_identifier": forbidden.action,
 "description": f"Forbidden action '{forbidden.action}': {forbidden.reason or 'No reason provided'}"
 })
 
 # Check required capabilities
 required_capabilities = task_data.get('required_capabilities', [])
 available_capabilities = [cap.capability for cap in agent_role.capabilities if cap.is_active]
 
 for capability in required_capabilities:
 if capability not in available_capabilities:
 violations.append({
 "violation_type": "missing_capability",
 "violated_rule_category": "capability",
 "violated_rule_identifier": capability,
 "description": f"Required capability '{capability}' not available for agent {agent_name}"
 })
 
 # Check verification requirements
 for req in agent_role.verification_requirements:
 if req.requirement_type == "tool_required" and req.value not in available_tools_names:
 violations.append({
 "violated_rule_category": "verification_requirement",
 "violated_rule_identifier": req.value,
 "description": f"Verification tool '{req.value}' not available for agent {agent_name}"
 })
 
 # Check handoff criteria if task completion is imminent
 if task_context and task_context.get("status") in ["completed", "verification_complete"]:
 for criteria in agent_role.handoff_criteria:
 if criteria.condition_type == "required_status" and task_context.get("status") != criteria.value:
 violations.append({
 "violated_rule_category": "handoff_criteria",
 "violated_rule_identifier": criteria.condition_type,
 "description": f"Handoff condition not met: expected {criteria.value}, got {task_context.get('status')}"
 })
 
 # Check error protocols if there are errors in context
 if task_context and task_context.get("has_errors"):
 error_protocols = [ep for ep in agent_role.error_protocols if ep.error_type == task_context.get("error_type")]
 if not error_protocols:
 violations.append({
 "violated_rule_category": "error_protocol",
 "violated_rule_identifier": task_context.get("error_type"),
 "description": f"No error protocol defined for error type '{task_context.get('error_type')}'"
 })

 return violations

def generate_agent_prompt_from_rules(db: Session, agent_name: str, task_context: Dict[str, Any] = None, available_tools: List[Dict[str, Any]] = None) -> str:
 """Generate a rules-based prompt for an agent"""
 agent_role = get_agent_role_with_details(db, agent_name)
 if not agent_role:
 return f"Error: No rules defined for agent {agent_name}"
 
 # Try to get custom prompt template first
 template = get_agent_prompt_template(db, agent_name)
 if template:
 # Implement variable substitution
 prompt_content = template.template_content
 if task_context:
 for key, value in task_context.items():
 placeholder = f"{{{{{key}}}}}"
 prompt_content = prompt_content.replace(placeholder, str(value))
 
 # Include available tools if provided
 if available_tools:
 prompt_content += f"\n\n## Available Tools\nYou have access to the following tools:\n"
 for tool in available_tools:
 prompt_content += f"- **{tool.get('name', 'Unknown Tool')}**: {tool.get('description', 'No description provided.')}\n"

 return prompt_content
 
 # Generate default prompt from rules
 mandates = get_universal_mandates(db)
 
 prompt = f"""# Agent Role: {agent_role.display_name}

## Primary Purpose
{agent_role.primary_purpose}

## Universal Mandates
You MUST adhere to these universal mandates:
"""
 
 for mandate in sorted(mandates, key=lambda x: x.priority, reverse=True):
 prompt += f"\n- **{mandate.title}**: {mandate.description}"
 
 prompt += f"\n\n## Core Capabilities\nYou are authorized to perform these actions:\n"
 for capability in agent_role.capabilities:
 if capability.is_active:
 prompt += f"- {capability.capability}"
 if capability.description:
 prompt += f": {capability.description}"
 prompt += "\n"
 
 prompt += f"\n## Forbidden Actions\nYou MUST NOT perform these actions:\n"
 for forbidden in agent_role.forbidden_actions:
 if forbidden.is_active:
 prompt += f"- {forbidden.action}"
 if forbidden.reason:
 prompt += f" ({forbidden.reason})"
 prompt += "\n"
 
 prompt += f"\n## Verification Requirements\nYou must verify:\n"
 for req in agent_role.verification_requirements:
 prompt += f"- {req.requirement}"
 if req.description:
 prompt += f": {req.description}"
 if req.is_mandatory:
 prompt += " (MANDATORY)"
 prompt += "\n"
 
 prompt += f"\n## Handoff Criteria\nHand off to another agent when:\n"
 for criteria in agent_role.handoff_criteria:
 if criteria.is_active:
 prompt += f"- {criteria.criteria}"
 if criteria.target_agent_role:
 prompt += f" (to {criteria.target_agent_role})"
 prompt += "\n"
 
 # Include information about available memory tools
 prompt += f"\n## Available Memory Tools\nYou have access to the following memory tools:\n"
 
 # Standard memory operations available to all agents
 memory_tools = [
 {"name": "create_memory_entity", "description": "Create a new memory entity with content and metadata"},
 {"name": "get_memory_entities", "description": "Retrieve memory entities by type, content, or metadata"},
 {"name": "add_memory_observation", "description": "Add an observation to an existing memory entity"},
 {"name": "create_memory_relation", "description": "Create relationships between memory entities"},
 {"name": "search_memory", "description": "Search through memory entities by content or metadata"},
 {"name": "ingest_file", "description": "Ingest a file into the knowledge graph as a memory entity"}
 ]
 
 for tool in memory_tools:
 prompt += f"- **{tool['name']}**: {tool['description']}\n"
 
 # Add available tools from context if provided
 if available_tools:
 prompt += f"\n## Available System Tools\n"
 for tool in available_tools[:10]: # Limit to first 10 to keep prompt manageable
 tool_name = tool.get('name', 'Unknown')
 tool_desc = tool.get('description', 'No description available')
 prompt += f"- **{tool_name}**: {tool_desc}\n"

 if task_context:
 prompt += f"\n## Task Context\n{task_context}\n"

 return prompt
