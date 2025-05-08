from sqlalchemy.orm import Session, joinedload
from . import models, schemas
import datetime
from typing import Optional, List

def get_task(db: Session, task_id: int):
    return db.query(models.Task).options(joinedload(models.Task.project)).filter(models.Task.id == task_id).first()

def get_tasks(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    project_id: Optional[int] = None, 
    agent_name: Optional[str] = None
):
    query = db.query(models.Task).options(joinedload(models.Task.project))
    if project_id is not None:
        query = query.filter(models.Task.project_id == project_id)
    if agent_name is not None:
        query = query.filter(models.Task.agent_name == agent_name)
    return query.offset(skip).limit(limit).all()

def create_task(db: Session, task: schemas.TaskCreate):
    if task.project_id and not get_project(db, task.project_id):
        raise ValueError(f"Project with id {task.project_id} not found")
    if task.agent_name and not get_agent_by_name(db, task.agent_name):
        raise ValueError(f"Agent with name {task.agent_name} not found")

    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    db.refresh(db_task, attribute_names=['project'])
    return db_task

def update_task(db: Session, task_id: int, task_update: schemas.TaskUpdate):
    db_task = get_task(db, task_id)
    if db_task:
        update_data = task_update.model_dump(exclude_unset=True)

        if 'project_id' in update_data and update_data['project_id'] is not None and not get_project(db, update_data['project_id']):
             raise ValueError(f"Project with id {update_data['project_id']} not found")
        if 'agent_name' in update_data and update_data['agent_name'] is not None and not get_agent_by_name(db, update_data['agent_name']):
             raise ValueError(f"Agent with name {update_data['agent_name']} not found")

        for key, value in update_data.items():
            setattr(db_task, key, value)
        db_task.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(db_task)
        db.refresh(db_task, attribute_names=['project'])
    return db_task

def delete_task(db: Session, task_id: int):
    db_task = db.query(models.Task).options(joinedload(models.Task.project), joinedload(models.Task.agent)).filter(models.Task.id == task_id).first()
    if db_task:
        # Serialize to Pydantic model before deletion
        task_data = schemas.Task.model_validate(db_task)
        db.delete(db_task)
        db.commit()
        return task_data
    return None

def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def get_project_by_name(db: Session, name: str):
    return db.query(models.Project).filter(models.Project.name == name).first()

def get_projects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Project).offset(skip).limit(limit).all()

def create_project(db: Session, project: schemas.ProjectCreate):
    db_project = models.Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, project_id: int, project_update: schemas.ProjectUpdate):
    db_project = get_project(db, project_id)
    if db_project:
        update_data = project_update.model_dump(exclude_unset=True)
        if "name" in update_data and update_data["name"] != db_project.name:
            existing = get_project_by_name(db, name=update_data["name"])
            if existing:
                raise ValueError(f"Project name '{update_data['name']}' already exists")
        for key, value in update_data.items():
            setattr(db_project, key, value)
        db.commit()
        db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int):
    db_project = get_project(db, project_id)
    if db_project:
        db.delete(db_project)
        db.commit()
    return db_project

def get_agent(db: Session, agent_id: int):
    return db.query(models.Agent).filter(models.Agent.id == agent_id).first()

def get_agent_by_name(db: Session, name: str):
    return db.query(models.Agent).filter(models.Agent.name == name).first()

def get_agents(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Agent).offset(skip).limit(limit).all()

def create_agent(db: Session, agent: schemas.AgentCreate):
    db_agent = models.Agent(**agent.model_dump())
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent

def update_agent(db: Session, agent_id: int, agent_update: schemas.AgentUpdate):
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

def delete_agent(db: Session, agent_id: int):
    db_agent = get_agent(db, agent_id)
    if db_agent:
        db.delete(db_agent)
        db.commit()
    return db_agent
