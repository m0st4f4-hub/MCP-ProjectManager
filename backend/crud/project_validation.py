from sqlalchemy.orm import Session
from typing import Optional

def project_name_exists(db: Session, name: str, exclude_project_id: Optional[str] = None) -> bool:
    """
    Returns True if a project with the given name already exists.
    Optionally excludes a project by its ID when checking for duplicates.
    """
    from backend.crud.projects import get_project_by_name
    project = get_project_by_name(db, name)
    if project:
        if exclude_project_id and project.id == exclude_project_id:
            return False # The existing project is the one being updated
        return True # A different project with this name exists
    return False # No project with this name exists 