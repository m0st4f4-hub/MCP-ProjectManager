import enum

class TaskStatusEnum(enum.Enum):
    """Enum for standardized task statuses."""
    TO_DO = "To Do"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    BLOCKED = "Blocked"
    CANCELLED = "Cancelled" 