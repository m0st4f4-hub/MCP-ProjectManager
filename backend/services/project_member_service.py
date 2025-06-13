"""
Project member service for handling project membership operations.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from ..crud.project_members import (
    create_project_member,
    get_project_member,
    get_project_members_by_project,
    delete_project_member,
    update_project_member
)
from ..schemas.project import ProjectMemberCreate, ProjectMemberUpdate
from ..models import ProjectMember
from .exceptions import EntityNotFoundError


class ProjectMemberService:
    def __init__(self, db: Session):
        self.db = db

    def get_member(self, project_id: str, user_id: str) -> Optional[ProjectMember]:  # Use the CRUD function
        return get_project_member(self.db, project_id, user_id)

    def get_members_by_project(self, project_id: str, skip: int = 0, limit: int = 100) -> List[ProjectMember]:
        """
        Retrieve members for a project.
        """  # Use the CRUD function
        return get_project_members_by_project(self.db, project_id, skip=skip, limit=limit)

    def get_projects_for_user(self, user_id: str, skip: int = 0, limit: int = 100) -> List[ProjectMember]:
        """
        Retrieve projects a user is a member of.
        """
        return get_project_members_by_project(self.db, user_id, skip=skip, limit=limit)

    def add_member_to_project(self, project_id: str, user_id: str, role: str) -> ProjectMember:  # Use the CRUD function for creation and validation
        project_member_schema = ProjectMemberCreate(
            project_id=project_id, user_id=user_id, role=role)
        return create_project_member(self.db, project_member_schema)

    def remove_member_from_project(self, project_id: str, user_id: str) -> bool:  # Use the CRUD function
        return delete_project_member(self.db, project_id, user_id)

    def update_member_role(self, project_id: str, user_id: str, new_role: str) -> Optional[ProjectMember]:  # Use the CRUD function
        project_member_update_schema = ProjectMemberUpdate(role=new_role)
        return update_project_member(self.db, project_id, user_id, project_member_update_schema)
