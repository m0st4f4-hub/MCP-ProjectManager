"""
Project Template Model
"""
from sqlalchemy import Column, String, Text
from .base import BaseModel, Base

class ProjectTemplate(Base, BaseModel):
    __tablename__ = 'project_templates'

    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    template_data = Column(Text, nullable=False)
