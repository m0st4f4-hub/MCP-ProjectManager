from sqlalchemy.orm import Session, joinedload, selectinload
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
            joinedload(models.Task.agent),
            selectinload(models.Task.subtasks) # UPDATED from children
        )
        .filter(models.Task.id == task_id)
        .first()
    )

def get_tasks(
    db: Session, 
    skip: int = 0, 
    limit: int = 10000, 
    project_id: Optional[str] = None, 
    agent_id: Optional[str] = None
):
    print(f"[CRUD get_tasks] Received project_id: {project_id}, agent_id: {agent_id}, skip: {skip}, limit: {limit}")
    
    effective_limit = limit

    query = db.query(models.Task).options(selectinload(models.Task.project), selectinload(models.Task.agent), selectinload(models.Task.subtasks))
    print(f"[CRUD get_tasks] Base query: {query}") # Log the base query

    if project_id:
        query = query.filter(models.Task.project_id == project_id)
        print(f"[CRUD get_tasks] Applying project_id filter: {project_id}")
        print(f"[CRUD get_tasks] Query after project_id filter: {query}") # Log query after project_id filter
    
    if agent_id: # Filter by agent_id
        query = query.filter(models.Task.agent_id == agent_id)
        print(f"[CRUD get_tasks] Applying agent_id filter: {agent_id}")
        print(f"[CRUD get_tasks] Query after agent_id filter: {query}") # Log query after agent_id filter

    results = query.offset(skip).limit(effective_limit).all()
    print(f"[CRUD get_tasks] Number of results returned: {len(results)} (skip: {skip}, limit: {effective_limit})")
    return results

def create_task(db: Session, task: schemas.TaskCreate):
    # Validate project_id
    if not get_project(db, project_id=task.project_id):
        raise ValueError(f"Project with id {task.project_id} not found")

    # Validate parent_task_id if provided
    if task.parent_task_id:
        # First check if parent_task_id points to a subtask
        if db.query(models.Subtask).filter(models.Subtask.id == task.parent_task_id).first():
            raise ValueError("Invalid parent_task_id: Cannot use a subtask as a parent task")
        # Then check if the parent task exists
        parent_task = get_task(db, task_id=task.parent_task_id)
        if not parent_task:
            raise ValueError(f"Parent task with id {task.parent_task_id} not found")

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
    db.refresh(db_task, attribute_names=['project', 'agent', 'subtasks'])
    return db_task

def update_task(db: Session, task_id: str, task_update: schemas.TaskUpdate):
    db_task = get_task(db, task_id=task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Validate project_id if provided
    if task_update.project_id:
        if not get_project(db, project_id=task_update.project_id):
            raise ValueError(f"Project with id {task_update.project_id} not found")

    # Validate parent_task_id if provided
    if task_update.parent_task_id:
        # First check if the parent_task_id points to a subtask
        if db.query(models.Subtask).filter(models.Subtask.id == task_update.parent_task_id).first():
            raise ValueError("Invalid parent_task_id: Cannot use a subtask as a parent task")
        # Then check if the parent task exists
        parent_task = get_task(db, task_id=task_update.parent_task_id)
        if not parent_task:
            raise ValueError(f"Parent task with id {task_update.parent_task_id} not found")

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
    db.refresh(db_task, attribute_names=['project', 'agent', 'subtasks'])
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
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def get_project_by_name(db: Session, name: str):
    return db.query(models.Project).filter(models.Project.name == name).first()

def get_projects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Project).offset(skip).limit(limit).all()

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

def get_agents(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Agent).offset(skip).limit(limit).all()

def create_agent(db: Session, agent: schemas.AgentCreate):
    agent_id_str = str(uuid.uuid4().hex)
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

def list_subtasks_crud(db: Session, parent_task_id: str, skip: int = 0, limit: int = 100) -> List[models.Subtask]:
    return (
        db.query(models.Subtask)
        .options(
            selectinload(models.Subtask.task)
        )
        .filter(models.Subtask.task_id == parent_task_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

# CRUD operation to create a new subtask
def create_subtask(db: Session, subtask: schemas.SubtaskClientCreate, parent_task_id: str):
    # Verify the parent task exists
    parent_task = get_task(db, task_id=parent_task_id)
    if not parent_task:
        raise ValueError(f"Parent task with id {parent_task_id} not found")

    subtask_id_str = str(uuid.uuid4().hex) 
    # Ensure we pass parent_task_id explicitly, it's not in SubTaskCreate directly for model_dump usually
    db_subtask = models.Subtask(id=subtask_id_str, **subtask.model_dump(), task_id=parent_task_id) 
    db.add(db_subtask)
    db.commit()
    db.refresh(db_subtask)
    return db_subtask

# CRUD operation to retrieve a specific subtask by its ID
def get_subtask(db: Session, subtask_id: str) -> Optional[models.Subtask]:
    return db.query(models.Subtask).filter(models.Subtask.id == subtask_id).first()

# CRUD operation to update an existing subtask
def update_subtask(db: Session, subtask_id: str, subtask_update: schemas.SubtaskUpdate) -> Optional[models.Subtask]:
    db_subtask = get_subtask(db, subtask_id=subtask_id)
    if not db_subtask:
        return None

    update_data = subtask_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_subtask, key, value)
    
    db_subtask.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.add(db_subtask)
    db.commit()
    db.refresh(db_subtask)
    return db_subtask

# CRUD operation to delete a subtask
def delete_subtask(db: Session, subtask_id: str) -> Optional[models.Subtask]:
    db_subtask = get_subtask(db, subtask_id=subtask_id)
    if not db_subtask:
        return None
    
    # To ensure the returned object is the one deleted, we can model_validate before delete
    # However, the typical pattern is to return the object data as it was.
    # For consistency with other delete operations, let's create a schema instance
    # before deleting. This might not be strictly necessary if the client only cares about the ID.
    # For now, let's just return the object that was found and will be deleted.
    # A more robust approach might be to return a schemas.Subtask instance.
    # For simplicity and consistency with how project/agent/task deletes are, we will
    # return the ORM object and let the endpoint handle schema validation if needed.

    # If we need to return a schema object:
    # subtask_data = schemas.Subtask.model_validate(db_subtask)
    # db.delete(db_subtask)
    # db.commit()
    # return subtask_data
    
    # Simpler: return the ORM object, endpoint can decide how to respond
    db.delete(db_subtask)
    db.commit()
    return db_subtask # The object is now detached but contains pre-delete state
