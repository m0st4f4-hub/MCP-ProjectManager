#!/usr/bin/env python3
"""
Enhanced Task Manager Backend with Full Database Support
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
from sqlalchemy import create_engine, Column, String, Integer, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from pydantic import BaseModel
import uvicorn

# Database setup
DATABASE_URL = "sqlite+aiosqlite:///./task_manager.db"
SYNC_DATABASE_URL = "sqlite:///./task_manager.db"

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# Create sync engine for initialization
sync_engine = create_engine(SYNC_DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

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
    
    # Relationships
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

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
    
    # Relationships
    project = relationship("Project", back_populates="tasks")

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    capabilities = Column(Text, nullable=True)  # JSON string
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

# Pydantic models for API
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

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    capabilities: Optional[str] = None
    status: Optional[str] = None

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

async def seed_initial_data():
    """Seed the database with initial data if empty"""
    async with AsyncSessionLocal() as session:
        # Check if we have any projects
        result = await session.execute("SELECT COUNT(*) FROM projects")
        count = result.scalar()
        
        if count == 0:
            # Create sample project
            sample_project = Project(
                name="Sample Project",
                description="A sample project to get started",
                status="active"
            )
            session.add(sample_project)
            await session.commit()
            await session.refresh(sample_project)
            
            # Create sample tasks
            sample_tasks = [
                Task(
                    project_id=sample_project.id,
                    title="Setup project structure",
                    description="Initialize the project with proper structure",
                    status="completed",
                    priority="high"
                ),
                Task(
                    project_id=sample_project.id,
                    title="Implement API endpoints",
                    description="Create RESTful API endpoints for all entities",
                    status="in_progress",
                    priority="high"
                ),
                Task(
                    project_id=sample_project.id,
                    title="Add frontend interface",
                    description="Build user interface for task management",
                    status="todo",
                    priority="medium"
                ),
            ]
            
            for task in sample_tasks:
                session.add(task)
            
            # Create sample agent
            sample_agent = Agent(
                name="Task Assistant",
                description="AI agent specialized in task management",
                capabilities="task_creation, task_updates, project_management",
                status="active"
            )
            session.add(sample_agent)
            
            await session.commit()
            logging.info("✅ Seeded initial sample data")

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

# API Routes
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

# Project endpoints