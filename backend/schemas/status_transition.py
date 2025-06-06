from backend.enums import TaskStatusEnum
from pydantic import BaseModel, ConfigDict
from typing import List

class StatusTransitionBase(BaseModel):
    from_status: TaskStatusEnum
    to_status: TaskStatusEnum

class StatusTransitionCreate(StatusTransitionBase):
    pass

class StatusTransition(StatusTransitionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
