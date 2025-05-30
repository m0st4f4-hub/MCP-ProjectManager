"""
Comment model for tasks and projects.
"""

from sqlalchemy import String, Integer, ForeignKey, ForeignKeyConstraint, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional

from .base import Base, BaseModel, generate_uuid_with_hyphens


class Comment(Base, BaseModel):
 """Comments on tasks and projects."""
 __tablename__ = "comments"
 __table_args__ = (
 ForeignKeyConstraint(
 ['task_project_id', 'task_task_number'],
 ['tasks.project_id', 'tasks.task_number']
 ),
 {}
 )

 id: Mapped[str] = mapped_column(
 String(32), primary_key=True, default=generate_uuid_with_hyphens, index=True)
 task_project_id: Mapped[Optional[str]] = mapped_column(
 String(32), nullable=True)
 task_task_number: Mapped[Optional[int]] = mapped_column(
 Integer, nullable=True)
 project_id: Mapped[Optional[str]] = mapped_column(
 String(32), ForeignKey("projects.id"), nullable=True)
 author_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id"))
 content: Mapped[Text] = mapped_column(Text)

 task: Mapped[Optional["Task"]] = relationship(
 back_populates="comments",
 foreign_keys=[task_project_id, task_task_number]
 )
 project: Mapped[Optional["Project"]] = relationship(
 back_populates="comments_on_project")
 author: Mapped["User"] = relationship(back_populates="comments")
