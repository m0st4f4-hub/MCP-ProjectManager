from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, UniqueConstraint, PrimaryKeyConstraint, and_, ForeignKeyConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, timezone
from typing import List, Optional
import uuid
from sqlalchemy.sql import func

from .database import Base  # Import Base from database.py


class Project(Base):
    """Represents a project in the Project Manager.

    A project acts as a container for related tasks.

    Attributes:
        id: Unique identifier for the project (UUID stored as string).
        name: Name of the project (must be unique).
        description: Optional text description of the project.
        created_at: Timestamp when the project was created.
        updated_at: Timestamp when the project was last updated.
        tasks: List of tasks associated with this project.
        is_archived: Boolean flag indicating if the project is archived.
        task_count: Number of tasks associated with this project.
    """
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=True)
    is_archived: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False)
    task_count: Mapped[int] = mapped_column(Integer, default=0)

    tasks: Mapped[List["Task"]] = relationship(
        back_populates="project", cascade="all, delete-orphan")
    project_members: Mapped[List["ProjectMember"]] = relationship(
        back_populates="project", cascade="all, delete-orphan")
    project_files: Mapped[List["ProjectFileAssociation"]] = relationship(
        back_populates="project", cascade="all, delete-orphan")
    comments_on_project: Mapped[List["Comment"]] = relationship(
        back_populates="project", cascade="all, delete-orphan")


class Agent(Base):
    """Represents an agent that can be assigned to tasks.

    Agents are entities (e.g., users, automated systems) responsible for tasks.

    Attributes:
        id: Unique identifier for the agent (UUID stored as string).
        name: Name of the agent (must be unique).
        created_at: Timestamp when the agent was created/registered.
        updated_at: Timestamp when the agent was last updated.
        tasks: List of tasks currently assigned to this agent.
        is_archived: Boolean flag indicating if the agent is archived.
    """
    __tablename__ = "agents"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, index=True)
    # Assuming agent names should be unique
    name: Mapped[str] = mapped_column(String, index=True, unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=True)

    tasks: Mapped[List["Task"]] = relationship(
        back_populates="agent", cascade="all, delete-orphan")
    agent_rules: Mapped[List["AgentRule"]] = relationship(
        back_populates="agent", cascade="all, delete-orphan")

    is_archived: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False)


class TaskDependency(Base):
    __tablename__ = "task_dependencies"
    __table_args__ = (PrimaryKeyConstraint('predecessor_project_id',
                      'predecessor_task_number', 'successor_project_id', 'successor_task_number'),)

    predecessor_project_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("tasks.project_id"))
    predecessor_task_number: Mapped[int] = mapped_column(
        Integer, ForeignKey("tasks.task_number"))
    successor_project_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("tasks.project_id"))
    successor_task_number: Mapped[int] = mapped_column(
        Integer, ForeignKey("tasks.task_number"))
    type: Mapped[str] = mapped_column(String)

    predecessor: Mapped["Task"] = relationship(
        "Task",
        primaryjoin="and_(Task.project_id == TaskDependency.predecessor_project_id, Task.task_number == TaskDependency.predecessor_task_number)",
        back_populates="dependencies_as_predecessor"
    )
    successor: Mapped["Task"] = relationship(
        "Task",
        primaryjoin="and_(Task.project_id == TaskDependency.successor_project_id, Task.task_number == TaskDependency.successor_task_number)",
        back_populates="dependencies_as_successor"
    )


class Task(Base):
    """Represents a single task in the Project Manager.

    Tasks belong to a Project and can optionally be assigned to an Agent.

    Attributes:
        project_id: Foreign key linking to the parent Project's ID.
        task_number: Integer, unique per project, starts at 1 for each project.
        title: The title or name of the task.
        description: Optional detailed description of the task.
        created_at: Timestamp when the task was created.
        updated_at: Timestamp when the task was last updated.
        agent_id: Optional foreign key linking to the assigned Agent's ID.
        project: ORM relationship to the parent Project.
        agent: ORM relationship to the assigned Agent (if any).
        status: The status of the task.
        is_archived: Boolean flag indicating if the task is archived.
    """
    __tablename__ = "tasks"
    __table_args__ = (
        PrimaryKeyConstraint('project_id', 'task_number', name='pk_tasks'),
        {"sqlite_autoincrement": True},
    )

    project_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("projects.id"))
    task_number: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=True)
    agent_id: Mapped[Optional[str]] = mapped_column(
        String(32), ForeignKey("agents.id"), nullable=True)
    project: Mapped["Project"] = relationship(back_populates="tasks")
    agent: Mapped[Optional["Agent"]] = relationship(back_populates="tasks")
    status: Mapped[str] = mapped_column(String, default="To Do")
    status_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey(
        "task_statuses.id"), nullable=True)  # Foreign key to TaskStatus
    is_archived: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False)
    task_status: Mapped[Optional["TaskStatus"]] = relationship(
        back_populates="tasks_with_status", foreign_keys="[Task.status_id]")
    dependencies_as_predecessor: Mapped[List["TaskDependency"]] = relationship(
        "TaskDependency",
        primaryjoin="and_(Task.project_id == TaskDependency.predecessor_project_id, Task.task_number == TaskDependency.predecessor_task_number)",
        back_populates="predecessor",
        cascade="all, delete-orphan"
    )
    dependencies_as_successor: Mapped[List["TaskDependency"]] = relationship(
        "TaskDependency",
        primaryjoin="and_(Task.project_id == TaskDependency.successor_project_id, Task.task_number == TaskDependency.successor_task_number)",
        back_populates="successor",
        cascade="all, delete-orphan"
    )
    task_files: Mapped[List["TaskFileAssociation"]] = relationship(
        back_populates="task",
        primaryjoin="and_(Task.project_id == TaskFileAssociation.task_project_id, Task.task_number == TaskFileAssociation.task_task_number)",
        cascade="all, delete-orphan"
    )
    comments: Mapped[List["Comment"]] = relationship(
        back_populates="task",
        foreign_keys="[Comment.task_project_id, Comment.task_task_number]",
        cascade="all, delete-orphan"
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(32), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    email: Mapped[Optional[str]] = mapped_column(
        String, unique=True, index=True, nullable=True)
    full_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    disabled: Mapped[bool] = mapped_column(Boolean, default=False)

    user_roles: Mapped[List["UserRole"]] = relationship(
        back_populates="user", cascade="all, delete-orphan")
    comments: Mapped[List["Comment"]] = relationship(
        back_populates="author", cascade="all, delete-orphan")
    project_memberships: Mapped[List["ProjectMember"]] = relationship(
        back_populates="user", cascade="all, delete-orphan")
    audit_logs: Mapped[List["AuditLog"]] = relationship(
        back_populates="user", cascade="all, delete-orphan")


class UserRole(Base):
    __tablename__ = "user_roles"
    __table_args__ = (PrimaryKeyConstraint('user_id', 'role_name'),)

    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id"))
    role_name: Mapped[str] = mapped_column(
        String)  # e.g., "admin", "member", "agent"

    user: Mapped["User"] = relationship(back_populates="user_roles")


class ProjectTemplate(Base):
    __tablename__ = "project_templates"

    id: Mapped[str] = mapped_column(
        String(32), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Assuming a relationship to default tasks/roles defined elsewhere or through a linking table
    # For now, no direct relationship defined here.


class AgentRule(Base):
    __tablename__ = "agent_rules"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    agent_id: Mapped[str] = mapped_column(String(32), ForeignKey("agents.id"))
    # e.g., "constraint", "guideline", "protocol"
    rule_type: Mapped[str] = mapped_column(String)
    rule_content: Mapped[Text] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    agent: Mapped["Agent"] = relationship(back_populates="agent_rules")


class TaskStatus(Base):
    __tablename__ = "task_statuses"

    # Use integer primary key for status order/enumeration
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    # e.g., "To Do", "In Progress", "Done"
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(
        Integer, unique=True, index=True)  # For defining workflow order
    is_final: Mapped[bool] = mapped_column(
        Boolean, default=False)  # Indicates a completed status

    tasks_with_status: Mapped[List["Task"]] = relationship(
        back_populates="task_status")  # Assuming Task has task_status_id foreign key


class ProjectFileAssociation(Base):
    __tablename__ = "project_file_associations"
    __table_args__ = (PrimaryKeyConstraint('project_id', 'file_memory_entity_name'),)

    project_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("projects.id"))
    # Use file_memory_entity_name (file path) as the identifier and part of the primary key
    file_memory_entity_name: Mapped[str] = mapped_column(String, index=True)

    # Removed file_id column and relationship
    project: Mapped["Project"] = relationship(back_populates="project_files")


class TaskFileAssociation(Base):
    __tablename__ = "task_file_associations"
    __table_args__ = (PrimaryKeyConstraint(
        'task_project_id', 'task_task_number', 'file_memory_entity_name'),)

    task_project_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("tasks.project_id"))
    task_task_number: Mapped[int] = mapped_column(
        Integer, ForeignKey("tasks.task_number"))
    # Use file_memory_entity_name (file path) as the identifier and part of the primary key
    file_memory_entity_name: Mapped[str] = mapped_column(String, index=True)

    # Removed file_id column and relationship
    task: Mapped["Task"] = relationship(
        back_populates="task",
        primaryjoin="and_(Task.project_id == TaskFileAssociation.task_project_id, Task.task_number == TaskFileAssociation.task_task_number)"
    )


class Comment(Base):
    __tablename__ = "comments"
    __table_args__ = (
        ForeignKeyConstraint(
            ['task_project_id', 'task_task_number'],
            ['tasks.project_id', 'tasks.task_number']
        ),
        {}
    )

    id: Mapped[str] = mapped_column(
        String(32), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    task_project_id: Mapped[Optional[str]] = mapped_column(String(32), nullable=True) # Removed ForeignKey here
    task_task_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True) # Removed ForeignKey here
    project_id: Mapped[Optional[str]] = mapped_column(String(32), ForeignKey(
        "projects.id"), nullable=True)  # Allow comments on projects too
    author_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id"))
    content: Mapped[Text] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=True)

    task: Mapped[Optional["Task"]] = relationship(
        back_populates="comments"
    )
    project: Mapped[Optional["Project"]] = relationship(
        back_populates="comments_on_project")  # Assuming Project needs a back_populates
    author: Mapped["User"] = relationship(back_populates="comments")


class ProjectMember(Base):
    __tablename__ = "project_members"
    __table_args__ = (PrimaryKeyConstraint('project_id', 'user_id'),)

    project_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("projects.id"))
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id"))
    # e.g., "owner", "collaborator", "viewer"
    role: Mapped[str] = mapped_column(String)

    project: Mapped["Project"] = relationship(back_populates="project_members")
    user: Mapped["User"] = relationship(back_populates="project_memberships")


class AuditLog(Base):
    __tablename__ = "audit_log"

    # Auto-incrementing integer PK for logs
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))
    user_id: Mapped[Optional[str]] = mapped_column(String(32), ForeignKey(
        # User who performed action (can be null for system actions)
        "users.id"), nullable=True)
    # e.g., "create", "update", "delete", "assign"
    action: Mapped[str] = mapped_column(String)
    entity_type: Mapped[str] = mapped_column(
        String)  # e.g., "task", "project", "user"
    # ID of the affected entity (can be composite, store as string or JSON)
    entity_id: Mapped[str] = mapped_column(String)
    details: Mapped[Optional[Text]] = mapped_column(
        Text, nullable=True)  # JSON or text details of the change

    user: Mapped[Optional["User"]] = relationship(back_populates="audit_logs")


# Base.metadata.create_all(bind=engine) # REMOVED This is typically handled by Alembic


# === RULES FRAMEWORK MODELS ===

class UniversalMandate(Base):
    """Universal mandates that apply to all agents"""
    __tablename__ = "universal_mandates"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=5)  # 1-10 scale
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class AgentRole(Base):
    """Agent role definitions that match with Agent names"""
    __tablename__ = "agent_roles"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)  # Must match Agent.name
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    primary_purpose: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    capabilities: Mapped[List["AgentCapability"]] = relationship(back_populates="agent_role", cascade="all, delete-orphan")
    forbidden_actions: Mapped[List["AgentForbiddenAction"]] = relationship(back_populates="agent_role", cascade="all, delete-orphan")
    verification_requirements: Mapped[List["AgentVerificationRequirement"]] = relationship(back_populates="agent_role", cascade="all, delete-orphan")
    handoff_criteria: Mapped[List["AgentHandoffCriteria"]] = relationship(back_populates="agent_role", cascade="all, delete-orphan")
    error_protocols: Mapped[List["AgentErrorProtocol"]] = relationship(back_populates="agent_role", cascade="all, delete-orphan")
    workflow_steps: Mapped[List["WorkflowStep"]] = relationship(back_populates="agent_role")
    prompt_templates: Mapped[List["AgentPromptTemplate"]] = relationship(back_populates="agent_role")


class AgentCapability(Base):
    """Capabilities that an agent role can perform"""
    __tablename__ = "agent_capabilities"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    agent_role_id: Mapped[str] = mapped_column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    capability: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    agent_role: Mapped["AgentRole"] = relationship(back_populates="capabilities")


class AgentForbiddenAction(Base):
    """Actions that an agent role is forbidden from performing"""
    __tablename__ = "agent_forbidden_actions"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    agent_role_id: Mapped[str] = mapped_column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    agent_role: Mapped["AgentRole"] = relationship(back_populates="forbidden_actions")


class AgentVerificationRequirement(Base):
    """Verification requirements for an agent role"""
    __tablename__ = "agent_verification_requirements"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    agent_role_id: Mapped[str] = mapped_column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    requirement: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    agent_role: Mapped["AgentRole"] = relationship(back_populates="verification_requirements")


class AgentHandoffCriteria(Base):
    """Criteria for when an agent hands off to another agent"""
    __tablename__ = "agent_handoff_criteria"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    agent_role_id: Mapped[str] = mapped_column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    criteria: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    target_agent_role: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    agent_role: Mapped["AgentRole"] = relationship(back_populates="handoff_criteria")


class AgentErrorProtocol(Base):
    """Error handling protocols for agent roles"""
    __tablename__ = "agent_error_protocols"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    agent_role_id: Mapped[str] = mapped_column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    error_type: Mapped[str] = mapped_column(String(100), nullable=False)
    protocol: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=5)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    agent_role: Mapped["AgentRole"] = relationship(back_populates="error_protocols")


class Workflow(Base):
    """Project workflows"""
    __tablename__ = "workflows"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    workflow_type: Mapped[str] = mapped_column(String(100), nullable=False)
    entry_criteria: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON as text
    success_criteria: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON as text
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    steps: Mapped[List["WorkflowStep"]] = relationship(back_populates="workflow", cascade="all, delete-orphan")


class WorkflowStep(Base):
    """Individual steps in a workflow"""
    __tablename__ = "workflow_steps"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    workflow_id: Mapped[str] = mapped_column(String(32), ForeignKey("workflows.id"), nullable=False)
    agent_role_id: Mapped[str] = mapped_column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    step_order: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    prerequisites: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON as text
    expected_outputs: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON as text
    verification_points: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON as text
    estimated_duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    workflow: Mapped["Workflow"] = relationship(back_populates="steps")
    agent_role: Mapped["AgentRole"] = relationship(back_populates="workflow_steps")


class AgentPromptTemplate(Base):
    """Prompt templates for different agent roles"""
    __tablename__ = "agent_prompt_templates"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    agent_role_id: Mapped[str] = mapped_column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    template_name: Mapped[str] = mapped_column(String(255), nullable=False)
    template_content: Mapped[str] = mapped_column(Text, nullable=False)
    variables: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON as text
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    agent_role: Mapped["AgentRole"] = relationship(back_populates="prompt_templates")


class AgentRuleViolation(Base):
    """Log of rule violations by agents"""
    __tablename__ = "agent_rule_violations"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    agent_name: Mapped[str] = mapped_column(String(255), nullable=False)  # Links to Agent.name
    agent_role_id: Mapped[str] = mapped_column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    violation_type: Mapped[str] = mapped_column(String(100), nullable=False)
    violation_description: Mapped[str] = mapped_column(Text, nullable=False)
    task_project_id: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)  # Task's project_id
    task_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # Task's task_number
    severity: Mapped[str] = mapped_column(String(50), default="medium")
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    agent_role: Mapped["AgentRole"] = relationship()


class AgentBehaviorLog(Base):
    """Log of agent behaviors and actions for analysis"""
    __tablename__ = "agent_behavior_logs"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: str(uuid.uuid4()).replace('-', ''))
    agent_name: Mapped[str] = mapped_column(String(255), nullable=False)  # Links to Agent.name
    agent_role_id: Mapped[str] = mapped_column(String(32), ForeignKey("agent_roles.id"), nullable=False)
    task_project_id: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)  # Task's project_id
    task_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # Task's task_number
    action_type: Mapped[str] = mapped_column(String(100), nullable=False)
    action_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    action_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON as text
    success: Mapped[bool] = mapped_column(Boolean, default=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    agent_role: Mapped["AgentRole"] = relationship()


class MemoryEntity(Base):
    """Represents an entity in the knowledge graph."""
    __tablename__ = "memory_entities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True) # Assuming integer PK based on CRUD usage
    type: Mapped[str] = mapped_column(String, index=True) # e.g., "concept", "person", "project", "task", "agent", "file", "finding"
    name: Mapped[str] = mapped_column(String, unique=True, index=True) # Unique name for the entity
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[Optional[dict]] = mapped_column(Text, nullable=True) # Assuming metadata can be stored as text/JSON

    observations: Mapped[List["MemoryObservation"]] = relationship(
        back_populates="entity", cascade="all, delete-orphan")
    relations_as_from: Mapped[List["MemoryRelation"]] = relationship(
        "MemoryRelation", foreign_keys="[MemoryRelation.from_entity_id]", back_populates="from_entity", cascade="all, delete-orphan")
    relations_as_to: Mapped[List["MemoryRelation"]] = relationship(
        "MemoryEntity", foreign_keys="[MemoryRelation.to_entity_id]", back_populates="relations_as_to")


class MemoryObservation(Base):
    """Represents an observation associated with a memory entity."""
    __tablename__ = "memory_observations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True) # Assuming integer PK
    entity_id: Mapped[int] = mapped_column(Integer, ForeignKey("memory_entities.id"))
    content: Mapped[Text] = mapped_column(Text) # The observation text or data
    source: Mapped[Optional[str]] = mapped_column(String, nullable=True) # Source of the observation
    metadata_: Mapped[Optional[dict]] = mapped_column(Text, nullable=True) # Assuming metadata can be stored as text/JSON
    timestamp: Mapped[datetime] = mapped_column( # Renamed from created_at for schema consistency
        DateTime, default=lambda: datetime.now(timezone.utc))

    entity: Mapped["MemoryEntity"] = relationship(back_populates="observations")


class MemoryRelation(Base):
    """Represents a directed relationship between two memory entities."""
    __tablename__ = "memory_relations"
    __table_args__ = (UniqueConstraint('from_entity_id', 'to_entity_id', 'relation_type', name='uq_from_to_relation'),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True) # Assuming integer PK
    from_entity_id: Mapped[int] = mapped_column(Integer, ForeignKey("memory_entities.id"))
    to_entity_id: Mapped[int] = mapped_column(Integer, ForeignKey("memory_entities.id"))
    relation_type: Mapped[str] = mapped_column(String, index=True) # e.g., "related_to", "depends_on"
    metadata_: Mapped[Optional[dict]] = mapped_column(Text, nullable=True) # Assuming metadata can be stored as text/JSON
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc))

    from_entity: Mapped["MemoryEntity"] = relationship(
        "MemoryEntity", foreign_keys="[MemoryRelation.from_entity_id]", back_populates="relations_as_from")
    to_entity: Mapped["MemoryEntity"] = relationship(
        "MemoryEntity", foreign_keys="[MemoryRelation.to_entity_id]", back_populates="relations_as_to")


# Add back the ProjectFileAssociation and TaskFileAssociation definitions here, after Memory models
# to ensure relationships can be defined if needed. Though direct ORM relationships might not be needed
# if we link via MemoryEntity name.










