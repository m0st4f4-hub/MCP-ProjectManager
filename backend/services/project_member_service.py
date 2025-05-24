from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from typing import List, Optional


class ProjectMemberService:
    def __init__(self, db: Session):
        self.db = db

    def get_member(self, project_id: str, user_id: str) -> Optional[models.ProjectMember]:
        return self.db.query(models.ProjectMember).filter(
            models.ProjectMember.project_id == project_id,
            models.ProjectMember.user_id == user_id
        ).first()

    def get_members_by_project(self, project_id: str, skip: int = 0, limit: int = 100) -> List[models.ProjectMember]:
        # Eagerly load the associated User object if needed
        return (
            self.db.query(models.ProjectMember)
            # .options(joinedload(models.ProjectMember.user)) # Uncomment if user relationship needs eager loading
            .filter(models.ProjectMember.project_id == project_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def add_member_to_project(self, project_id: str, user_id: str, role: str) -> Optional[models.ProjectMember]:
        # Check if member already exists
        existing_member = self.get_member(project_id, user_id)
        if existing_member:
            return existing_member  # Member already exists

        # Optional: Check if project and user exist before creating membership
        # project = self.db.query(models.Project).filter(models.Project.id == project_id).first()
        # user = self.db.query(models.User).filter(models.User.id == user_id).first()
        # if not project or not user:
        #     return None # Or raise HTTPException/ValueError depending on service design

        db_project_member = models.ProjectMember(
            project_id=project_id, user_id=user_id, role=role)
        self.db.add(db_project_member)
        self.db.commit()
        self.db.refresh(db_project_member)
        return db_project_member

    def remove_member_from_project(self, project_id: str, user_id: str) -> bool:
        db_project_member = self.get_member(project_id, user_id)
        if db_project_member:
            self.db.delete(db_project_member)
            self.db.commit()
            return True
        return False

    def update_member_role(self, project_id: str, user_id: str, new_role: str) -> Optional[models.ProjectMember]:
        db_project_member = self.get_member(project_id, user_id)
        if db_project_member:
            db_project_member.role = new_role
            self.db.commit()
            self.db.refresh(db_project_member)
            return db_project_member
        return None
