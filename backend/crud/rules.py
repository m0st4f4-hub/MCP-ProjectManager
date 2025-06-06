"""
Rules CRUD operations - Minimal working version
"""

import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, Session
from datetime import datetime, UTC

from .. import models
from ..schemas.agent_role import AgentRoleCreate, AgentRoleUpdate
from ..schemas.agent_capability import AgentCapabilityCreate as CapabilityCreate, AgentCapabilityUpdate as CapabilityUpdate
from ..schemas.universal_mandate import UniversalMandateCreate as MandateCreate, UniversalMandateUpdate as MandateUpdate
from ..schemas.error_protocol import ErrorProtocolCreate, ErrorProtocolUpdate
from ..schemas.agent_prompt_template import (
    AgentPromptTemplateCreate,
    AgentPromptTemplateUpdate,
)
from ..schemas import rules as schemas


# Agent Role operations
async def create_agent_role(
    db: AsyncSession,
    agent_role: AgentRoleCreate
) -> models.AgentRole:
    """Create a new agent role"""
    db_role = models.AgentRole(
        id=str(uuid.uuid4()),
        name=agent_role.name,
        display_name=getattr(agent_role, 'display_name', agent_role.name),
        primary_purpose=getattr(agent_role, 'primary_purpose', agent_role.description or ''),
        is_active=getattr(agent_role, 'is_active', True)
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
            selectinload(models.AgentRole.capabilities),
            selectinload(models.AgentRole.forbidden_actions),
            selectinload(models.AgentRole.verification_requirements),
            selectinload(models.AgentRole.handoff_criteria),
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
        selectinload(models.AgentRole.capabilities),
        selectinload(models.AgentRole.forbidden_actions),
        selectinload(models.AgentRole.verification_requirements),
        selectinload(models.AgentRole.handoff_criteria),
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
    role_update: AgentRoleUpdate
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
    return True


# Placeholder functions for missing models - these will need to be implemented when models are created
def create_constraint(*args, **kwargs):
    """Placeholder - Constraint model doesn't exist yet"""
    raise NotImplementedError("Constraint model not implemented")

def update_constraint(*args, **kwargs):
    """Placeholder - Constraint model doesn't exist yet"""
    raise NotImplementedError("Constraint model not implemented")

def delete_constraint(*args, **kwargs):
    """Placeholder - Constraint model doesn't exist yet"""
    raise NotImplementedError("Constraint model not implemented")

def create_capability(*args, **kwargs):
    """Placeholder - using AgentCapability instead"""
    raise NotImplementedError("Use AgentCapability model instead")

def update_capability(*args, **kwargs):
    """Placeholder - using AgentCapability instead"""
    raise NotImplementedError("Use AgentCapability model instead")

def delete_capability(*args, **kwargs):
    """Placeholder - using AgentCapability instead"""
    raise NotImplementedError("Use AgentCapability model instead")

def create_mandate(*args, **kwargs):
    """Placeholder - using UniversalMandate instead"""
    raise NotImplementedError("Use UniversalMandate model instead")

def update_mandate(*args, **kwargs):
    """Placeholder - using UniversalMandate instead"""
    raise NotImplementedError("Use UniversalMandate model instead")

def delete_mandate(*args, **kwargs):
    """Placeholder - using UniversalMandate instead"""
    raise NotImplementedError("Use UniversalMandate model instead")

def validate_agent_action(*args, **kwargs):
    """Placeholder - validation logic not implemented"""
    return schemas.ValidationResult(is_valid=True, violations=[], warnings=[])

def check_constraint(*args, **kwargs):
    """Placeholder - constraint checking not implemented"""
    return True

def get_agent_prompt(*args, **kwargs):
    """Placeholder - prompt generation not implemented"""
    return "Default agent prompt"


# Working functions for existing models
async def add_forbidden_action(
    db: AsyncSession,
    role_id: str,
    action: str,
    reason: Optional[str] = None
) -> models.AgentForbiddenAction:
    """Create a forbidden action for an agent role."""
    db_action = models.AgentForbiddenAction(
        id=str(uuid.uuid4()).replace("-", ""),
        agent_role_id=role_id,
        action=action,
        reason=reason,
        is_active=True,
    )
    db.add(db_action)
    await db.commit()
    await db.refresh(db_action)
    return db_action


async def get_forbidden_actions(
    db: AsyncSession, 
    role_id: str, 
    skip: int = 0, 
    limit: Optional[int] = 100
) -> List[models.AgentForbiddenAction]:
    """List forbidden actions for a role."""
    query = select(models.AgentForbiddenAction).filter(
        models.AgentForbiddenAction.agent_role_id == role_id
    )
    query = query.offset(skip)
    if limit is not None:
        query = query.limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def remove_forbidden_action(db: AsyncSession, action_id: str) -> bool:
    """Delete a forbidden action by ID."""
    result = await db.execute(
        select(models.AgentForbiddenAction).filter(
            models.AgentForbiddenAction.id == action_id
        )
    )
    db_action = result.scalar_one_or_none()
    if not db_action:
        return False
    await db.delete(db_action)
    await db.commit()
    return True


# Error protocol operations
async def create_error_protocol(
    db: AsyncSession,
    role_id: str,
    error_protocol: ErrorProtocolCreate
) -> models.AgentErrorProtocol:
    """Create a new error protocol for an agent role"""
    db_protocol = models.AgentErrorProtocol(
        id=str(uuid.uuid4()),
        agent_role_id=role_id,
        error_type=error_protocol.error_type,
        response_action=error_protocol.response_action,
        is_active=getattr(error_protocol, 'is_active', True)
    )
    db.add(db_protocol)
    await db.commit()
    await db.refresh(db_protocol)
    return db_protocol


async def update_error_protocol(
    db: AsyncSession,
    protocol_id: str,
    protocol_update: ErrorProtocolUpdate
) -> Optional[models.AgentErrorProtocol]:
    """Update an error protocol"""
    result = await db.execute(
        select(models.AgentErrorProtocol).filter(
            models.AgentErrorProtocol.id == protocol_id
        )
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
        select(models.AgentErrorProtocol).filter(
            models.AgentErrorProtocol.id == protocol_id
        )
    )
    db_protocol = result.scalar_one_or_none()

    if not db_protocol:
        return False

    await db.delete(db_protocol)
    await db.commit()
    return True


# Agent prompt template operations
def create_agent_prompt_template(
    db: Session, template: AgentPromptTemplateCreate
) -> models.AgentPromptTemplate:
    """Create a new agent prompt template."""
    db_template = models.AgentPromptTemplate(
        id=str(uuid.uuid4()),
        agent_name=template.agent_name,
        template_name=template.template_name,
        template_content=template.template_content,
        is_active=getattr(template, 'is_active', True),
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


def get_agent_prompt_template(
    db: Session, agent_name: str, template_name: Optional[str] = None
) -> Optional[models.AgentPromptTemplate]:
    """Get agent prompt template by agent name and optional template name."""
    query = db.query(models.AgentPromptTemplate).filter(
        models.AgentPromptTemplate.agent_name == agent_name,
        models.AgentPromptTemplate.is_active == True
    )
    if template_name:
        query = query.filter(models.AgentPromptTemplate.template_name == template_name)
    return query.first()


def update_agent_prompt_template(
    db: Session, template_id: str, template_update: AgentPromptTemplateUpdate
) -> Optional[models.AgentPromptTemplate]:
    """Update an agent prompt template."""
    db_template = db.query(models.AgentPromptTemplate).filter(
        models.AgentPromptTemplate.id == template_id
    ).first()
    if not db_template:
        return None

    update_data = template_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_template, field, value)

    db.commit()
    db.refresh(db_template)
    return db_template


def delete_agent_prompt_template(db: Session, template_id: str) -> bool:
    """Delete an agent prompt template."""
    db_template = db.query(models.AgentPromptTemplate).filter(
        models.AgentPromptTemplate.id == template_id
    ).first()
    if not db_template:
        return False

    db.delete(db_template)
    db.commit()
    return True


# TDD: Implementing missing functions that tests expect
async def delete_universal_mandate(db: AsyncSession, mandate_id: str) -> bool:
    """Delete a universal mandate by ID"""
    try:
        result = await db.execute(
            select(models.UniversalMandate).filter(models.UniversalMandate.id == mandate_id)
        )
        mandate = result.scalar_one_or_none()
        
        if not mandate:
            return False
            
        await db.delete(mandate)
        await db.commit()
        return True
    except Exception:
        await db.rollback()
        return False


async def generate_agent_prompt_from_rules(
    db: AsyncSession, 
    agent_name: str, 
    task_context: Optional[Dict[str, Any]] = None,
    available_tools: Optional[List[str]] = None
) -> str:
    """Generate agent prompt from rules - TDD implementation"""
    # Get agent role details
    agent_role = await get_agent_role_with_details(db, agent_name)
    if not agent_role:
        return f"Agent '{agent_name}' not found"
    
    # Build prompt from agent details
    prompt_parts = [
        f"# Agent: {agent_role.name}",
        f"Purpose: {agent_role.primary_purpose}",
    ]
    
    # Add capabilities
    if agent_role.capabilities:
        prompt_parts.append("\n## Capabilities:")
        for cap in agent_role.capabilities:
            prompt_parts.append(f"- {cap.name}: {cap.description}")
    
    # Add forbidden actions
    if agent_role.forbidden_actions:
        prompt_parts.append("\n## Forbidden Actions:")
        for action in agent_role.forbidden_actions:
            prompt_parts.append(f"- {action.action}: {action.reason or 'No specific reason'}")
    
    # Add available tools if provided
    if available_tools:
        prompt_parts.append("\n## Available Tools:")
        for tool in available_tools:
            prompt_parts.append(f"- {tool}")
    
    return "\n".join(prompt_parts)


async def validate_task_against_agent_rules(
    db: AsyncSession,
    agent_name: str, 
    task_data: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """Validate task against agent rules - TDD implementation"""
    violations = []
    
    # Get agent role details  
    agent_role = await get_agent_role_with_details(db, agent_name)
    if not agent_role:
        violations.append({
            "type": "AGENT_NOT_FOUND",
            "message": f"Agent '{agent_name}' not found",
            "severity": "ERROR"
        })
        return violations
    
    # Check forbidden actions
    task_action = task_data.get("action", "")
    for forbidden in agent_role.forbidden_actions:
        if forbidden.action.lower() in task_action.lower():
            violations.append({
                "type": "FORBIDDEN_ACTION",
                "message": f"Task contains forbidden action: {forbidden.action}",
                "reason": forbidden.reason,
                "severity": "ERROR"
            })
    
    # Check verification requirements
    for requirement in agent_role.verification_requirements:
        if requirement.requirement not in task_data.get("verification_steps", []):
            violations.append({
                "type": "MISSING_VERIFICATION",
                "message": f"Missing required verification: {requirement.requirement}",
                "severity": "WARNING"
            })
    
    return violations


async def get_agent_role_with_details(db: AsyncSession, agent_name: str) -> Optional[models.AgentRole]:
    """Get agent role by name with all related data - TDD implementation"""
    result = await db.execute(
        select(models.AgentRole)
        .options(
            selectinload(models.AgentRole.capabilities),
            selectinload(models.AgentRole.forbidden_actions),
            selectinload(models.AgentRole.verification_requirements),
            selectinload(models.AgentRole.handoff_criteria),
            selectinload(models.AgentRole.error_protocols)
        )
        .filter(models.AgentRole.name == agent_name)
    )
    return result.scalar_one_or_none()


async def get_universal_mandates(
    db: AsyncSession, 
    active_only: bool = True,
    skip: int = 0,
    limit: int = 100
) -> List[models.UniversalMandate]:
    """Get universal mandates - TDD implementation"""
    query = select(models.UniversalMandate)
    
    if active_only:
        query = query.filter(models.UniversalMandate.is_active == True)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()
