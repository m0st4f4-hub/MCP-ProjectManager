"""
CRUD operations for rule management
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
import uuid
from datetime import datetime, UTC

from .. import models
from ..schemas import rules as schemas

async def create_agent_role(
    db: AsyncSession,
    agent_role: schemas.AgentRoleCreate
) -> models.AgentRole:
    """Create a new agent role"""
    db_role = models.AgentRole(
        id=str(uuid.uuid4()),
        name=agent_role.name,
        description=agent_role.description,
        priority=agent_role.priority,
        is_active=agent_role.is_active
    )
    db.add(db_role)
    await db.commit()
    await db.refresh(db_role)
    return db_role

async def get_agent_role(
    db: AsyncSession,
    role_id: str
) -> Optional[models.AgentRole]:
    """Get agent role by ID with all related data"""
    result = await db.execute(
        select(models.AgentRole)
        .options(
            selectinload(models.AgentRole.constraints),
            selectinload(models.AgentRole.capabilities),
            selectinload(models.AgentRole.mandates),
            selectinload(models.AgentRole.error_protocols)
        )
        .filter(models.AgentRole.id == role_id)
    )
    return result.scalar_one_or_none()

async def get_agent_roles(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None
) -> List[models.AgentRole]:
    """Get all agent roles"""
    query = select(models.AgentRole).options(
        selectinload(models.AgentRole.constraints),
        selectinload(models.AgentRole.capabilities),
        selectinload(models.AgentRole.mandates),
        selectinload(models.AgentRole.error_protocols)
    )

    if is_active is not None:
        query = query.filter(models.AgentRole.is_active == is_active)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def update_agent_role(
    db: AsyncSession,
    role_id: str,
    role_update: schemas.AgentRoleUpdate
) -> Optional[models.AgentRole]:
    """Update agent role"""
    result = await db.execute(
        select(models.AgentRole).filter(models.AgentRole.id == role_id)
    )
    db_role = result.scalar_one_or_none()

    if not db_role:
        return None

    update_data = role_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_role, field, value)

    db_role.updated_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(db_role)
    return db_role

async def delete_agent_role(
    db: AsyncSession,
    role_id: str
) -> bool:
    """Delete agent role"""
    result = await db.execute(
        select(models.AgentRole).filter(models.AgentRole.id == role_id)
    )
    db_role = result.scalar_one_or_none()

    if not db_role:
        return False

    await db.delete(db_role)
    await db.commit()
    return True  # Constraint operations


async def create_constraint(
    db: AsyncSession,
    role_id: str,
    constraint: schemas.ConstraintCreate
) -> models.Constraint:
    """Create a new constraint for an agent role"""
    db_constraint = models.Constraint(
        id=str(uuid.uuid4()),
        agent_role_id=role_id,
        constraint_type=constraint.constraint_type,
        description=constraint.description,
        parameters=constraint.parameters,
        is_hard_constraint=constraint.is_hard_constraint,
        priority=constraint.priority
    )
    db.add(db_constraint)
    await db.commit()
    await db.refresh(db_constraint)
    return db_constraint

async def update_constraint(
    db: AsyncSession,
    constraint_id: str,
    constraint_update: schemas.ConstraintUpdate
) -> Optional[models.Constraint]:
    """Update a constraint"""
    result = await db.execute(
        select(models.Constraint).filter(models.Constraint.id == constraint_id)
    )
    db_constraint = result.scalar_one_or_none()

    if not db_constraint:
        return None

    update_data = constraint_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_constraint, field, value)

    await db.commit()
    await db.refresh(db_constraint)
    return db_constraint

async def delete_constraint(
    db: AsyncSession,
    constraint_id: str
) -> bool:
    """Delete a constraint"""
    result = await db.execute(
        select(models.Constraint).filter(models.Constraint.id == constraint_id)
    )
    db_constraint = result.scalar_one_or_none()

    if not db_constraint:
        return False

    await db.delete(db_constraint)
    await db.commit()
    return True  # Capability operations


async def create_capability(
    db: AsyncSession,
    role_id: str,
    capability: schemas.CapabilityCreate
) -> models.Capability:
    """Create a new capability for an agent role"""
    db_capability = models.Capability(
        id=str(uuid.uuid4()),
        agent_role_id=role_id,
        capability=capability.capability,
        description=capability.description,
        required_tools=capability.required_tools,
        is_active=capability.is_active
    )
    db.add(db_capability)
    await db.commit()
    await db.refresh(db_capability)
    return db_capability

async def update_capability(
    db: AsyncSession,
    capability_id: str,
    capability_update: schemas.CapabilityUpdate
) -> Optional[models.Capability]:
    """Update a capability"""
    result = await db.execute(
        select(models.Capability).filter(models.Capability.id == capability_id)
    )
    db_capability = result.scalar_one_or_none()

    if not db_capability:
        return None

    update_data = capability_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_capability, field, value)

    await db.commit()
    await db.refresh(db_capability)
    return db_capability

async def delete_capability(
    db: AsyncSession,
    capability_id: str
) -> bool:
    """Delete a capability"""
    result = await db.execute(
        select(models.Capability).filter(models.Capability.id == capability_id)
    )
    db_capability = result.scalar_one_or_none()

    if not db_capability:
        return False

    await db.delete(db_capability)
    await db.commit()
    return True  # Mandate operations


async def create_mandate(
    db: AsyncSession,
    role_id: str,
    mandate: schemas.MandateCreate
) -> models.Mandate:
    """Create a new mandate for an agent role"""
    db_mandate = models.Mandate(
        id=str(uuid.uuid4()),
        agent_role_id=role_id,
        title=mandate.title,
        description=mandate.description,
        priority=mandate.priority,
        is_active=mandate.is_active
    )
    db.add(db_mandate)
    await db.commit()
    await db.refresh(db_mandate)
    return db_mandate

async def update_mandate(
    db: AsyncSession,
    mandate_id: str,
    mandate_update: schemas.MandateUpdate
) -> Optional[models.Mandate]:
    """Update a mandate"""
    result = await db.execute(
        select(models.Mandate).filter(models.Mandate.id == mandate_id)
    )
    db_mandate = result.scalar_one_or_none()

    if not db_mandate:
        return None

    update_data = mandate_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_mandate, field, value)

    await db.commit()
    await db.refresh(db_mandate)
    return db_mandate

async def delete_mandate(
    db: AsyncSession,
    mandate_id: str
) -> bool:
    """Delete a mandate"""
    result = await db.execute(
        select(models.Mandate).filter(models.Mandate.id == mandate_id)
    )
    db_mandate = result.scalar_one_or_none()

    if not db_mandate:
        return False

    await db.delete(db_mandate)
    await db.commit()
    return True  # Error protocol operations


async def create_error_protocol(
    db: AsyncSession,
    role_id: str,
    error_protocol: schemas.ErrorProtocolCreate
) -> models.ErrorProtocol:
    """Create a new error protocol for an agent role"""
    db_protocol = models.ErrorProtocol(
        id=str(uuid.uuid4()),
        agent_role_id=role_id,
        error_type=error_protocol.error_type,
        handling_strategy=error_protocol.handling_strategy,
        retry_config=error_protocol.retry_config,
        escalation_path=error_protocol.escalation_path
    )
    db.add(db_protocol)
    await db.commit()
    await db.refresh(db_protocol)
    return db_protocol

async def update_error_protocol(
    db: AsyncSession,
    protocol_id: str,
    protocol_update: schemas.ErrorProtocolUpdate
) -> Optional[models.ErrorProtocol]:
    """Update an error protocol"""
    result = await db.execute(
        select(models.ErrorProtocol).filter(models.ErrorProtocol.id == protocol_id)
    )
    db_protocol = result.scalar_one_or_none()

    if not db_protocol:
        return None

    update_data = protocol_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_protocol, field, value)

    await db.commit()
    await db.refresh(db_protocol)
    return db_protocol

async def delete_error_protocol(
    db: AsyncSession,
    protocol_id: str
) -> bool:
    """Delete an error protocol"""
    result = await db.execute(
        select(models.ErrorProtocol).filter(models.ErrorProtocol.id == protocol_id)
    )
    db_protocol = result.scalar_one_or_none()

    if not db_protocol:
        return False

    await db.delete(db_protocol)
    await db.commit()
    return True  # Rule validation functions


async def validate_agent_action(
    db: AsyncSession,
    agent_id: str,
    action_type: str,
    action_context: Dict[str, Any]
) -> schemas.ValidationResult:
    """Validate if an agent can perform a specific action"""  # Get agent with role
    agent_result = await db.execute(
        select(models.Agent)
        .options(selectinload(models.Agent.role))
        .filter(models.Agent.id == agent_id)
    )
    agent = agent_result.scalar_one_or_none()

    if not agent or not agent.role:
        return schemas.ValidationResult(
            is_valid=False,
            violations=[{
                "violation_type": "no_role",
                "message": "Agent has no assigned role"
            }]
        )  # Get full role with all rules
    role = await get_agent_role(db, agent.role_id)
    if not role:
        return schemas.ValidationResult(
            is_valid=False,
            violations=[{
                "violation_type": "invalid_role",
                "message": "Agent role not found"
            }]
        )

    violations = []  # Check constraints
    for constraint in role.constraints:
        if not await check_constraint(constraint, action_type, action_context):
            violations.append({
                "violation_type": "constraint_violation",
                "constraint_type": constraint.constraint_type,
                "description": constraint.description,
                "is_hard": constraint.is_hard_constraint
            })  # Check if action requires specific capabilities
    required_capabilities = action_context.get("required_capabilities", [])
    agent_capabilities = [cap.capability for cap in role.capabilities if cap.is_active]

    for req_cap in required_capabilities:
        if req_cap not in agent_capabilities:
            violations.append({
                "violation_type": "missing_capability",
                "required_capability": req_cap
            })  # Filter hard constraint violations
    hard_violations = [v for v in violations if v.get("is_hard", True)]

    return schemas.ValidationResult(
        is_valid=len(hard_violations) == 0,
        violations=violations,
        warnings=[v for v in violations if not v.get("is_hard", True)]
    )

async def check_constraint(
    constraint: models.Constraint,
    action_type: str,
    action_context: Dict[str, Any]
) -> bool:
    """Check if a constraint is satisfied"""  # Implement constraint checking logic based on constraint type
    if constraint.constraint_type == "time_based":  # Check time-based constraints
        current_time = datetime.now(UTC)
        allowed_hours = constraint.parameters.get("allowed_hours", [])
        if allowed_hours and current_time.hour not in allowed_hours:
            return False

    elif constraint.constraint_type == "resource_limit":  # Check resource limits
        max_resources = constraint.parameters.get("max_resources", {})
        current_usage = action_context.get("resource_usage", {})
        for resource, limit in max_resources.items():
            if current_usage.get(resource, 0) >= limit:
                return False

    elif constraint.constraint_type == "action_type":  # Check if action type is allowed
        allowed_actions = constraint.parameters.get("allowed_actions", [])
        if allowed_actions and action_type not in allowed_actions:
            return False

    return True

async def get_agent_prompt(
    db: AsyncSession,
    agent_id: str,
    task_context: Optional[Dict[str, Any]] = None
) -> str:
    """Generate a prompt for an agent based on its role and current context"""  # Get agent with role
    agent_result = await db.execute(
        select(models.Agent)
        .options(selectinload(models.Agent.role))
        .filter(models.Agent.id == agent_id)
    )
    agent = agent_result.scalar_one_or_none()

    if not agent or not agent.role:
        return "You are an AI assistant."  # Get full role with all rules
    role = await get_agent_role(db, agent.role_id)
    if not role:
        return "You are an AI assistant."  # Build prompt
    prompt = f"You are {agent.name}, {agent.description or 'an AI assistant'}.\n\n"
    prompt += f"  #  # Role: {role.name}\n{role.description}\n\n"  # Add mandates
    if role.mandates:
        prompt += "  #  # Core Mandates\n"
        for mandate in sorted(role.mandates, key=lambda x: x.priority, reverse=True):
            if mandate.is_active:
                prompt += f"- **{mandate.title}**: {mandate.description}\n"  # Add capabilities
    if role.capabilities:
        prompt += "\n  #  # Capabilities\n"
        for capability in role.capabilities:
            if capability.is_active:
                prompt += f"- {capability.capability}"
                if capability.description:
                    prompt += f": {capability.description}"
                prompt += "\n"  # Add constraints
    active_constraints = [c for c in role.constraints if c.is_hard_constraint]
    if active_constraints:
        prompt += "\n  #  # Constraints\n"
        for constraint in sorted(active_constraints, key=lambda x: x.priority, reverse=True):
            prompt += f"- {constraint.description}\n"  # Add context-specific information
    if task_context:
        prompt += "\n  #  # Current Context\n"
        if "task_type" in task_context:
            prompt += f"Task Type: {task_context['task_type']}\n"
        if "project_info" in task_context:
            prompt += f"Project: {task_context['project_info']}\n"

    return prompt
