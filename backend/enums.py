import enum

class TaskStatusEnum(enum.Enum):
 """Enum for standardized task statuses."""
 TO_DO = "To Do"
 IN_PROGRESS = "In Progress"
 COMPLETED = "Completed"
 BLOCKED = "Blocked"
 CANCELLED = "Cancelled"

class UserRoleEnum(enum.Enum):
 """Enum for user roles."""
 ADMIN = "admin"
 USER = "user"
 AGENT = "agent" # For AI agents if they have user accounts 