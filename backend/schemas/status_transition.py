from enums import TaskStatusEnum
from .base import BaseSchema
from pydantic import BaseModel, ConfigDict
from typing import List
from datetime import datetime

class StatusTransitionBase(BaseSchema):
    from_status: TaskStatusEnum
    to_status: TaskStatusEnum

class StatusTransitionCreate(StatusTransitionBase):
    pass

class StatusTransition(StatusTransitionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
