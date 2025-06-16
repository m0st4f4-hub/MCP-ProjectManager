#!/usr/bin/env python3
"""
Simple backend server for testing purposes
"""
import sys
import os
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(
    title="Task Manager API",
    description="A comprehensive task management system",
    version="2.0.1",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Task Manager API", "version": "2.0.1", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.1"}

@app.get("/api/v1/tasks")
async def get_tasks():
    return {"tasks": [], "message": "Tasks endpoint working"}

@app.get("/api/v1/projects") 
async def get_projects():
    return {"projects": [], "message": "Projects endpoint working"}

@app.get("/docs")
async def get_docs():
    return {"message": "API Documentation", "swagger_url": "/docs"}

if __name__ == "__main__":
    print("\n" + "="*60)
    print(" " * 15 + "TASK MANAGER API")
    print("="*60)
    print("Environment: Development")
    print("Database: SQLite (placeholder)")
    print("API Version: 2.0.1")
    print("API URL: http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")
    print("="*60 + "\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )