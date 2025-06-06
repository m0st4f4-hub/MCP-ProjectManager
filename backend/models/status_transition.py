from sqlalchemy import Column, Integer, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from backend.enums import TaskStatusEnum

class StatusTransition(Base):
    """Allowed status transitions for tasks."""
    __tablename__ = "status_transitions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    from_status: Mapped[TaskStatusEnum] = mapped_column(Enum(TaskStatusEnum))
    to_status: Mapped[TaskStatusEnum] = mapped_column(Enum(TaskStatusEnum))
