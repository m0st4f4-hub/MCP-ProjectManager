"""
Agent Execution and Workflow Tracking Models.
Tracks agent task execution, handoffs, and performance metrics.
"""

from sqlalchemy import (
    Column, String, Integer, DateTime, Boolean, Text, 
    ForeignKey, Enum, Index, Numeric
)
from sqlalchemy.orm import relationship
from datetime import datetime
from decimal import Decimal

from .base import Base, BaseModel, JSONText
from ..enums import TaskStatusEnum


class TaskWorkflowExecution(Base, BaseModel):
    """Tracks the execution of a workflow for a specific task."""
    __tablename__ = "task_workflow_executions"
    __table_args__ = (
        Index('idx_task_workflow_task', 'task_project_id', 'task_task_number'),
        Index('idx_task_workflow_status', 'status'),
        Index('idx_task_workflow_agent', 'current_agent_id'),
    )

    # Task reference
    task_project_id = Column(String(36), nullable=False)
    task_task_number = Column(Integer, nullable=False)
    
    # Workflow tracking
    workflow_id = Column(String(32), ForeignKey("workflows.id"), nullable=True)
    current_step_id = Column(String(32), ForeignKey("workflow_steps.id"), nullable=True)
    current_agent_id = Column(String(32), ForeignKey("agents.id"), nullable=True)
    
    # Execution status
    status = Column(String(50), default='initialized', nullable=False)
    # Status values: initialized, in_progress, blocked, completed, failed, cancelled
    
    # Timing
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    last_activity_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Progress tracking
    steps_completed = Column(Integer, default=0, nullable=False)
    steps_total = Column(Integer, default=0, nullable=False)
    progress_percentage = Column(Numeric(5, 2), default=Decimal('0.00'), nullable=False)
    
    # Context and state
    execution_context = Column(JSONText, nullable=True)  # Current execution state
    error_details = Column(JSONText, nullable=True)  # Error information if failed
    
    # Relationships
    workflow = relationship("Workflow")
    current_step = relationship("WorkflowStep")
    current_agent = relationship("Agent")
    
    def __repr__(self):
        return f"<TaskWorkflowExecution(id={self.id}, task={self.task_project_id}:{self.task_task_number}, status='{self.status}')>"


class TaskStatusTransition(Base, BaseModel):
    """Tracks all status changes for tasks with agent and reasoning context."""
    __tablename__ = "task_status_transitions"
    __table_args__ = (
        Index('idx_task_status_task', 'task_project_id', 'task_task_number'),
        Index('idx_task_status_agent', 'agent_id'),
        Index('idx_task_status_from_to', 'from_status', 'to_status'),
        Index('idx_task_status_timestamp', 'transitioned_at'),
    )

    # Task reference
    task_project_id = Column(String(36), nullable=False)
    task_task_number = Column(Integer, nullable=False)
    
    # Status change
    from_status = Column(Enum(TaskStatusEnum), nullable=True)  # Null for initial status
    to_status = Column(Enum(TaskStatusEnum), nullable=False)
    
    # Agent and automation
    agent_id = Column(String(32), ForeignKey("agents.id"), nullable=True)
    automated = Column(Boolean, default=False, nullable=False)
    trigger_type = Column(String(50), nullable=True)  # 'manual', 'workflow', 'mcp_tool', 'timeout'
    
    # Context and reasoning
    reason = Column(Text, nullable=True)
    transition_context = Column(JSONText, nullable=True)
    
    # Timing
    transitioned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    duration_seconds = Column(Integer, nullable=True)  # Time spent in previous status
    
    # Validation and approval
    requires_approval = Column(Boolean, default=False, nullable=False)
    approved_by_agent_id = Column(String(32), ForeignKey("agents.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    # Relationships
    agent = relationship("Agent", foreign_keys=[agent_id])
    approved_by_agent = relationship("Agent", foreign_keys=[approved_by_agent_id])
    
    def __repr__(self):
        return f"<TaskStatusTransition(id={self.id}, {self.from_status} → {self.to_status})>"


class AgentHandoffEvent(Base, BaseModel):
    """Records when tasks are handed off between agents."""
    __tablename__ = "agent_handoff_events"
    __table_args__ = (
        Index('idx_agent_handoff_task', 'task_project_id', 'task_task_number'),
        Index('idx_agent_handoff_from_agent', 'from_agent_id'),
        Index('idx_agent_handoff_to_agent', 'to_agent_id'),
        Index('idx_agent_handoff_timestamp', 'handoff_at'),
    )

    # Task reference
    task_project_id = Column(String(36), nullable=False)
    task_task_number = Column(Integer, nullable=False)
    
    # Agent handoff
    from_agent_id = Column(String(32), ForeignKey("agents.id"), nullable=True)  # Null for initial assignment
    to_agent_id = Column(String(32), ForeignKey("agents.id"), nullable=False)
    
    # Handoff details
    handoff_reason = Column(String(100), nullable=False)  # 'completion', 'escalation', 'specialization', 'timeout'
    handoff_criteria_id = Column(String(32), ForeignKey("agent_handoff_criteria.id"), nullable=True)
    
    # Context transfer
    handoff_context = Column(JSONText, nullable=True)
    progress_summary = Column(Text, nullable=True)
    blockers_summary = Column(Text, nullable=True)
    
    # Timing
    handoff_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    accepted_at = Column(DateTime, nullable=True)
    
    # Status
    status = Column(String(20), default='pending', nullable=False)  # pending, accepted, rejected
    rejection_reason = Column(Text, nullable=True)
    
    # Relationships
    from_agent = relationship("Agent", foreign_keys=[from_agent_id])
    to_agent = relationship("Agent", foreign_keys=[to_agent_id])
    handoff_criteria = relationship("AgentHandoffCriteria")
    
    def __repr__(self):
        return f"<AgentHandoffEvent(id={self.id}, {self.from_agent_id} → {self.to_agent_id}, reason='{self.handoff_reason}')>"


class AgentPerformanceMetric(Base, BaseModel):
    """Tracks agent performance metrics for analysis and optimization."""
    __tablename__ = "agent_performance_metrics"
    __table_args__ = (
        Index('idx_agent_performance_agent', 'agent_id'),
        Index('idx_agent_performance_period', 'metric_period_start', 'metric_period_end'),
        Index('idx_agent_performance_type', 'metric_type'),
    )

    agent_id = Column(String(32), ForeignKey("agents.id"), nullable=False)
    
    # Metric details
    metric_type = Column(String(50), nullable=False)  # 'task_completion', 'avg_duration', 'error_rate', 'handoff_rate'
    metric_value = Column(Numeric(15, 4), nullable=False)
    metric_unit = Column(String(20), nullable=True)  # 'count', 'seconds', 'percentage', 'rate'
    
    # Time period
    metric_period_start = Column(DateTime, nullable=False)
    metric_period_end = Column(DateTime, nullable=False)
    
    # Context
    task_count = Column(Integer, default=0, nullable=False)
    context_filters = Column(JSONText, nullable=True)  # Filters applied to calculate metric
    
    # Comparative analysis
    baseline_value = Column(Numeric(15, 4), nullable=True)
    performance_rating = Column(String(20), nullable=True)  # 'excellent', 'good', 'average', 'needs_improvement'
    
    # Relationships
    agent = relationship("Agent")
    
    def __repr__(self):
        return f"<AgentPerformanceMetric(id={self.id}, agent={self.agent_id}, type='{self.metric_type}', value={self.metric_value})>"