import sys
import os
print("---- sys.path ----")
for p in sys.path:
    print(p)
print("--------------------")
print("---- os.getcwd() ----")
print(os.getcwd())
print("---------------------")


"""
Task Manager Backend - Simplified Main Application
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any

# Local imports
from backend.database import get_db, Base, engine #, SessionLocal # SessionLocal not used here
# from backend.models import User as UserModel # Example, if you needed User model directly

# Import routers
from backend.routers import mcp, projects, agents, audit_logs, memory, rules, tasks, users

logger = logging.getLogger(__name__)

# Create all tables in the database
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting Task Manager Backend...")
    
    # Initialize database tables
    try:
        # Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise
    
    yield
    logger.info("Shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Task Manager API",
    version="2.0.0",
    description="Task Manager with MCP integration",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# --- Health Check and Basic Routes ---
@app.get("/")
async def read_root():
    return {"message": "Welcome to the Task Manager API"}

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check(db: Session = Depends(get_db)) -> Dict[str, str]:
    try:
        # Attempt a simple query to check DB connection
        db.execute("SELECT 1")
        db_status = "connected"
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        db_status = "error"
    return {"status": "healthy", "database": db_status}

@app.get("/test-mcp")
async def test_mcp(request: Request) -> Dict[str, Any]:
    return {
        "message": "MCP Test Endpoint",
        "headers": dict(request.headers),
        "client_host": request.client.host if request.client else "unknown"
    }

# Include routers
app.include_router(agents.router)
app.include_router(audit_logs.router)
app.include_router(memory.router)
app.include_router(mcp.router, prefix="/mcp-tools")
app.include_router(projects.router)
app.include_router(rules.router)
app.include_router(tasks.router)
app.include_router(users.router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Optional: Add a custom exception handler for HTTPExceptions if needed
# @app.exception_handler(HTTPException)
# async def http_exception_handler(request: Request, exc: HTTPException):
#     return JSONResponse(
#         status_code=exc.status_code,
#         content={"detail": exc.detail, "headers": exc.headers if hasattr(exc, 'headers') else None},
#     )

# Optional: Add a generic exception handler for unhandled errors
# @app.exception_handler(Exception)
# async def generic_exception_handler(request: Request, exc: Exception):
#     logger.error(f"Unhandled exception: {exc}", exc_info=True)
#     return JSONResponse(
#         status_code=500,
#         content={"detail": "An unexpected error occurred."},
#     )


if __name__ == "__main__":
    import uvicorn
    # Note: For production, consider using Gunicorn or another ASGI server
    # Also, remove reload=True for production
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
