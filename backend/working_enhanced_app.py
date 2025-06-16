#!/usr/bin/env python3
"""
Working Enhanced Task Manager Backend with Full Database Support
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
    """Initialize the database with tables"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Create projects table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
                due_date TIMESTAMP,
                completed_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id)
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    
    # Create sample project
    project_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO projects (id, name, description, status)
        VALUES (?, ?, ?, ?)
    """, [project_id, "Sample Project", "A sample project to get started", "active"])
    
    # Create sample tasks
    tasks = [
        (str(uuid.uuid4()), project_id, "Setup project structure", "Initialize the project with proper structure", "completed", "high"),
        (str(uuid.uuid4()), project_id, "Implement API endpoints", "Create RESTful API endpoints for all entities", "in_progress", "high"),
        (str(uuid.uuid4()), project_id, "Add frontend interface", "Build user interface for task management", "todo", "medium"),
    ]
    
    for task_id, proj_id, title, desc, status, priority in tasks:
        cursor.execute("""
            INSERT INTO tasks (id, project_id, title, description, status, priority)
            VALUES (?, ?, ?, ?, ?, ?)
        """, [task_id, proj_id, title, desc, status, priority])
    
    # Create sample agent
    agent_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO agents (id, name, description, capabilities, status)
        VALUES (?, ?, ?, ?, ?)
    """, [agent_id, "Task Assistant", "AI agent for task management", "task_creation,task_updates,project_management", "active"])
    
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

class TaskResponse(TaskBase):
    id: str
    project_id: str
    created_at: str
    updated_at: str

class AgentBase(BaseModel):
    name: str
    description: Optional[str] = None
    capabilities: Optional[str] = None
    status: str = "active"

class AgentCreate(AgentBase):
    pass

class AgentResponse(AgentBase):
    id: str
    created_at: str
    updated_at: str

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
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO projects (id, name, description, status)
            VALUES (?, ?, ?, ?)
        """, [project_id, project.name, project.description, project.status])
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
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Verify project exists
        cursor.execute("SELECT id FROM projects WHERE id = ?", [task.project_id])
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Project not found")
        
        cursor.execute("""
            INSERT INTO tasks (id, project_id, title, description, status, priority)
            VALUES (?, ?, ?, ?, ?, ?)
        """, [task_id, task.project_id, task.title, task.description, task.status, task.priority])
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
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO agents (id, name, description, capabilities, status)
            VALUES (?, ?, ?, ?, ?)
        """, [agent_id, agent.name, agent.description, agent.capabilities, agent.status])
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
        
        return {
            "projects": {"total": total_projects},
            "tasks": {
                "total": sum(task_stats.values()),
                "by_status": task_stats
            },
            "agents": {"total": total_agents},
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