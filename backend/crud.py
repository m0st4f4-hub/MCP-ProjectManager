from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import or_, func
from . import models, schemas
import datetime
from typing import Optional, List
import uuid
from fastapi import HTTPException
import inspect

# Removed task-related CRUD functions - now in backend/crud/tasks.py

# Removed project-related CRUD functions - now in backend/crud/projects.py

# Removed agent-related CRUD functions - now in backend/crud/agents.py


def check_and_auto_archive_project(db: Session, project_id: str):
    project = get_project(db, project_id, is_archived=False)
    if not project:
        return

    # Count non-archived, non-completed tasks for this project
    active_tasks_count = (
        db.query(models.Task)
        .filter(models.Task.project_id == project_id)
        .filter(models.Task.is_archived == False)
        # Assuming "Completed" is the final status
        .filter(models.Task.status != "Completed")
        .count()
    )

    if active_tasks_count == 0:
        # All tasks are completed (or archived), so archive the project
        project.is_archived = True
        project.updated_at = datetime.datetime.now(datetime.timezone.utc)
        # Also archive all its non-archived tasks
        tasks_to_archive = db.query(models.Task).filter(
            models.Task.project_id == project_id,
            models.Task.is_archived == False
        ).all()
        for task in tasks_to_archive:
            task.is_archived = True
            task.updated_at = datetime.datetime.now(datetime.timezone.utc)
        db.commit()
        db.refresh(project)
        print(
            f"[CRUD check_and_auto_archive_project] Auto-archived project {project_id} and its remaining tasks.")

# --- Archive/Unarchive Functions ---


def archive_project(db: Session, project_id: str) -> Optional[models.Project]:
    # Get project regardless of current status
    project = get_project(db, project_id, is_archived=None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.is_archived:
        # Optionally, could raise an error or just return the project if already archived
        print(f"Project {project_id} is already archived.")
        return project

    project.is_archived = True
    project.updated_at = datetime.datetime.now(datetime.timezone.utc)

    # Archive all non-archived tasks under this project
    tasks_to_archive = (
        db.query(models.Task)
        .filter(models.Task.project_id == project_id)
        .filter(models.Task.is_archived == False)
        .all()
    )
    for task in tasks_to_archive:
        task.is_archived = True
        task.updated_at = datetime.datetime.now(datetime.timezone.utc)

    db.commit()
    db.refresh(project)
    # Refresh tasks if needed for the return value, though Project schema doesn't nest them by default here
    return project


def unarchive_project(db: Session, project_id: str) -> Optional[models.Project]:
    # Ensure we are unarchiving an archived project
    project = get_project(db, project_id, is_archived=True)
    if not project:
        # If not found while filtering for is_archived=True, it's either not archived or doesn't exist
        check_exists = get_project(db, project_id, is_archived=None)
        if not check_exists:
            raise HTTPException(status_code=404, detail="Project not found")
        else:
            # Project exists but is not archived
            print(f"Project {project_id} is not currently archived.")
            return check_exists  # Return the project as is

    project.is_archived = False
    project.updated_at = datetime.datetime.now(datetime.timezone.utc)

    # Unarchive all archived tasks under this project that were presumably archived with the project
    # Or, perhaps only unarchive tasks if the user explicitly wants to?
    # Current decision: Unarchiving a project also unarchives its tasks.
    tasks_to_unarchive = (
        db.query(models.Task)
        .filter(models.Task.project_id == project_id)
        # Only unarchive tasks that are currently archived
        .filter(models.Task.is_archived == True)
        .all()
    )
    for task in tasks_to_unarchive:
        task.is_archived = False
        task.updated_at = datetime.datetime.now(datetime.timezone.utc)

    db.commit()
    db.refresh(project)
    return project

# Removed task archive/unarchive functions - now in backend/crud/tasks.py

# Placeholder for Agent archival logic if needed in the future
# def archive_agent(db: Session, agent_id: str): ...
# def unarchive_agent(db: Session, agent_id: str): ...

# Removed task delete/update functions - now in backend/crud/tasks.py


def get_task(db: Session, task_id: int):
    return db.query(models.Task).filter(models.Task.id == task_id).first()


def get_tasks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Task).offset(skip).limit(limit).all()


def create_task(db: Session, task: schemas.TaskCreate, user_id: int):
    db_task = models.Task(**task.model_dump(), owner_id=user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, task_id: int, task: schemas.TaskUpdate):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task:
        for key, value in task.model_dump(exclude_unset=True).items():
            setattr(db_task, key, value)
        db.commit()
        db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: int):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task:
        db.delete(db_task)
        db.commit()
    return db_task


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    # Placeholder for actual password hashing
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = models.User(
        email=user.email, hashed_password=fake_hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        for key, value in user.model_dump(exclude_unset=True).items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user


def get_items(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Item).offset(skip).limit(limit).all()


def create_user_item(db: Session, item: schemas.ItemCreate, user_id: int):
    db_item = models.Item(**item.model_dump(), owner_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_item(db: Session, item_id: int, item: schemas.ItemUpdate):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item:
        for key, value in item.model_dump(exclude_unset=True).items():
            setattr(db_item, key, value)
        db.commit()
        db.refresh(db_item)
    return db_item


def delete_item(db: Session, item_id: int):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item


def create_note(db: Session, note: schemas.NoteCreate, owner_id: int):
    db_note = models.Note(**note.model_dump(), owner_id=owner_id)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


def get_note(db: Session, note_id: int):
    return db.query(models.Note).filter(models.Note.id == note_id).first()


def get_notes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Note).offset(skip).limit(limit).all()


def update_note(db: Session, note_id: int, note: schemas.NoteUpdate):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if db_note:
        for key, value in note.model_dump(exclude_unset=True).items():
            setattr(db_note, key, value)
        db.commit()
        db.refresh(db_note)
    return db_note


def delete_note(db: Session, note_id: int):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if db_note:
        db.delete(db_note)
        db.commit()
    return db_note


def create_comment(db: Session, comment: schemas.CommentCreate, owner_id: int):
    db_comment = models.Comment(**comment.model_dump(), owner_id=owner_id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


def get_comment(db: Session, comment_id: int):
    return db.query(models.Comment).filter(models.Comment.id == comment_id).first()


def get_comments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Comment).offset(skip).limit(limit).all()


def update_comment(db: Session, comment_id: int, comment: schemas.CommentUpdate):
    db_comment = db.query(models.Comment).filter(
        models.Comment.id == comment_id).first()
    if db_comment:
        for key, value in comment.model_dump(exclude_unset=True).items():
            setattr(db_comment, key, value)
        db.commit()
        db.refresh(db_comment)
    return db_comment


def delete_comment(db: Session, comment_id: int):
    db_comment = db.query(models.Comment).filter(
        models.Comment.id == comment_id).first()
    if db_comment:
        db.delete(db_comment)
        db.commit()
    return db_comment


def create_project(db: Session, project: schemas.ProjectCreate, owner_id: int):
    db_project = models.Project(**project.model_dump(), owner_id=owner_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()


def get_projects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Project).offset(skip).limit(limit).all()


def update_project(db: Session, project_id: int, project: schemas.ProjectUpdate):
    db_project = db.query(models.Project).filter(
        models.Project.id == project_id).first()
    if db_project:
        for key, value in project.model_dump(exclude_unset=True).items():
            setattr(db_project, key, value)
        db.commit()
        db.refresh(db_project)
    return db_project


def delete_project(db: Session, project_id: int):
    db_project = db.query(models.Project).filter(
        models.Project.id == project_id).first()
    if db_project:
        db.delete(db_project)
        db.commit()
    return db_project


def create_status(db: Session, status: schemas.StatusCreate, owner_id: int):
    db_status = models.Status(**status.model_dump(), owner_id=owner_id)
    db.add(db_status)
    db.commit()
    db.refresh(db_status)
    return db_status


def get_status(db: Session, status_id: int):
    return db.query(models.Status).filter(models.Status.id == status_id).first()


def get_statuses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Status).offset(skip).limit(limit).all()


def update_status(db: Session, status_id: int, status: schemas.StatusUpdate):
    db_status = db.query(models.Status).filter(
        models.Status.id == status_id).first()
    if db_status:
        for key, value in status.model_dump(exclude_unset=True).items():
            setattr(db_status, key, value)
        db.commit()
        db.refresh(db_status)
    return db_status


def delete_status(db: Session, status_id: int):
    db_status = db.query(models.Status).filter(
        models.Status.id == status_id).first()
    if db_status:
        db.delete(db_status)
        db.commit()
    return db_status
