from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from typing import List, Optional
from backend.crud.project_members import (
    get_project_member,
    get_project_members,
    get_user_projects,
    add_project_member,
    update_project_member,
    delete_project_member
)  # No need to import validation helpers in service, they are used in CRUD


class ProjectMemberService:
    def __init__(self, db: Session):
        self.db = db

    def get_member(self, project_id: str, user_id: str) -> Optional[models.ProjectMember]:  # Use the CRUD function
        """Retrieve a member of a project."""
        return get_project_member(self.db, project_id, user_id)

    def get_members_by_project(self, project_id: str, skip: int = 0, limit: int = 100) -> List[models.ProjectMember]:
        """List members of a project."""
        return get_project_members(self.db, project_id, skip=skip, limit=limit)

    def get_projects_for_user(self, user_id: str, skip: int = 0, limit: int = 100) -> List[models.ProjectMember]:
        """List projects that a user belongs to."""
        return get_user_projects(self.db, user_id, skip=skip, limit=limit)

    def add_member_to_project(self, project_id: str, user_id: str, role: str) -> models.ProjectMember:  # Use the CRUD function for creation and validation
        """Add a user to a project."""
        project_member_schema = schemas.ProjectMemberCreate(
            project_id=project_id, user_id=user_id, role=role)
        return add_project_member(self.db, project_member_schema)

    def remove_member_from_project(self, project_id: str, user_id: str) -> bool:  # Use the CRUD function
        """Remove a user from a project."""
        return delete_project_member(self.db, project_id, user_id)

    def update_member_role(self, project_id: str, user_id: str, new_role: str) -> Optional[models.ProjectMember]:  # Use the CRUD function
        """Change a member's role within a project."""
        project_member_update_schema = schemas.ProjectMemberUpdate(role=new_role)
        return update_project_member(self.db, project_id, user_id, project_member_update_schema)
