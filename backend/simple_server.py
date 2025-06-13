#!/usr/bin/env python3
"""
Simple FastAPI server for testing API with Playwright
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import asyncio
import sqlite3
import os
from datetime import datetime, timedelta
import jwt
import hashlib

# Initialize FastAPI app
app = FastAPI(
    title="Task Manager API",
    description="A simple task management API for testing",
    version="1.0.0"
)

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
SECRET_KEY = "test-secret-key-for-development-only"
ALGORITHM = "HS256"

# Simple in-memory storage for demo
users_db = {
    "admin": {
        "id": 1,
        "username": "admin", 
        "email": "admin@example.com",
        "hashed_password": hashlib.sha256("admin123".encode()).hexdigest(),
        "is_active": True,
        "role": "admin"
    },
    "testuser": {
        "id": 2,
        "username": "testuser",
        "email": "test@example.com", 
        "hashed_password": hashlib.sha256("test123".encode()).hexdigest(),
        "is_active": True,
        "role": "user"
    }
}

tasks_db = [
    {"id": 1, "title": "Setup project", "description": "Initialize the project structure", "status": "completed", "user_id": 1},
    {"id": 2, "title": "Create API", "description": "Build the REST API endpoints", "status": "in_progress", "user_id": 1},
    {"id": 3, "title": "Add tests", "description": "Write comprehensive tests", "status": "pending", "user_id": 2},
]

# Pydantic models
class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    role: str

class Task(BaseModel):
    id: int
    title: str
    description: str
    status: str
    user_id: int

class TaskCreate(BaseModel):
    title: str
    description: str
    status: str = "pending"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

# Auth helpers
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None or username not in users_db:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return users_db[username]
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Task Manager API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_check": "/health"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@app.post("/api/v1/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Authenticate user and return access token"""
    user = users_db.get(user_credentials.username)
    if not user or user["hashed_password"] != hash_password(user_credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/v1/auth/me", response_model=User)
async def get_current_user(current_user = Depends(verify_token)):
    """Get current authenticated user"""
    return User(**current_user)

@app.get("/api/v1/tasks", response_model=List[Task])
async def get_tasks(current_user = Depends(verify_token)):
    """Get all tasks for authenticated user"""
    if current_user["role"] == "admin":
        return [Task(**task) for task in tasks_db]
    else:
        user_tasks = [task for task in tasks_db if task["user_id"] == current_user["id"]]
        return [Task(**task) for task in user_tasks]

@app.post("/api/v1/tasks", response_model=Task)
async def create_task(task_data: TaskCreate, current_user = Depends(verify_token)):
    """Create a new task"""
    new_id = max([task["id"] for task in tasks_db]) + 1 if tasks_db else 1
    new_task = {
        "id": new_id,
        "title": task_data.title,
        "description": task_data.description,
        "status": task_data.status,
        "user_id": current_user["id"]
    }
    tasks_db.append(new_task)
    return Task(**new_task)

@app.get("/api/v1/tasks/{task_id}", response_model=Task)
async def get_task(task_id: int, current_user = Depends(verify_token)):
    """Get a specific task by ID"""
    task = next((task for task in tasks_db if task["id"] == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check permissions
    if current_user["role"] != "admin" and task["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return Task(**task)

@app.put("/api/v1/tasks/{task_id}", response_model=Task)
async def update_task(task_id: int, task_update: TaskUpdate, current_user = Depends(verify_token)):
    """Update a specific task"""
    task = next((task for task in tasks_db if task["id"] == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check permissions
    if current_user["role"] != "admin" and task["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Update fields
    if task_update.title is not None:
        task["title"] = task_update.title
    if task_update.description is not None:
        task["description"] = task_update.description
    if task_update.status is not None:
        task["status"] = task_update.status
    
    return Task(**task)

@app.delete("/api/v1/tasks/{task_id}")
async def delete_task(task_id: int, current_user = Depends(verify_token)):
    """Delete a specific task"""
    task_index = next((i for i, task in enumerate(tasks_db) if task["id"] == task_id), None)
    if task_index is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks_db[task_index]
    # Check permissions
    if current_user["role"] != "admin" and task["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    tasks_db.pop(task_index)
    return {"message": "Task deleted successfully"}

@app.get("/api/v1/users", response_model=List[User])
async def get_users(current_user = Depends(verify_token)):
    """Get all users (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return [User(**user) for user in users_db.values()]

if __name__ == "__main__":
    uvicorn.run("simple_server:app", host="0.0.0.0", port=8000, reload=True)