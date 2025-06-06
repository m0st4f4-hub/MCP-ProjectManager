"""
Rules schemas - Re-exports for backward compatibility
"""

from .agent_role import AgentRoleCreate, AgentRoleUpdate
from .agent_capability import AgentCapabilityCreate as CapabilityCreate, AgentCapabilityUpdate as CapabilityUpdate
from .universal_mandate import UniversalMandateCreate as MandateCreate, UniversalMandateUpdate as MandateUpdate
from .error_protocol import ErrorProtocolCreate, ErrorProtocolUpdate
from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class ConstraintCreate(BaseModel):
    """Schema for creating constraints."""
    constraint_type: str
    description: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    is_hard_constraint: bool = True
    priority: int = 1


class ConstraintUpdate(BaseModel):
    """Schema for updating constraints."""
    constraint_type: Optional[str] = None
    description: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    is_hard_constraint: Optional[bool] = None
    priority: Optional[int] = None


class ValidationResult(BaseModel):
    """Schema for validation results."""
    is_valid: bool
    violations: List[str] = []
    warnings: List[str] = []
    context: Optional[Dict[str, Any]] = None


# Re-export everything for convenience
__all__ = [
    "AgentRoleCreate",
    "AgentRoleUpdate", 
    "CapabilityCreate",
    "CapabilityUpdate",
    "MandateCreate",
    "MandateUpdate",
    "ErrorProtocolCreate",
    "ErrorProtocolUpdate",
    "ConstraintCreate",
    "ConstraintUpdate",
    "ValidationResult"
] 