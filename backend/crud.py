from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import or_, func
from . import models, schemas
import datetime
from typing import Optional, List
import uuid
from fastapi import HTTPException

def get_task(db: Session, task_id: str):
    # Eagerly load project, agent, and subtasks (recursively if needed, or to a certain depth)
    # For simplicity, loading one level of subtasks here.
    # Adjust selectinload(models.Task.children) for deeper loading if necessary.
    return (
        db.query(models.Task)
        .options(
            joinedload(models.Task.project),
            joinedload(models.Task.agent)
            # selectinload(models.Task.subtasks) # UPDATED from children # REMOVED
        )
        .filter(models.Task.id == task_id)
        .first()
    )

def get_tasks(
    db: Session, 
    skip: int = 0, 
    limit: int = 10000, 
    project_id: Optional[str] = None, 
    agent_id: Optional[str] = None,
    agent_name: Optional[str] = None, # Added agent_name
    search: Optional[str] = None,
    status: Optional[str] = None
):
    print(f"[CRUD get_tasks] Received project_id: {project_id}, agent_id: {agent_id}, agent_name: {agent_name}, search: {search}, status: {status}, skip: {skip}, limit: {limit}")
    
    effective_limit = limit

    # query = db.query(models.Task).options(selectinload(models.Task.project), selectinload(models.Task.agent), selectinload(models.Task.subtasks)) # REMOVE subtasks loading
    query = db.query(models.Task).options(selectinload(models.Task.project), selectinload(models.Task.agent)) # CORRECTED query

    if project_id:
        query = query.filter(models.Task.project_id == project_id)

    if agent_id: # Keep agent_id for direct linking if provided
        query = query.filter(models.Task.agent_id == agent_id)
    elif agent_name: # Filter by agent_name if agent_id is not provided
        # This requires a join with the Agent table
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
        if status == 'completed' or status == 'true':
            query = query.filter(models.Task.completed == True)
        elif status == 'pending' or status == 'false':
            query = query.filter(models.Task.completed == False)
        # 'all' status implies no filtering by completion, so do nothing

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

    task_id_str = str(uuid.uuid4().hex)
    db_task = models.Task(id=task_id_str, **task_data_for_model)
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    # Eagerly load relationships that are expected in the response or subsequent use
    # db.refresh(db_task, attribute_names=['project', 'agent', 'subtasks']) # REMOVED 'subtasks'
    db.refresh(db_task, attribute_names=['project', 'agent']) # CORRECTED
    return db_task

def update_task(db: Session, task_id: str, task_update: schemas.TaskUpdate):
    db_task = get_task(db, task_id=task_id)
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

    # Update timestamp
    db_task.updated_at = datetime.datetime.now(datetime.timezone.utc)

    db.commit()
    db.refresh(db_task)
    # Eagerly load relationships that are expected in the response
    # db.refresh(db_task, attribute_names=['project', 'agent', 'subtasks']) # REMOVED 'subtasks'
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

def get_project(db: Session, project_id: str):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if project:
        # Calculate total task count
        total_task_count = db.query(func.count(models.Task.id)).filter(models.Task.project_id == project_id).scalar()
        project.task_count = total_task_count if total_task_count is not None else 0
        # Calculate completed task count
        completed_task_count = db.query(func.count(models.Task.id)).filter(
            models.Task.project_id == project_id, 
            models.Task.completed == True
        ).scalar()
        project.completed_task_count = completed_task_count if completed_task_count is not None else 0
    return project

def get_project_by_name(db: Session, name: str):
    project = db.query(models.Project).filter(models.Project.name == name).first()
    if project:
        # Calculate total task count
        total_task_count = db.query(func.count(models.Task.id)).filter(models.Task.project_id == project.id).scalar()
        project.task_count = total_task_count if total_task_count is not None else 0
        # Calculate completed task count
        completed_task_count = db.query(func.count(models.Task.id)).filter(
            models.Task.project_id == project.id, 
            models.Task.completed == True
        ).scalar()
        project.completed_task_count = completed_task_count if completed_task_count is not None else 0
    return project

def get_projects(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, status: Optional[str] = None):
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
    projects = query.offset(skip).limit(limit).all()
    
    # Calculate task counts for each project
    for project in projects:
        total_task_count = db.query(func.count(models.Task.id)).filter(models.Task.project_id == project.id).scalar()
        project.task_count = total_task_count if total_task_count is not None else 0
        
        completed_task_count = db.query(func.count(models.Task.id)).filter(
            models.Task.project_id == project.id, 
            models.Task.completed == True
        ).scalar()
        project.completed_task_count = completed_task_count if completed_task_count is not None else 0

    return projects

def create_project(db: Session, project: schemas.ProjectCreate):
    project_id = str(uuid.uuid4())
    db_project = models.Project(id=project_id, **project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, project_id: str, project_update: schemas.ProjectUpdate):
    db_project = get_project(db, project_id)
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
    db_project = get_project(db, project_id)
    if db_project:
        project_data_to_return = schemas.Project.model_validate(db_project) 

        tasks_to_delete = db.query(models.Task).filter(models.Task.project_id == project_id).all()
        
        deleted_tasks_count = 0
        for task in tasks_to_delete:
            db.delete(task)
            deleted_tasks_count += 1
        
        print(f"[CRUD delete_project] Deleted {deleted_tasks_count} tasks associated with project_id: {project_id}")

        db.delete(db_project)
        
        db.commit()
        
        return project_data_to_return
    
    return None

def get_agent(db: Session, agent_id: str):
    return db.query(models.Agent).filter(models.Agent.id == agent_id).first()

def get_agent_by_name(db: Session, name: str):
    return db.query(models.Agent).filter(models.Agent.name == name).first()

def get_agents(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, status: Optional[str] = None):
    query = db.query(models.Agent)
    if search:
        search_term = f"%{search}%"
        query = query.filter(models.Agent.name.ilike(search_term))
    # Status filtering logic would go here if Agent model had a status field
    # if status:
    #     query = query.filter(models.Agent.status == status) # Example
    return query.offset(skip).limit(limit).all()

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
