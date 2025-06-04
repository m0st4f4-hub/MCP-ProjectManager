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
