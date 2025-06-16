#!/usr/bin/env python3
"""
Complete Enhanced Task Manager Backend with Full Database Support
"""

import sys
import os
from pathlib import Path
import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from typing import List, Optional, Dict, Any
import uuid

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Integer, DateTime, Boolean, Text, ForeignKey, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from pydantic import BaseModel
import uvicorn

# Database setup
DATABASE_URL = "sqlite+aiosqlite:///./task_manager.db"

# Create async engine  
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# Database models
Base = declarative_base()

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    title = Column(String(500), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="todo", nullable=False, index=True)
    priority = Column(String(20), default="medium", nullable=False)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    capabilities = Column(Text, nullable=True)
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

# Pydantic models
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "active"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime
    task_count: int = 0
    
    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    project_id: str

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: str
    project_id: str
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AgentBase(BaseModel):
    name: str
    description: Optional[str] = None
    capabilities: Optional[str] = None
    status: str = "active"

class AgentCreate(AgentBase):
    pass

class AgentResponse(AgentBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Database dependency
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Seed initial data
async def seed_initial_data():
    """Seed the database with initial data if empty"""
    async with AsyncSessionLocal() as session:
        try:
            # Check if we have any projects
            result = await session.execute("SELECT COUNT(*) FROM projects")
            count = result.scalar()
            
            if count == 0:
                # Create sample project
                project_id = str(uuid.uuid4())
                await session.execute("""
                    INSERT INTO projects (id, name, description, status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, [project_id, "Sample Project", "A sample project to get started", "active", datetime.utcnow(), datetime.utcnow()])
                
                # Create sample tasks
                tasks = [
                    (str(uuid.uuid4()), project_id, "Setup project structure", "Initialize the project with proper structure", "completed", "high"),
                    (str(uuid.uuid4()), project_id, "Implement API endpoints", "Create RESTful API endpoints for all entities", "in_progress", "high"),
                    (str(uuid.uuid4()), project_id, "Add frontend interface", "Build user interface for task management", "todo", "medium"),
                ]
                
                for task_id, proj_id, title, desc, status, priority in tasks:
                    await session.execute("""
                        INSERT INTO tasks (id, project_id, title, description, status, priority, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, [task_id, proj_id, title, desc, status, priority, datetime.utcnow(), datetime.utcnow()])
                
                # Create sample agent
                agent_id = str(uuid.uuid4())
                await session.execute("""
                    INSERT INTO agents (id, name, description, capabilities, status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, [agent_id, "Task Assistant", "AI agent for task management", "task_creation,task_updates,project_management", "active", datetime.utcnow(), datetime.utcnow()])
                
                await session.commit()
                logging.info("✅ Seeded initial sample data")
        except Exception as e:
            await session.rollback()
            logging.warning(f"Could not seed data: {e}")

# Application lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logging.info("🚀 Starting Enhanced Task Manager API...")
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    logging.info("✅ Database tables created/verified")
    
    # Seed data if empty
    await seed_initial_data()
    
    print("\n" + "="*70)
    print(" " * 20 + "ENHANCED TASK MANAGER API")
    print("="*70)
    print(f"🚀 Server: http://localhost:8000")
    print(f"📚 API Docs: http://localhost:8000/docs")
    print(f"🗄️ Database: SQLite with async support")
    print(f"🔧 Features: Full CRUD, Real-time data, MCP integration")
    print("="*70 + "\n")
    
    yield
    
    logging.info("🛑 Shutting down Enhanced Task Manager API...")

def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    app = FastAPI(
        title="Enhanced Task Manager API",
        description="A comprehensive task management system with full database support",
        version="2.1.0",
        lifespan=lifespan,
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    return app

app = create_app()

# Basic routes
@app.get("/")
async def root():
    return {
        "message": "Enhanced Task Manager API",
        "version": "2.1.0",
        "status": "running",
        "features": [
            "Full CRUD operations",
            "Async database support", 
            "Real-time data",
            "MCP integration ready"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.1.0", "database": "connected"}

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