from sqlalchemy.orm import Session
from typing import Optional  # Use AsyncSession for async operations
from sqlalchemy.ext.asyncio import AsyncSession  # Convert to async function and use AsyncSession


async def project_name_exists(db: AsyncSession, name: str, exclude_project_id: Optional[str] = None) -> bool:
    """
    Returns True if a project with the given name already exists.
    Optionally excludes a project by its ID when checking for duplicates.
    """
    from crud.projects import get_project_by_name  # Await the async function call
    project = await get_project_by_name(db, name)
    if project:
        if exclude_project_id and project.id == exclude_project_id:
            return False  # The existing project is the one being updated
        return True  # A different project with this name exists
    return False  # No project with this name exists
