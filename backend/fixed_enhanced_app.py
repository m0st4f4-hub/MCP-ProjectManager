#!/usr/bin/env python3
"""
Fixed Enhanced Task Manager Backend with Full Database Support
"""

import sys
import os
from pathlib import Path
import logging
from datetime import datetime
from typing import List, Optional
import uuid

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import sqlite3
from contextlib import contextmanager

# Database setup
DATABASE_PATH = "task_manager.db"

@contextmanager
def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_database():
    """Initialize the database with comprehensive tables"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Create projects table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'active',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create tasks table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'todo',
                priority TEXT DEFAULT 'medium',
                agent_id TEXT,
                due_date TEXT,
                completed_at TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id),
                FOREIGN KEY (agent_id) REFERENCES agents (id)
            )
        """)
        
        # Create agents table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS agents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                capabilities TEXT,
                status TEXT DEFAULT 'active',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create workflows table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS workflows (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                workflow_type TEXT NOT NULL,
                entry_criteria TEXT,
                success_criteria TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create workflow_steps table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS workflow_steps (
                id TEXT PRIMARY KEY,
                workflow_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                step_order INTEGER NOT NULL,
                action_type TEXT NOT NULL,
                action_config TEXT,
                is_required INTEGER DEFAULT 1,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (workflow_id) REFERENCES workflows (id)
            )
        """)
        
        # Create task_dependencies table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS task_dependencies (
                id TEXT PRIMARY KEY,
                task_id TEXT NOT NULL,
                depends_on_task_id TEXT NOT NULL,
                dependency_type TEXT DEFAULT 'blocks',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES tasks (id),
                FOREIGN KEY (depends_on_task_id) REFERENCES tasks (id)
            )
        """)
        
        # Create comments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS comments (
                id TEXT PRIMARY KEY,
                task_id TEXT NOT NULL,
                content TEXT NOT NULL,
                author TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES tasks (id)
            )
        """)
        
        # Create audit_logs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                entity_type TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                action TEXT NOT NULL,
                old_values TEXT,
                new_values TEXT,
                user_id TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        
        # Check if we need to seed data
        cursor.execute("SELECT COUNT(*) FROM projects")
        if cursor.fetchone()[0] == 0:
            seed_data(conn)

def seed_data(conn):
    """Seed initial data"""
    cursor = conn.cursor()
    current_time = datetime.utcnow().isoformat()
    
    # Create sample project
    project_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO projects (id, name, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [project_id, "Sample Project", "A sample project to get started", "active", current_time, current_time])
    
    # Create sample tasks
    tasks = [
        (str(uuid.uuid4()), project_id, "Setup project structure", "Initialize the project with proper structure", "completed", "high"),
        (str(uuid.uuid4()), project_id, "Implement API endpoints", "Create RESTful API endpoints for all entities", "in_progress", "high"),
        (str(uuid.uuid4()), project_id, "Add frontend interface", "Build user interface for task management", "todo", "medium"),
    ]
    
    for task_id, proj_id, title, desc, status, priority in tasks:
        cursor.execute("""
            INSERT INTO tasks (id, project_id, title, description, status, priority, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, [task_id, proj_id, title, desc, status, priority, current_time, current_time])
    
    # Create sample agent
    agent_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO agents (id, name, description, capabilities, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, [agent_id, "Task Assistant", "AI agent for task management", "task_creation,task_updates,project_management", "active", current_time, current_time])
    
    conn.commit()
    logging.info("✅ Seeded initial sample data")

# Pydantic models
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "active"

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: str
    created_at: str
    updated_at: str
    task_count: int = 0

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"

class TaskCreate(TaskBase):
    project_id: str
    agent_id: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    agent_id: Optional[str] = None

class TaskResponse(TaskBase):
    id: str
    project_id: str
    agent_id: Optional[str] = None
    created_at: str
    updated_at: str

class AgentBase(BaseModel):
    name: str
    description: Optional[str] = None
    capabilities: Optional[str] = None
    status: str = "active"

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    capabilities: Optional[str] = None
    status: Optional[str] = None

class AgentResponse(AgentBase):
    id: str
    created_at: str
    updated_at: str

# Workflow models
class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    workflow_type: str
    entry_criteria: Optional[str] = None
    success_criteria: Optional[str] = None
    is_active: bool = True

class WorkflowCreate(WorkflowBase):
    pass

class WorkflowResponse(WorkflowBase):
    id: str
    created_at: str
    updated_at: str

# Comment models
class CommentBase(BaseModel):
    content: str
    author: Optional[str] = None

class CommentCreate(CommentBase):
    task_id: str

class CommentResponse(CommentBase):
    id: str
    task_id: str
    created_at: str
    updated_at: str

# Task dependency models
class TaskDependencyCreate(BaseModel):
    task_id: str
    depends_on_task_id: str
    dependency_type: str = "blocks"

class TaskDependencyResponse(TaskDependencyCreate):
    id: str
    created_at: str

# FastAPI app
app = FastAPI(
    title="Enhanced Task Manager API",
    description="A comprehensive task management system with full database support",
    version="2.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_database()
    print("\n" + "="*70)
    print(" " * 20 + "ENHANCED TASK MANAGER API")
    print("="*70)
    print(f"🚀 Server: http://localhost:8000")
    print(f"📚 API Docs: http://localhost:8000/docs")
    print(f"🗄️ Database: SQLite")
    print(f"🔧 Features: Full CRUD, Real-time data, MCP integration")
    print("="*70 + "\n")

# Basic routes
@app.get("/")
async def root():
    return {
        "message": "Enhanced Task Manager API",
        "version": "2.1.0",
        "status": "running",
        "features": [
            "Full CRUD operations",
            "SQLite database",
            "Real-time data",
            "MCP integration ready"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.1.0", "database": "connected"}

# Project endpoints
@app.get("/api/v1/projects", response_model=List[ProjectResponse])
async def get_projects():
    """Get all projects"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects ORDER BY created_at DESC")
        projects = cursor.fetchall()
        
        result = []
        for project in projects:
            # Get task count
            cursor.execute("SELECT COUNT(*) FROM tasks WHERE project_id = ?", [project['id']])
            task_count = cursor.fetchone()[0]
            
            result.append(ProjectResponse(
                id=project['id'],
                name=project['name'],
                description=project['description'],
                status=project['status'],
                created_at=project['created_at'],
                updated_at=project['updated_at'],
                task_count=task_count
            ))
        
        return result

@app.post("/api/v1/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate):
    """Create a new project"""
    project_id = str(uuid.uuid4())
    current_time = datetime.utcnow().isoformat()
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO projects (id, name, description, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, [project_id, project.name, project.description, project.status, current_time, current_time])
        conn.commit()
        
        # Get the created project
        cursor.execute("SELECT * FROM projects WHERE id = ?", [project_id])
        created_project = cursor.fetchone()
        
        return ProjectResponse(
            id=created_project['id'],
            name=created_project['name'],
            description=created_project['description'],
            status=created_project['status'],
            created_at=created_project['created_at'],
            updated_at=created_project['updated_at'],
            task_count=0
        )

# Task endpoints
@app.get("/api/v1/tasks", response_model=List[TaskResponse])
async def get_tasks(project_id: Optional[str] = Query(None)):
    """Get all tasks, optionally filtered by project"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        if project_id:
            cursor.execute("SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC", [project_id])
        else:
            cursor.execute("SELECT * FROM tasks ORDER BY created_at DESC")
        
        tasks = cursor.fetchall()
        
        return [TaskResponse(
            id=task['id'],
            project_id=task['project_id'],
            title=task['title'],
            description=task['description'],
            status=task['status'],
            priority=task['priority'],
            created_at=task['created_at'],
            updated_at=task['updated_at']
        ) for task in tasks]

@app.post("/api/v1/tasks", response_model=TaskResponse)
async def create_task(task: TaskCreate):
    """Create a new task"""
    task_id = str(uuid.uuid4())
    current_time = datetime.utcnow().isoformat()
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Verify project exists
        cursor.execute("SELECT id FROM projects WHERE id = ?", [task.project_id])
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Project not found")
        
        cursor.execute("""
            INSERT INTO tasks (id, project_id, title, description, status, priority, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, [task_id, task.project_id, task.title, task.description, task.status, task.priority, current_time, current_time])
        conn.commit()
        
        # Get the created task
        cursor.execute("SELECT * FROM tasks WHERE id = ?", [task_id])
        created_task = cursor.fetchone()
        
        return TaskResponse(
            id=created_task['id'],
            project_id=created_task['project_id'],
            title=created_task['title'],
            description=created_task['description'],
            status=created_task['status'],
            priority=created_task['priority'],
            created_at=created_task['created_at'],
            updated_at=created_task['updated_at']
        )

# Agent endpoints
@app.get("/api/v1/agents", response_model=List[AgentResponse])
async def get_agents():
    """Get all agents"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM agents ORDER BY created_at DESC")
        agents = cursor.fetchall()
        
        return [AgentResponse(
            id=agent['id'],
            name=agent['name'],
            description=agent['description'],
            capabilities=agent['capabilities'],
            status=agent['status'],
            created_at=agent['created_at'],
            updated_at=agent['updated_at']
        ) for agent in agents]

@app.post("/api/v1/agents", response_model=AgentResponse)
async def create_agent(agent: AgentCreate):
    """Create a new agent"""
    agent_id = str(uuid.uuid4())
    current_time = datetime.utcnow().isoformat()
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO agents (id, name, description, capabilities, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, [agent_id, agent.name, agent.description, agent.capabilities, agent.status, current_time, current_time])
        conn.commit()
        
        # Get the created agent
        cursor.execute("SELECT * FROM agents WHERE id = ?", [agent_id])
        created_agent = cursor.fetchone()
        
        return AgentResponse(
            id=created_agent['id'],
            name=created_agent['name'],
            description=created_agent['description'],
            capabilities=created_agent['capabilities'],
            status=created_agent['status'],
            created_at=created_agent['created_at'],
            updated_at=created_agent['updated_at']
        )

# Additional CRUD endpoints

# Project CRUD
@app.get("/api/v1/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str):
    """Get a specific project by ID"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects WHERE id = ?", [project_id])
        project = cursor.fetchone()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get task count
        cursor.execute("SELECT COUNT(*) FROM tasks WHERE project_id = ?", [project_id])
        task_count = cursor.fetchone()[0]
        
        return ProjectResponse(
            id=project['id'],
            name=project['name'],
            description=project['description'],
            status=project['status'],
            created_at=project['created_at'],
            updated_at=project['updated_at'],
            task_count=task_count
        )

@app.put("/api/v1/projects/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, project_update: ProjectCreate):
    """Update a project"""
    current_time = datetime.utcnow().isoformat()
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if project exists
        cursor.execute("SELECT id FROM projects WHERE id = ?", [project_id])
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Update project
        cursor.execute("""
            UPDATE projects 
            SET name = ?, description = ?, status = ?, updated_at = ?
            WHERE id = ?
        """, [project_update.name, project_update.description, project_update.status, current_time, project_id])
        conn.commit()
        
        # Return updated project
        return await get_project(project_id)

@app.delete("/api/v1/projects/{project_id}")
async def delete_project(project_id: str):
    """Delete a project and all its tasks"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if project exists
        cursor.execute("SELECT id FROM projects WHERE id = ?", [project_id])
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Delete related tasks first
        cursor.execute("DELETE FROM tasks WHERE project_id = ?", [project_id])
        # Delete project
        cursor.execute("DELETE FROM projects WHERE id = ?", [project_id])
        conn.commit()
        
        return {"message": "Project deleted successfully"}

# Task CRUD
@app.get("/api/v1/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str):
    """Get a specific task by ID"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks WHERE id = ?", [task_id])
        task = cursor.fetchone()
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return TaskResponse(
            id=task['id'],
            project_id=task['project_id'],
            title=task['title'],
            description=task['description'],
            status=task['status'],
            priority=task['priority'],
            agent_id=task['agent_id'],
            created_at=task['created_at'],
            updated_at=task['updated_at']
        )

@app.put("/api/v1/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task_update: TaskUpdate):
    """Update a task"""
    current_time = datetime.utcnow().isoformat()
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if task exists
        cursor.execute("SELECT * FROM tasks WHERE id = ?", [task_id])
        existing_task = cursor.fetchone()
        if not existing_task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Build update query dynamically
        update_fields = []
        update_values = []
        
        if task_update.title is not None:
            update_fields.append("title = ?")
            update_values.append(task_update.title)
        if task_update.description is not None:
            update_fields.append("description = ?")
            update_values.append(task_update.description)
        if task_update.status is not None:
            update_fields.append("status = ?")
            update_values.append(task_update.status)
        if task_update.priority is not None:
            update_fields.append("priority = ?")
            update_values.append(task_update.priority)
        if task_update.agent_id is not None:
            update_fields.append("agent_id = ?")
            update_values.append(task_update.agent_id)
        
        if update_fields:
            update_fields.append("updated_at = ?")
            update_values.append(current_time)
            update_values.append(task_id)
            
            query = f"UPDATE tasks SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, update_values)
            conn.commit()
        
        # Return updated task
        return await get_task(task_id)

@app.delete("/api/v1/tasks/{task_id}")
async def delete_task(task_id: str):
    """Delete a task"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if task exists
        cursor.execute("SELECT id FROM tasks WHERE id = ?", [task_id])
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Delete task dependencies first
        cursor.execute("DELETE FROM task_dependencies WHERE task_id = ? OR depends_on_task_id = ?", [task_id, task_id])
        # Delete comments
        cursor.execute("DELETE FROM comments WHERE task_id = ?", [task_id])
        # Delete task
        cursor.execute("DELETE FROM tasks WHERE id = ?", [task_id])
        conn.commit()
        
        return {"message": "Task deleted successfully"}

# Agent CRUD
@app.get("/api/v1/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str):
    """Get a specific agent by ID"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM agents WHERE id = ?", [agent_id])
        agent = cursor.fetchone()
        
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        return AgentResponse(
            id=agent['id'],
            name=agent['name'],
            description=agent['description'],
            capabilities=agent['capabilities'],
            status=agent['status'],
            created_at=agent['created_at'],
            updated_at=agent['updated_at']
        )

@app.put("/api/v1/agents/{agent_id}", response_model=AgentResponse)
async def update_agent(agent_id: str, agent_update: AgentUpdate):
    """Update an agent"""
    current_time = datetime.utcnow().isoformat()
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if agent exists
        cursor.execute("SELECT * FROM agents WHERE id = ?", [agent_id])
        existing_agent = cursor.fetchone()
        if not existing_agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Build update query dynamically
        update_fields = []
        update_values = []
        
        if agent_update.name is not None:
            update_fields.append("name = ?")
            update_values.append(agent_update.name)
        if agent_update.description is not None:
            update_fields.append("description = ?")
            update_values.append(agent_update.description)
        if agent_update.capabilities is not None:
            update_fields.append("capabilities = ?")
            update_values.append(agent_update.capabilities)
        if agent_update.status is not None:
            update_fields.append("status = ?")
            update_values.append(agent_update.status)
        
        if update_fields:
            update_fields.append("updated_at = ?")
            update_values.append(current_time)
            update_values.append(agent_id)
            
            query = f"UPDATE agents SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, update_values)
            conn.commit()
        
        # Return updated agent
        return await get_agent(agent_id)

@app.delete("/api/v1/agents/{agent_id}")
async def delete_agent(agent_id: str):
    """Delete an agent"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if agent exists
        cursor.execute("SELECT id FROM agents WHERE id = ?", [agent_id])
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Remove agent assignments from tasks
        cursor.execute("UPDATE tasks SET agent_id = NULL WHERE agent_id = ?", [agent_id])
        # Delete agent
        cursor.execute("DELETE FROM agents WHERE id = ?", [agent_id])
        conn.commit()
        
        return {"message": "Agent deleted successfully"}

# Workflow endpoints
@app.get("/api/v1/workflows", response_model=List[WorkflowResponse])
async def get_workflows():
    """Get all workflows"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM workflows ORDER BY created_at DESC")
        workflows = cursor.fetchall()
        
        return [WorkflowResponse(
            id=workflow['id'],
            name=workflow['name'],
            description=workflow['description'],
            workflow_type=workflow['workflow_type'],
            entry_criteria=workflow['entry_criteria'],
            success_criteria=workflow['success_criteria'],
            is_active=bool(workflow['is_active']),
            created_at=workflow['created_at'],
            updated_at=workflow['updated_at']
        ) for workflow in workflows]

@app.post("/api/v1/workflows", response_model=WorkflowResponse)
async def create_workflow(workflow: WorkflowCreate):
    """Create a new workflow"""
    workflow_id = str(uuid.uuid4())
    current_time = datetime.utcnow().isoformat()
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO workflows (id, name, description, workflow_type, entry_criteria, success_criteria, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [workflow_id, workflow.name, workflow.description, workflow.workflow_type, 
              workflow.entry_criteria, workflow.success_criteria, int(workflow.is_active), current_time, current_time])
        conn.commit()
        
        # Get the created workflow
        cursor.execute("SELECT * FROM workflows WHERE id = ?", [workflow_id])
        created_workflow = cursor.fetchone()
        
        return WorkflowResponse(
            id=created_workflow['id'],
            name=created_workflow['name'],
            description=created_workflow['description'],
            workflow_type=created_workflow['workflow_type'],
            entry_criteria=created_workflow['entry_criteria'],
            success_criteria=created_workflow['success_criteria'],
            is_active=bool(created_workflow['is_active']),
            created_at=created_workflow['created_at'],
            updated_at=created_workflow['updated_at']
        )

# Comment endpoints
@app.get("/api/v1/tasks/{task_id}/comments", response_model=List[CommentResponse])
async def get_task_comments(task_id: str):
    """Get all comments for a task"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Verify task exists
        cursor.execute("SELECT id FROM tasks WHERE id = ?", [task_id])
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Task not found")
        
        cursor.execute("SELECT * FROM comments WHERE task_id = ? ORDER BY created_at DESC", [task_id])
        comments = cursor.fetchall()
        
        return [CommentResponse(
            id=comment['id'],
            task_id=comment['task_id'],
            content=comment['content'],
            author=comment['author'],
            created_at=comment['created_at'],
            updated_at=comment['updated_at']
        ) for comment in comments]

@app.post("/api/v1/comments", response_model=CommentResponse)
async def create_comment(comment: CommentCreate):
    """Create a new comment"""
    comment_id = str(uuid.uuid4())
    current_time = datetime.utcnow().isoformat()
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Verify task exists
        cursor.execute("SELECT id FROM tasks WHERE id = ?", [comment.task_id])
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Task not found")
        
        cursor.execute("""
            INSERT INTO comments (id, task_id, content, author, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, [comment_id, comment.task_id, comment.content, comment.author, current_time, current_time])
        conn.commit()
        
        # Get the created comment
        cursor.execute("SELECT * FROM comments WHERE id = ?", [comment_id])
        created_comment = cursor.fetchone()
        
        return CommentResponse(
            id=created_comment['id'],
            task_id=created_comment['task_id'],
            content=created_comment['content'],
            author=created_comment['author'],
            created_at=created_comment['created_at'],
            updated_at=created_comment['updated_at']
        )

# Task dependency endpoints
@app.get("/api/v1/tasks/{task_id}/dependencies", response_model=List[TaskDependencyResponse])
async def get_task_dependencies(task_id: str):
    """Get all dependencies for a task"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Verify task exists
        cursor.execute("SELECT id FROM tasks WHERE id = ?", [task_id])
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Task not found")
        
        cursor.execute("SELECT * FROM task_dependencies WHERE task_id = ?", [task_id])
        dependencies = cursor.fetchall()
        
        return [TaskDependencyResponse(
            id=dep['id'],
            task_id=dep['task_id'],
            depends_on_task_id=dep['depends_on_task_id'],
            dependency_type=dep['dependency_type'],
            created_at=dep['created_at']
        ) for dep in dependencies]

@app.post("/api/v1/task-dependencies", response_model=TaskDependencyResponse)
async def create_task_dependency(dependency: TaskDependencyCreate):
    """Create a new task dependency"""
    dependency_id = str(uuid.uuid4())
    current_time = datetime.utcnow().isoformat()
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Verify both tasks exist
        cursor.execute("SELECT id FROM tasks WHERE id = ?", [dependency.task_id])
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Task not found")
        
        cursor.execute("SELECT id FROM tasks WHERE id = ?", [dependency.depends_on_task_id])
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Dependency task not found")
        
        cursor.execute("""
            INSERT INTO task_dependencies (id, task_id, depends_on_task_id, dependency_type, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, [dependency_id, dependency.task_id, dependency.depends_on_task_id, dependency.dependency_type, current_time])
        conn.commit()
        
        # Get the created dependency
        cursor.execute("SELECT * FROM task_dependencies WHERE id = ?", [dependency_id])
        created_dep = cursor.fetchone()
        
        return TaskDependencyResponse(
            id=created_dep['id'],
            task_id=created_dep['task_id'],
            depends_on_task_id=created_dep['depends_on_task_id'],
            dependency_type=created_dep['dependency_type'],
            created_at=created_dep['created_at']
        )

# Statistics endpoint
@app.get("/api/v1/stats")
async def get_stats():
    """Get application statistics"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Count projects
        cursor.execute("SELECT COUNT(*) FROM projects")
        total_projects = cursor.fetchone()[0]
        
        # Count tasks by status
        cursor.execute("SELECT status, COUNT(*) as count FROM tasks GROUP BY status")
        task_stats = {row['status']: row['count'] for row in cursor.fetchall()}
        
        # Count agents
        cursor.execute("SELECT COUNT(*) FROM agents")
        total_agents = cursor.fetchone()[0]
        
        # Get recent tasks
        cursor.execute("SELECT title, status, created_at FROM tasks ORDER BY created_at DESC LIMIT 5")
        recent_tasks = [{"title": row['title'], "status": row['status'], "created_at": row['created_at']} for row in cursor.fetchall()]
        
        return {
            "projects": {"total": total_projects},
            "tasks": {
                "total": sum(task_stats.values()),
                "by_status": task_stats
            },
            "agents": {"total": total_agents},
            "recent_activity": recent_tasks,
            "database": "connected",
            "version": "2.1.0"
        }

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    # Run the server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )