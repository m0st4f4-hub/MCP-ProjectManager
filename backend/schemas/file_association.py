# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

# Forward references for relationships
Project = "Project"
MemoryEntity = "MemoryEntity"
Task = "Task"

# --- Task File Association Schemas ---


class TaskFileAssociationBase(BaseModel):
    """Base schema for task-file association attributes."""
    task_project_id: str = Field(
        ..., description="The project ID of the associated task."
    )
    task_task_number: int = Field(
        ..., description="The task number within the project."
    )
    file_memory_entity_id: int = Field(
        ..., description="The ID of the associated file MemoryEntity."
    )


class TaskFileAssociationCreate(TaskFileAssociationBase):
    pass


class TaskFileAssociation(TaskFileAssociationBase):
    """Schema for representing a task-file association in API responses."""
    # The response schema should include the related file entity
    file_entity: Optional[MemoryEntity] = Field(
        None,
        description=(
            "The memory entity representing the file "
            "(populated from ORM)."
        )
    )
    # task: Optional[Task] = Field(
    #     None,
    #     description=(
    #         "The associated task (populated from ORM)."
    #     )
    # )
    # Removed to simplify schema, can be fetched separately if needed

    model_config = ConfigDict(
        from_attributes=True
    )

# --- Project File Association Schemas ---
# ProjectFileAssociation schemas are defined in backend/schemas/project.py.
# This file only contains TaskFileAssociation schemas.
# Removed duplicate schemas, they are defined in backend/schemas/project.py
# class ProjectFileAssociationBase(BaseModel):
#     """Base schema for project-file association attributes."""
#     project_id: str = Field(
#         ...,
#         description="The ID of the associated project."
#     )
#     file_memory_entity_id: int = Field(
#         ...,
#         description="The ID of the associated file MemoryEntity."
#     )
# class ProjectFileAssociationCreate(ProjectFileAssociationBase):
#     pass
# class ProjectFileAssociation(ProjectFileAssociationBase):
#     """Schema for representing a project-file association in API responses."""
#     project: Optional[Project] = Field(
#         None,
#         description=(
#             "The project this file is associated with "
#             "(populated from ORM)."
#         )
#     )
#     file_entity: Optional[MemoryEntity] = Field(
#         None,
#         description=(
#             "The memory entity representing the file "
#             "(populated from ORM)."
#         )
#     )
#     model_config = ConfigDict(from_attributes=True)
#
# --- End of Project File Association Schemas ---
