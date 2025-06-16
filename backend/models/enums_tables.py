"""
Centralized Enum Management Tables.
Provides database-backed enums for consistent status and type management.
"""

from sqlalchemy import Column, String, Integer, Boolean, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime

from .base import Base, BaseModel, JSONText


class EnumRegistry(Base, BaseModel):
    """Central registry of all enum types used in the system."""
    __tablename__ = "enum_registry"
    __table_args__ = (
        Index('idx_enum_registry_name', 'enum_name'),
        Index('idx_enum_registry_category', 'category'),
    )

    enum_name = Column(String(100), unique=True, nullable=False, index=True)
    display_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=True, index=True)  # 'status', 'priority', 'type'
    
    # Configuration
    is_system_enum = Column(Boolean, default=True, nullable=False)  # System vs user-defined
    is_extensible = Column(Boolean, default=False, nullable=False)  # Can users add values
    supports_custom_ordering = Column(Boolean, default=True, nullable=False)
    
    # Validation rules
    value_pattern = Column(String(500), nullable=True)  # Regex pattern for valid values
    min_values = Column(Integer, default=1, nullable=False)
    max_values = Column(Integer, nullable=True)
    
    # Metadata
    enum_metadata = Column(JSONText, nullable=True)
    
    # Relationships
    values = relationship("EnumValue", back_populates="enum_registry", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<EnumRegistry(id={self.id}, name='{self.enum_name}', category='{self.category}')>"


class EnumValue(Base, BaseModel):
    """Individual values within an enum type."""
    __tablename__ = "enum_values"
    __table_args__ = (
        Index('idx_enum_values_enum', 'enum_registry_id'),
        Index('idx_enum_values_value', 'value'),
        Index('idx_enum_values_order', 'sort_order'),
        Index('idx_enum_values_active', 'is_active'),
    )

    enum_registry_id = Column(String(32), nullable=False, index=True)
    
    # Value definition
    value = Column(String(100), nullable=False, index=True)
    display_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # Ordering and grouping
    sort_order = Column(Integer, default=0, nullable=False)
    parent_value_id = Column(String(32), nullable=True)  # For hierarchical enums
    
    # Status and lifecycle
    is_active = Column(Boolean, default=True, nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    is_deprecated = Column(Boolean, default=False, nullable=False)
    deprecation_message = Column(Text, nullable=True)
    
    # Visual and UX
    color_hex = Column(String(7), nullable=True)  # #RRGGBB
    icon_name = Column(String(100), nullable=True)
    css_class = Column(String(100), nullable=True)
    
    # Business logic
    transition_rules = Column(JSONText, nullable=True)  # Valid transitions for status enums
    permissions_required = Column(JSONText, nullable=True)  # Required permissions to use this value
    automation_triggers = Column(JSONText, nullable=True)  # Actions triggered when set to this value
    
    # Metadata
    value_metadata = Column(JSONText, nullable=True)
    
    # Relationships
    enum_registry = relationship("EnumRegistry", back_populates="values")
    
    def __repr__(self):
        return f"<EnumValue(id={self.id}, enum={self.enum_registry_id}, value='{self.value}')>"


class StatusTransitionRule(Base, BaseModel):
    """Defines valid transitions between status values."""
    __tablename__ = "status_transition_rules"
    __table_args__ = (
        Index('idx_status_transition_from', 'from_status_id'),
        Index('idx_status_transition_to', 'to_status_id'),
        Index('idx_status_transition_enum', 'enum_registry_id'),
    )

    enum_registry_id = Column(String(32), nullable=False, index=True)
    from_status_id = Column(String(32), nullable=True)  # Null for initial transitions
    to_status_id = Column(String(32), nullable=False)
    
    # Transition conditions
    requires_approval = Column(Boolean, default=False, nullable=False)
    required_agent_role = Column(String(100), nullable=True)
    condition_expression = Column(Text, nullable=True)  # Conditional logic
    
    # Automation
    auto_transition_after_hours = Column(Integer, nullable=True)
    auto_transition_condition = Column(Text, nullable=True)
    
    # Documentation
    transition_name = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    
    # Validation
    is_active = Column(Boolean, default=True, nullable=False)
    is_reversible = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    enum_registry = relationship("EnumRegistry")
    
    def __repr__(self):
        return f"<StatusTransitionRule(id={self.id}, {self.from_status_id} → {self.to_status_id})>"


# Predefined enum data for system initialization
SYSTEM_ENUM_DATA = {
    "task_status": {
        "display_name": "Task Status",
        "description": "Status values for task execution lifecycle",
        "category": "status",
        "values": [
            {"value": "TO_DO", "display_name": "To Do", "sort_order": 1, "color_hex": "#6B7280", "is_default": True},
            {"value": "IN_PROGRESS", "display_name": "In Progress", "sort_order": 2, "color_hex": "#3B82F6"},
            {"value": "CONTEXT_ACQUIRED", "display_name": "Context Acquired", "sort_order": 3, "color_hex": "#10B981"},
            {"value": "PLANNING_COMPLETE", "display_name": "Planning Complete", "sort_order": 4, "color_hex": "#8B5CF6"},
            {"value": "EXECUTION_IN_PROGRESS", "display_name": "Execution In Progress", "sort_order": 5, "color_hex": "#F59E0B"},
            {"value": "BLOCKED", "display_name": "Blocked", "sort_order": 6, "color_hex": "#EF4444"},
            {"value": "PENDING_VERIFICATION", "display_name": "Pending Verification", "sort_order": 7, "color_hex": "#F97316"},
            {"value": "VERIFICATION_COMPLETE", "display_name": "Verification Complete", "sort_order": 8, "color_hex": "#84CC16"},
            {"value": "COMPLETED", "display_name": "Completed", "sort_order": 9, "color_hex": "#22C55E"},
            {"value": "CANCELLED", "display_name": "Cancelled", "sort_order": 10, "color_hex": "#64748B"}
        ]
    },
    "project_status": {
        "display_name": "Project Status",
        "description": "Status values for project lifecycle",
        "category": "status",
        "values": [
            {"value": "ACTIVE", "display_name": "Active", "sort_order": 1, "color_hex": "#10B981", "is_default": True},
            {"value": "COMPLETED", "display_name": "Completed", "sort_order": 2, "color_hex": "#22C55E"},
            {"value": "PAUSED", "display_name": "Paused", "sort_order": 3, "color_hex": "#F59E0B"},
            {"value": "ARCHIVED", "display_name": "Archived", "sort_order": 4, "color_hex": "#6B7280"},
            {"value": "CANCELLED", "display_name": "Cancelled", "sort_order": 5, "color_hex": "#EF4444"}
        ]
    },
    "priority": {
        "display_name": "Priority Level",
        "description": "Priority levels for tasks and projects",
        "category": "priority",
        "values": [
            {"value": "LOW", "display_name": "Low", "sort_order": 1, "color_hex": "#84CC16"},
            {"value": "MEDIUM", "display_name": "Medium", "sort_order": 2, "color_hex": "#F59E0B", "is_default": True},
            {"value": "HIGH", "display_name": "High", "sort_order": 3, "color_hex": "#F97316"},
            {"value": "CRITICAL", "display_name": "Critical", "sort_order": 4, "color_hex": "#EF4444"}
        ]
    },
    "agent_capability_type": {
        "display_name": "Agent Capability Type",
        "description": "Types of capabilities agents can have",
        "category": "type",
        "values": [
            {"value": "DEVELOPMENT", "display_name": "Development", "sort_order": 1, "color_hex": "#3B82F6"},
            {"value": "RESEARCH", "display_name": "Research", "sort_order": 2, "color_hex": "#8B5CF6"},
            {"value": "ANALYSIS", "display_name": "Analysis", "sort_order": 3, "color_hex": "#06B6D4"},
            {"value": "DOCUMENTATION", "display_name": "Documentation", "sort_order": 4, "color_hex": "#10B981"},
            {"value": "TESTING", "display_name": "Testing", "sort_order": 5, "color_hex": "#F59E0B"},
            {"value": "DEPLOYMENT", "display_name": "Deployment", "sort_order": 6, "color_hex": "#EF4444"}
        ]
    }
}