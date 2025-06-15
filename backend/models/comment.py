"""
Simple comment model for single-user mode.
"""
from sqlalchemy import Column, String, Text, DateTime, Integer, ForeignKey
from datetime import datetime

from .base import Base, BaseModel


class Comment(Base, BaseModel):
    """Simple comment model for single-user mode."""
    __tablename__ = "comments"

    content = Column(Text, nullable=False)
    
    # Task reference (composite foreign key)
    task_project_id = Column(String(36), nullable=False, index=True)
    task_task_number = Column(Integer, nullable=False, index=True)
    
    def __repr__(self):
        return f"<Comment(id={self.id}, task={self.task_project_id}:{self.task_task_number})>"