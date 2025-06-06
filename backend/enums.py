import enum

__all__ = ["TaskStatusEnum", "UserRoleEnum", "ActionType"]

class TaskStatusEnum(enum.Enum):
    """Enum for standardized task statuses."""
    TO_DO = "To Do"
    IN_PROGRESS = "In Progress"
    IN_REVIEW = "In Review"
    COMPLETED = "Completed"
    BLOCKED = "Blocked"
    CANCELLED = "Cancelled"
    CONTEXT_ACQUIRED = "Context Acquired"
    PLANNING_COMPLETE = "Planning Complete"
    EXECUTION_IN_PROGRESS = "Execution In Progress"
    PENDING_VERIFICATION = "Pending Verification"
    VERIFICATION_COMPLETE = "Verification Complete"
    VERIFICATION_FAILED = "Verification Failed"
    COMPLETED_AWAITING_PROJECT_MANAGER = "Completed Awaiting Project Manager"
    COMPLETED_HANDOFF = "Completed Handoff"
    FAILED = "Failed"
    IN_PROGRESS_AWAITING_SUBTASK = "In Progress Awaiting Subtask"
    PENDING_RECOVERY_ATTEMPT = "Pending Recovery Attempt"

class UserRoleEnum(enum.Enum):
    """Enum for user roles."""
    ADMIN = "admin"
    MANAGER = "manager"
    ENGINEER = "engineer"
    VIEWER = "viewer"
    USER = "user"
    AGENT = "agent"  # For AI agents if they have user accounts

class ActionType(enum.Enum):
    """Enum for audit log action types."""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    ASSIGN = "assign"
    COMPLETE = "complete"
