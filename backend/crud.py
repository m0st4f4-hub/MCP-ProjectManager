from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import or_, func
from . import models, schemas
import datetime
from typing import Optional, List
import uuid
from fastapi import HTTPException

def get_task(db: Session, task_id: str, is_archived: Optional[bool] = False):
    # Eagerly load project, agent, and subtasks (recursively if needed, or to a certain depth)
    # For simplicity, loading one level of subtasks here.
    # Adjust selectinload(models.Task.children) for deeper loading if necessary.
    query = (
        db.query(models.Task)
        .options(
            joinedload(models.Task.project),
            joinedload(models.Task.agent)
            # selectinload(models.Task.subtasks) # UPDATED from children # REMOVED
        )
        .filter(models.Task.id == task_id)
    )
    if is_archived is not None:
        query = query.filter(models.Task.is_archived == is_archived)
    return query.first()

def get_tasks(
    db: Session, 
    skip: int = 0, 
    limit: int = 10000, 
    project_id: Optional[str] = None, 
    agent_id: Optional[str] = None,
    agent_name: Optional[str] = None, # Added agent_name
    search: Optional[str] = None,
    status: Optional[str] = None,
    is_archived: Optional[bool] = False
):
    print(f"[CRUD get_tasks] Received project_id: {project_id}, agent_id: {agent_id}, agent_name: {agent_name}, search: {search}, status: {status}, is_archived: {is_archived}, skip: {skip}, limit: {limit}")
    
    effective_limit = limit

    query = db.query(models.Task).options(selectinload(models.Task.project), selectinload(models.Task.agent))

    if project_id:
        query = query.filter(models.Task.project_id == project_id)

    if agent_id:
        query = query.filter(models.Task.agent_id == agent_id)
    elif agent_name:
        query = query.join(models.Agent).filter(models.Agent.name == agent_name)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Task.title.ilike(search_term),
                models.Task.description.ilike(search_term)
            )
        )
    
    if status is not None:
        query = query.filter(models.Task.status == status)

    if is_archived is not None:
        query = query.filter(models.Task.is_archived == is_archived)

    print(f"[CRUD get_tasks] Query before offset/limit: {query}")
    
    tasks_list = query.order_by(models.Task.created_at.desc()).offset(skip).limit(effective_limit).all()
    print(f"[CRUD get_tasks] Number of results returned: {len(tasks_list)} (skip: {skip}, limit: {effective_limit})")
    return tasks_list

def create_task(db: Session, task: schemas.TaskCreate):
    # Validate project_id
    if not get_project(db, project_id=task.project_id):
        raise ValueError(f"Project with id {task.project_id} not found")

    agent_id_to_use = task.agent_id
    if not agent_id_to_use and task.agent_name:
        agent = get_agent_by_name(db, name=task.agent_name)
        if not agent:
            raise ValueError(f"Agent with name '{task.agent_name}' not found")
        agent_id_to_use = agent.id
    # If task.agent_id is provided, it takes precedence. If both are None, agent_id_to_use remains None.

    task_data_for_model = task.model_dump(exclude_unset=True, exclude={'agent_name'}) # Exclude agent_name from model dict
    task_data_for_model['agent_id'] = agent_id_to_use # Ensure agent_id is set correctly
    if 'status' not in task_data_for_model or not task_data_for_model['status']:
        task_data_for_model['status'] = 'To Do'

    task_id_str = str(uuid.uuid4().hex)
    db_task = models.Task(id=task_id_str, **task_data_for_model)
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    db.refresh(db_task, attribute_names=['project', 'agent']) # CORRECTED
    return db_task

def update_task(db: Session, task_id: str, task_update: schemas.TaskUpdate):
    db_task = get_task(db, task_id=task_id, is_archived=None)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Validate project_id if provided
    if task_update.project_id:
        if not get_project(db, project_id=task_update.project_id):
            raise ValueError(f"Project with id {task_update.project_id} not found")

    # Validate agent_id if provided
    if task_update.agent_id:
        if not get_agent(db, agent_id=task_update.agent_id):
            raise ValueError(f"Agent with id {task_update.agent_id} not found")

    # Update task fields
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)

    # If status is not set, default to 'To Do'
    if not db_task.status:
        db_task.status = 'To Do'

    # Auto-archive project if all its tasks are completed
    if db_task.project_id and update_data.get("status") == "Completed":
        check_and_auto_archive_project(db, db_task.project_id)

    # Update timestamp
    db_task.updated_at = datetime.datetime.now(datetime.timezone.utc)

    db.commit()
    db.refresh(db_task)
    db.refresh(db_task, attribute_names=['project', 'agent']) # CORRECTED
    return db_task

def delete_task(db: Session, task_id: str):
    db_task = db.query(models.Task).options(
        joinedload(models.Task.project), 
        joinedload(models.Task.agent)
    ).filter(models.Task.id == task_id).first()
    if db_task:
        task_data = schemas.Task.model_validate(db_task)
        db.delete(db_task)
        db.commit()
        return task_data
    return None

def get_project(db: Session, project_id: str, is_archived: Optional[bool] = False):
    query = db.query(models.Project).filter(models.Project.id == project_id)
    if is_archived is not None:
        query = query.filter(models.Project.is_archived == is_archived)
    project = query.first()
    if project:
        # Calculate total task count (only non-archived tasks for an active project view)
        task_query = db.query(func.count(models.Task.id)).filter(models.Task.project_id == project_id)
        if not project.is_archived:
            task_query = task_query.filter(models.Task.is_archived == False)
        total_task_count = task_query.scalar()

        project.task_count = total_task_count if total_task_count is not None else 0
        # Remove completed_task_count logic
        project.completed_task_count = 0
    return project

def get_project_by_name(db: Session, name: str, is_archived: Optional[bool] = False):
    query = db.query(models.Project).filter(models.Project.name == name)
    if is_archived is not None:
        query = query.filter(models.Project.is_archived == is_archived)
    project = query.first()
    if project:
        # Calculate total task count (only non-archived tasks for an active project view)
        task_query = db.query(func.count(models.Task.id)).filter(models.Task.project_id == project.id)
        if not project.is_archived:
            task_query = task_query.filter(models.Task.is_archived == False)
        total_task_count = task_query.scalar()
        
        project.task_count = total_task_count if total_task_count is not None else 0
        # Remove completed_task_count logic
        project.completed_task_count = 0
    return project

def get_projects(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, status: Optional[str] = None, is_archived: Optional[bool] = False):
    query = db.query(models.Project)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Project.name.ilike(search_term),
                models.Project.description.ilike(search_term)
            )
        )
    # Status filtering logic would go here if Project model had a status field
    # if status:
    #     query = query.filter(models.Project.status == status) # Example
    
    if is_archived is not None:
        query = query.filter(models.Project.is_archived == is_archived)
        
    projects = query.order_by(models.Project.name).offset(skip).limit(limit).all()
    
    # Calculate task counts for each project
    for project_item in projects:
        task_query = db.query(func.count(models.Task.id)).filter(models.Task.project_id == project_item.id)
        if not project_item.is_archived:
            task_query = task_query.filter(models.Task.is_archived == False)
        total_task_count = task_query.scalar()
        project_item.task_count = total_task_count if total_task_count is not None else 0
        # Remove completed_task_count logic
        project_item.completed_task_count = 0

    return projects

def create_project(db: Session, project: schemas.ProjectCreate):
    project_id = str(uuid.uuid4())
    db_project = models.Project(id=project_id, **project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, project_id: str, project_update: schemas.ProjectUpdate):
    db_project = get_project(db, project_id, is_archived=None)
    if db_project:
        update_data = project_update.model_dump(exclude_unset=True)
        if "name" in update_data and update_data["name"] != db_project.name:
            existing = get_project_by_name(db, name=update_data["name"])
            if existing:
                raise ValueError(f"Project name '{update_data["name"]}' already exists")
        for key, value in update_data.items():
            setattr(db_project, key, value)
        db.commit()
        db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: str):
    db_project = get_project(db, project_id, is_archived=None)
    if db_project:
        # If unarchiving, we might need to reconsider task states, but for delete, this is fine.
        # For now, cascade delete will remove all tasks regardless of their archived state.
        # If we want to only delete tasks IF the project is archived, logic needs to be more complex.
        # Current setup: deleting a project (archived or not) deletes all its tasks.
        project_data_to_return = schemas.Project.model_validate(db_project) 

        db.delete(db_project)
        
        db.commit()
        
        return project_data_to_return
    
    return None

def get_agent(db: Session, agent_id: str, is_archived: Optional[bool] = False):
    query = db.query(models.Agent).filter(models.Agent.id == agent_id)
    if is_archived is not None:
        query = query.filter(models.Agent.is_archived == is_archived)
    return query.first()

def get_agent_by_name(db: Session, name: str, is_archived: Optional[bool] = False):
    query = db.query(models.Agent).filter(models.Agent.name == name)
    if is_archived is not None:
        query = query.filter(models.Agent.is_archived == is_archived)
    return query.first()

def get_agents(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, status: Optional[str] = None, is_archived: Optional[bool] = False):
    query = db.query(models.Agent)
    if search:
        search_term = f"%{search}%"
        query = query.filter(models.Agent.name.ilike(search_term))
    # Status filtering logic would go here if Agent model had a status field
    # if status:
    #     query = query.filter(models.Agent.status == status) # Example
    
    if is_archived is not None:
        query = query.filter(models.Agent.is_archived == is_archived)
        
    return query.order_by(models.Agent.name).offset(skip).limit(limit).all()

def create_agent(db: Session, agent: schemas.AgentCreate):
    agent_id_str = str(uuid.uuid4().hex)
    # FIX: Explicitly pass the generated ID
    db_agent = models.Agent(id=agent_id_str, **agent.model_dump()) 
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent

def update_agent(db: Session, agent_id: str, agent_update: schemas.AgentUpdate):
    db_agent = get_agent(db, agent_id)
    if db_agent:
        update_data = agent_update.model_dump(exclude_unset=True)
        if "name" in update_data and update_data["name"] != db_agent.name:
            existing = get_agent_by_name(db, name=update_data["name"])
            if existing:
                raise ValueError(f"Agent name '{update_data['name']}' already exists")
        for key, value in update_data.items():
            setattr(db_agent, key, value)
        db.commit()
        db.refresh(db_agent)
    return db_agent

def delete_agent(db: Session, agent_id: str):
    db_agent = get_agent(db, agent_id)
    if db_agent:
        agent_data = schemas.Agent.model_validate(db_agent)
        db.delete(db_agent)
        db.commit()
        return agent_data
    return None

def check_and_auto_archive_project(db: Session, project_id: str):
    project = get_project(db, project_id, is_archived=False)
    if not project:
        return

    # Count non-archived, non-completed tasks for this project
    active_tasks_count = (
        db.query(models.Task)
        .filter(models.Task.project_id == project_id)
        .filter(models.Task.is_archived == False)
        .filter(models.Task.status != "Completed") # Assuming "Completed" is the final status
        .count()
    )

    if active_tasks_count == 0:
        # All tasks are completed (or archived), so archive the project
        project.is_archived = True
        project.updated_at = datetime.datetime.now(datetime.timezone.utc)
        # Also archive all its non-archived tasks
        tasks_to_archive = db.query(models.Task).filter(models.Task.project_id == project_id, models.Task.is_archived == False).all()
        for task in tasks_to_archive:
            task.is_archived = True
            task.updated_at = datetime.datetime.now(datetime.timezone.utc)
        db.commit()
        db.refresh(project)
        print(f"[CRUD check_and_auto_archive_project] Auto-archived project {project_id} and its remaining tasks.")

# --- Archive/Unarchive Functions ---

def archive_project(db: Session, project_id: str) -> Optional[models.Project]:
    project = get_project(db, project_id, is_archived=None) # Get project regardless of current status
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
    project = get_project(db, project_id, is_archived=True) # Ensure we are unarchiving an archived project
    if not project:
        # If not found while filtering for is_archived=True, it's either not archived or doesn't exist
        check_exists = get_project(db, project_id, is_archived=None)
        if not check_exists:
            raise HTTPException(status_code=404, detail="Project not found")
        else:
            # Project exists but is not archived
            print(f"Project {project_id} is not currently archived.")
            return check_exists # Return the project as is

    project.is_archived = False
    project.updated_at = datetime.datetime.now(datetime.timezone.utc)
    
    # Unarchive all archived tasks under this project that were presumably archived with the project
    # Or, perhaps only unarchive tasks if the user explicitly wants to?
    # Current decision: Unarchiving a project also unarchives its tasks.
    tasks_to_unarchive = (
        db.query(models.Task)
        .filter(models.Task.project_id == project_id)
        .filter(models.Task.is_archived == True) # Only unarchive tasks that are currently archived
        .all()
    )
    for task in tasks_to_unarchive:
        task.is_archived = False
        task.updated_at = datetime.datetime.now(datetime.timezone.utc)
        
    db.commit()
    db.refresh(project)
    return project

def archive_task(db: Session, task_id: str) -> Optional[models.Task]:
    task = get_task(db, task_id, is_archived=None) # Get task regardless of current status
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.is_archived:
        print(f"Task {task_id} is already archived.")
        return task

    task.is_archived = True
    task.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    db.refresh(task)
    # Check if archiving this task leads to project auto-archival
    if task.project_id and task.status == "Completed": # Check only if it was completed and then archived manually
        check_and_auto_archive_project(db, task.project_id)
    elif task.project_id: # If not completed, still check, as it might be the last non-completed task being archived.
        check_and_auto_archive_project(db, task.project_id) 
    return task

def unarchive_task(db: Session, task_id: str) -> Optional[models.Task]:
    task = get_task(db, task_id, is_archived=True) # Ensure we are unarchiving an archived task
    if not task:
        check_exists = get_task(db, task_id, is_archived=None)
        if not check_exists:
            raise HTTPException(status_code=404, detail="Task not found")
        else:
            print(f"Task {task_id} is not currently archived.")
            return check_exists

    task.is_archived = False
    task.updated_at = datetime.datetime.now(datetime.timezone.utc)
    
    # If task is part of an archived project, should unarchiving the task unarchive the project?
    # Current decision: No, unarchiving a task does not automatically unarchive its parent project.
    # The project must be unarchived explicitly.
    # However, if the parent project ISN'T archived, this unarchived task might make it active again.
    if task.project and task.project.is_archived == False:
         # If parent project is active, ensure this task is now counted towards active tasks (implicitly handled by is_archived=False)
         pass # No specific action needed here, just a thought point.
         
    db.commit()
    db.refresh(task)
    return task

# Placeholder for Agent archival logic if needed in the future
# def archive_agent(db: Session, agent_id: str): ...
# def unarchive_agent(db: Session, agent_id: str): ...
