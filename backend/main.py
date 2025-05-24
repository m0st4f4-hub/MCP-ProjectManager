"""
Task Manager Backend - Simplified Main Application
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

# Local imports
from backend.database import get_db, Base, engine, SessionLocal

# Import routers
from backend.routers import mcp, projects, agents, audit_logs, memory, rules, tasks, users

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting Task Manager Backend...")
    
    # Initialize database tables
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise
    
    yield
    logger.info("Shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Task Manager API",
    description="Task Manager with MCP integration",
    version="2.0.0",
    lifespan=lifespan
)

# Include routers
app.include_router(agents.router)
app.include_router(audit_logs.router)
app.include_router(memory.router)
app.include_router(projects.router)
app.include_router(rules.router)
app.include_router(tasks.router)
app.include_router(users.router)
app.include_router(mcp.router, prefix="/mcp-tools")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """Root endpoint."""
    return {
        "message": "Task Manager API v2.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint."""
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "version": "2.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Database connection failed")


@app.get("/test-mcp")
def test_mcp():
    """Test MCP functionality."""
    return {
        "mcp_status": "available",
        "tools": ["project_management", "task_management", "memory_management"],
        "message": "MCP tools ready"
    }
