# Task ID: <taskId>
# Agent Role: ImplementationSpecialist
# Request ID: <requestId>
# Project: task-manager
# Timestamp: <timestamp>

import asyncio
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from contextlib import asynccontextmanager
import logging

# Import database components
from backend.database import get_db, Base, engine, SessionLocal

# Import FastApiMCP
from fastapi_mcp import FastApiMCP

# Import routers
from backend.routers import projects
from backend.routers import agents
from backend.routers import audit_logs
from backend.routers import tasks
from backend.routers import rules
from backend.routers import memory

# Import schemas
from backend import schemas

# Import Planning schemas and function
from backend.routers.projects import PlanningRequest, PlanningResponse
from backend.planning import generate_project_manager_planning_prompt

# Set up logging
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Handles startup and shutdown events.
    # On startup logic
    logger.info("Starting up...")
    # Example: Initialize database connections, load models, etc.
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    
    # Initialize default rules framework data
    try:
        from backend.services.rules_service import RulesService
        with SessionLocal() as db:
            rules_service = RulesService(db)
            rules_service.initialize_default_rules()
            logger.info("Rules framework initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize rules framework: {e}")
    
    yield  # Application runs here.
    # On shutdown logic
    logger.info("Shutting down...")
    # Example: Close database connections, clean up resources, etc.


app = FastAPI(lifespan=lifespan)  # Apply the lifespan context manager


# CORS middleware
# Add CORS middleware to allow cross-origin requests from the frontend.
# Adjust origins as needed for your frontend deployment.
origins = [
    "http://localhost:3000",  # Allow your frontend development server
    # Add other origins for production if necessary
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)


# Dependency to get the DB session
def get_db_session():
    db = get_db()
    try:
        yield db
    finally:
        db.close()


# Include routers
app.include_router(projects.router, tags=["projects"])
app.include_router(tasks.router, tags=["tasks"])
app.include_router(agents.router, tags=["agents"])
app.include_router(audit_logs.router, tags=["audit_logs"])
app.include_router(rules.router, tags=["rules"])
app.include_router(memory.router, tags=["memory"])


# Basic GET endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Project Manager API"}


# Health check endpoint
@app.get("/health")
def health_check(db: Session = Depends(get_db_session)):
    # Dependency injection for DB session
    # Check database connection by attempting to query
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))  # Use sqlalchemy.text for literal SQL
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise HTTPException(
            status_code=500, detail="Database connection failed")


# MCP agent endpoint
@app.post("/mcp-agent/{agent_name}")
async def mcp_agent_endpoint(
    agent_name: str,
    request: Request,
    db: Session = Depends(get_db_session)  # Dependency injection
):
    """MCP agent endpoint with rules framework integration"""
    from backend.services.rules_service import RulesService
    import time
    
    start_time = time.time()
    rules_service = RulesService(db)
    
    try:
        # Get request body
        request_body = await request.json()
        
        # Log agent action start
        rules_service.log_agent_action(
            agent_name=agent_name,
            action_type="mcp_request_start",
            action_description=f"Started processing MCP request",
            action_data={"endpoint": f"/mcp-agent/{agent_name}"}
        )
        
        # Validate agent can perform requested task
        validation_result = rules_service.validate_agent_task(agent_name, request_body)
        
        if not validation_result["is_valid"]:
            # Log rule violation
            for violation in validation_result["violations"]:
                rules_service.log_rule_violation(
                    agent_name=agent_name,
                    violation_type="task_validation_failed",
                    description=violation,
                    severity="high"
                )
            
            duration = int(time.time() - start_time)
            rules_service.log_agent_action(
                agent_name=agent_name,
                action_type="mcp_request_failed",
                action_description="Request failed rule validation",
                success=False,
                error_message=f"Rule violations: {', '.join(validation_result['violations'])}",
                duration_seconds=duration
            )
            
            raise HTTPException(
                status_code=400, 
                detail=f"Agent {agent_name} cannot perform requested task. Violations: {validation_result['violations']}"
            )
        
        # Get agent prompt with rules
        agent_prompt = rules_service.get_agent_prompt(agent_name, request_body)
        
        # TODO: Here you would integrate with actual MCP/agent processing
        # For now, return the rules-based response
        
        duration = int(time.time() - start_time)
        rules_service.log_agent_action(
            agent_name=agent_name,
            action_type="mcp_request_completed",
            action_description="Successfully processed MCP request with rules",
            success=True,
            duration_seconds=duration
        )
        
        return {
            "message": f"MCP request processed for {agent_name}",
            "agent_name": agent_name,
            "validation_passed": True,
            "agent_prompt": agent_prompt,
            "request_body": request_body
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log unexpected errors
        duration = int(time.time() - start_time)
        rules_service.log_agent_action(
            agent_name=agent_name,
            action_type="mcp_request_error",
            action_description="Unexpected error during MCP request",
            success=False,
            error_message=str(e),
            duration_seconds=duration
        )
        
        # Get error protocol if available
        error_protocol = rules_service.get_error_protocol(agent_name, "unexpected_error")
        if error_protocol:
            logger.info(f"Following error protocol for {agent_name}: {error_protocol}")
        
        raise HTTPException(status_code=500, detail=f"Internal error processing request for {agent_name}")


# Planning endpoint
@app.post("/planning")
async def planning_endpoint(
    planning_request: PlanningRequest,
    db: Session = Depends(get_db_session)  # Dependency injection
):
    """Planning endpoint with rules framework integration"""
    from backend.services.rules_service import RulesService
    
    rules_service = RulesService(db)
    
    # Generate basic planning prompt
    planning_prompt = generate_project_manager_planning_prompt(planning_request)
    
    # Get ProjectManager agent prompt with rules
    agent_prompt = rules_service.get_agent_prompt("ProjectManager", {
        "goal": planning_request.goal,
        "context": planning_request.model_dump()
    })
    
    # Log planning action
    rules_service.log_agent_action(
        agent_name="ProjectManager",
        action_type="planning_request",
        action_description=f"Generated planning prompt for goal: {planning_request.goal}",
        action_data={"goal": planning_request.goal}
    )
    
    # Combine planning prompt with agent rules
    enhanced_prompt = f"""# Project Manager Planning Request

## Rules and Guidelines
{agent_prompt}

## Planning Context
{planning_prompt}

## Instructions
Follow the above rules and guidelines while creating the project plan. Ensure all mandates are adhered to and verify your plan against the agent capabilities and requirements.
"""
    
    return PlanningResponse(prompt=enhanced_prompt)


# Example of including other routers
# app.include_router(other_router)

# Example of custom exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail}
    )


# Example of including MCP FastAPI router
# mcp_router = FastApiMCP()
# app.include_router(mcp_router)
