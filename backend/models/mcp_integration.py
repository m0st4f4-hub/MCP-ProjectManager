"""
MCP Tool Integration and Execution Tracking Models.
Handles MCP tool registration, execution logging, and performance monitoring.
"""

from sqlalchemy import (
    Column, String, Integer, DateTime, Boolean, Text, 
    ForeignKey, Index, Numeric
)
from sqlalchemy.orm import relationship
from datetime import datetime

from .base import Base, BaseModel, JSONText


class MCPTool(Base, BaseModel):
    """Registry of available MCP tools with their capabilities and configuration."""
    __tablename__ = "mcp_tools"
    __table_args__ = (
        Index('idx_mcp_tools_name', 'name'),
        Index('idx_mcp_tools_category', 'category'),
        Index('idx_mcp_tools_active', 'is_active'),
    )

    # Tool identification
    name = Column(String(255), unique=True, nullable=False, index=True)
    display_name = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    version = Column(String(50), nullable=True)
    
    # Categorization
    category = Column(String(100), nullable=True, index=True)  # 'project', 'task', 'memory', 'file', 'agent'
    tags = Column(JSONText, nullable=True)  # List of tags for categorization
    
    # Tool configuration
    input_schema = Column(JSONText, nullable=True)  # JSON schema for input validation
    output_schema = Column(JSONText, nullable=True)  # JSON schema for output validation
    tool_capabilities = Column(JSONText, nullable=True)  # List of capabilities
    
    # Execution configuration
    timeout_seconds = Column(Integer, default=30, nullable=False)
    max_retries = Column(Integer, default=3, nullable=False)
    rate_limit_per_minute = Column(Integer, default=60, nullable=False)
    
    # Access control
    requires_agent_role = Column(String(100), nullable=True)
    allowed_agent_ids = Column(JSONText, nullable=True)  # List of specific agent IDs if restricted
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_deprecated = Column(Boolean, default=False, nullable=False)
    deprecation_message = Column(Text, nullable=True)
    
    # Documentation
    usage_examples = Column(JSONText, nullable=True)
    error_codes = Column(JSONText, nullable=True)
    
    # Relationships
    executions = relationship("MCPToolExecution", back_populates="tool", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<MCPTool(id={self.id}, name='{self.name}', category='{self.category}')>"


class MCPToolExecution(Base, BaseModel):
    """Logs every execution of MCP tools with full context and performance data."""
    __tablename__ = "mcp_tool_executions"
    __table_args__ = (
        Index('idx_mcp_execution_tool', 'tool_name'),
        Index('idx_mcp_execution_agent', 'agent_id'),
        Index('idx_mcp_execution_task', 'task_project_id', 'task_task_number'),
        Index('idx_mcp_execution_status', 'execution_status'),
        Index('idx_mcp_execution_timestamp', 'executed_at'),
        Index('idx_mcp_execution_duration', 'execution_time_ms'),
    )

    # Tool and context
    tool_name = Column(String(255), ForeignKey("mcp_tools.name"), nullable=False)
    agent_id = Column(String(32), ForeignKey("agents.id"), nullable=True)
    
    # Task context (optional)
    task_project_id = Column(String(36), nullable=True)
    task_task_number = Column(Integer, nullable=True)
    
    # Execution details
    execution_id = Column(String(64), nullable=False, unique=True, index=True)  # UUID for tracking
    session_id = Column(String(64), nullable=True)  # Groups related tool calls
    
    # Input and output
    input_parameters = Column(JSONText, nullable=True)
    output_result = Column(JSONText, nullable=True)
    output_size_bytes = Column(Integer, nullable=True)
    
    # Execution metrics
    execution_status = Column(String(20), nullable=False)  # 'success', 'error', 'timeout', 'cancelled'
    execution_time_ms = Column(Integer, nullable=False)
    memory_usage_mb = Column(Numeric(10, 2), nullable=True)
    
    # Error handling
    error_type = Column(String(100), nullable=True)
    error_message = Column(Text, nullable=True)
    error_stack_trace = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)
    
    # Timing
    executed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    # Context and metadata
    execution_context = Column(JSONText, nullable=True)  # Additional context like user session, workflow step
    user_agent = Column(String(500), nullable=True)
    ip_address = Column(String(45), nullable=True)  # IPv6 compatible
    
    # Quality metrics
    output_confidence = Column(Numeric(5, 2), nullable=True)  # 0.00-100.00 confidence score
    user_feedback_rating = Column(Integer, nullable=True)  # 1-5 rating from user/agent
    
    # Relationships
    tool = relationship("MCPTool", back_populates="executions")
    agent = relationship("Agent")
    
    def __repr__(self):
        return f"<MCPToolExecution(id={self.id}, tool='{self.tool_name}', status='{self.execution_status}', duration={self.execution_time_ms}ms)>"


class MCPToolMetric(Base, BaseModel):
    """Aggregated metrics for MCP tool performance analysis."""
    __tablename__ = "mcp_tool_metrics"
    __table_args__ = (
        Index('idx_mcp_metrics_tool', 'tool_name'),
        Index('idx_mcp_metrics_period', 'metric_period_start', 'metric_period_end'),
        Index('idx_mcp_metrics_type', 'metric_type'),
    )

    tool_name = Column(String(255), ForeignKey("mcp_tools.name"), nullable=False)
    
    # Metric details
    metric_type = Column(String(50), nullable=False)  # 'avg_duration', 'success_rate', 'error_rate', 'usage_count'
    metric_value = Column(Numeric(15, 4), nullable=False)
    metric_unit = Column(String(20), nullable=True)  # 'ms', 'percentage', 'count'
    
    # Time period
    metric_period_start = Column(DateTime, nullable=False)
    metric_period_end = Column(DateTime, nullable=False)
    aggregation_level = Column(String(20), nullable=False)  # 'hourly', 'daily', 'weekly', 'monthly'
    
    # Supporting data
    sample_count = Column(Integer, default=0, nullable=False)
    min_value = Column(Numeric(15, 4), nullable=True)
    max_value = Column(Numeric(15, 4), nullable=True)
    std_deviation = Column(Numeric(15, 4), nullable=True)
    
    # Segmentation
    agent_id = Column(String(32), ForeignKey("agents.id"), nullable=True)  # Agent-specific metrics
    task_category = Column(String(100), nullable=True)  # Task type segmentation
    
    # Quality indicators
    performance_trend = Column(String(20), nullable=True)  # 'improving', 'stable', 'degrading'
    alert_threshold_breached = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    tool = relationship("MCPTool")
    agent = relationship("Agent")
    
    def __repr__(self):
        return f"<MCPToolMetric(id={self.id}, tool='{self.tool_name}', type='{self.metric_type}', value={self.metric_value})>"


class MCPToolDependency(Base, BaseModel):
    """Tracks dependencies between MCP tools for workflow optimization."""
    __tablename__ = "mcp_tool_dependencies"
    __table_args__ = (
        Index('idx_mcp_dependency_parent', 'parent_tool_name'),
        Index('idx_mcp_dependency_child', 'child_tool_name'),
        Index('idx_mcp_dependency_type', 'dependency_type'),
    )

    parent_tool_name = Column(String(255), ForeignKey("mcp_tools.name"), nullable=False)
    child_tool_name = Column(String(255), ForeignKey("mcp_tools.name"), nullable=False)
    
    # Dependency characteristics
    dependency_type = Column(String(50), nullable=False)  # 'required', 'optional', 'alternative', 'sequential'
    execution_order = Column(Integer, nullable=True)  # For sequential dependencies
    
    # Conditional logic
    condition_expression = Column(Text, nullable=True)  # Expression to evaluate dependency
    condition_parameters = Column(JSONText, nullable=True)
    
    # Performance impact
    avg_delay_ms = Column(Integer, nullable=True)
    success_rate_impact = Column(Numeric(5, 2), nullable=True)  # -100.00 to +100.00
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    discovered_automatically = Column(Boolean, default=False, nullable=False)
    confidence_score = Column(Numeric(5, 2), default=100.00, nullable=False)
    
    # Relationships
    parent_tool = relationship("MCPTool", foreign_keys=[parent_tool_name])
    child_tool = relationship("MCPTool", foreign_keys=[child_tool_name])
    
    def __repr__(self):
        return f"<MCPToolDependency(id={self.id}, {self.parent_tool_name} → {self.child_tool_name}, type='{self.dependency_type}')>"