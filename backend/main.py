import asyncio
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from contextlib import asynccontextmanager

# Import database components and CRUD functions
from . import models, schemas, crud
from .database import engine, get_db

# Import FastApiMCP
from fastapi_mcp import FastApiMCP

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Global state for MCP initialization
mcp_initialized = False
mcp_instance = None

# Lifespan context manager for proper initialization
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize MCP during startup
    global mcp_initialized, mcp_instance
    print(">>> Starting MCP Initialization...")
    try:
        mcp_instance = FastApiMCP(app)
        mcp_instance.mount()
        # Wait for initialization to complete
        await asyncio.sleep(2)  # Increased delay to ensure proper initialization
        mcp_initialized = True
        print(">>> MCP Initialization Complete")
    except Exception as e:
        print(f">>> ERROR during MCP initialization: {e}")
        mcp_initialized = False
    yield
    # Cleanup during shutdown
    print(">>> Shutting down MCP...")
    mcp_initialized = False
    mcp_instance = None

app = FastAPI(title="Project Manager API with Projects & Agents", lifespan=lifespan)

# Middleware to check MCP initialization state
@app.middleware("http")
async def check_mcp_initialization(request: Request, call_next):
    if request.url.path.startswith("/mcp") and not mcp_initialized:
        return JSONResponse(
            status_code=503,
            content={"detail": "MCP server is initializing, please try again in a few seconds"}
        )
    return await call_next(request)

# --- CORS Configuration ---
# Adjust origins for production deployments
origins = [
    "http://localhost",       # Allow localhost (standard)
    "http://localhost:3000",  # Allow Next.js default dev port
    "*"                     # Allow all origins (for development simplicity)
    # Add your frontend deployment URL here in production
    # e.g., "https://your-frontend-domain.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"], # Allows all headers
)
# --- End CORS Configuration ---

# --- Define SAFE Endpoints First ---

@app.get("/", summary="Get API Root Message")
async def get_root_message():
    print("[Backend Log] Request received for /")
    return {"message": "Welcome to the Project Manager API"}

# --- Project Endpoints (SAFE) ---

@app.post("/projects/", response_model=schemas.Project, summary="Create Project", tags=["Projects"])
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    """Creates a new project.
    - **name**: Unique name for the project (required).
    - **description**: Optional description.
    """
    db_project = crud.get_project_by_name(db, name=project.name)
    if db_project:
        raise HTTPException(status_code=400, detail="Project name already registered")
    return crud.create_project(db=db, project=project)

@app.get("/projects/", response_model=List[schemas.Project], summary="Get Projects", tags=["Projects"])
def get_project_list(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieves a list of projects."""
    projects = crud.get_projects(db, skip=skip, limit=limit)
    return projects

@app.get("/projects/{project_id}", response_model=schemas.Project, summary="Get Project by ID", tags=["Projects"])
def get_project_by_id(project_id: int, db: Session = Depends(get_db)):
    """Retrieves a specific project by its ID."""
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

# --- Agent Endpoints (SAFE) ---

@app.post("/agents/", response_model=schemas.Agent, summary="Create Agent", tags=["Agents"])
def create_agent(agent: schemas.AgentCreate, db: Session = Depends(get_db)):
    """Registers a new agent.
    - **name**: Unique name for the agent (required).
    """
    db_agent = crud.get_agent_by_name(db, name=agent.name)
    if db_agent:
        raise HTTPException(status_code=400, detail="Agent name already registered")
    return crud.create_agent(db=db, agent=agent)

@app.get("/agents/", response_model=List[schemas.Agent], summary="Get Agents", tags=["Agents"])
def get_agent_list(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieves a list of registered agents."""
    agents = crud.get_agents(db, skip=skip, limit=limit)
    return agents

@app.get("/agents/{agent_name}", response_model=schemas.Agent, summary="Get Agent by Name", tags=["Agents"])
def get_agent_by_name(agent_name: str, db: Session = Depends(get_db)):
    """Retrieves a specific agent by its unique name."""
    db_agent = crud.get_agent_by_name(db, name=agent_name)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent

# --- Task Endpoints (Updated SAFE) ---

@app.post("/tasks/", response_model=schemas.Task, summary="Create Task with Project/Agent", tags=["Tasks"])
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    """Creates a new task, optionally linking to a project_id and agent_name.
    - **title**: Required.
    - **project_id**: Optional ID of an existing project.
    - **agent_name**: Optional name of an existing agent.
    """
    try:
        # Add validation if needed: check if project_id/agent_name exist before creation
        return crud.create_task(db=db, task=task)
    except Exception as e:
        print(f"Error in create_task: {e}") # Log the specific error
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@app.get("/tasks/", response_model=List[schemas.Task], summary="Get Tasks with Filtering", tags=["Tasks"])
def get_task_list(
    skip: int = 0,
    limit: int = 100,
    project_id: Optional[int] = None, # Filter by project
    agent_name: Optional[str] = None, # Filter by agent
    db: Session = Depends(get_db)
):
    """Retrieves tasks, optionally filtered by project_id or agent_name."""
    # Logic moved to crud.get_tasks
    tasks = crud.get_tasks(db, skip=skip, limit=limit, project_id=project_id, agent_name=agent_name)
    return tasks

@app.get("/tasks/{task_id}", response_model=schemas.Task, summary="Get Task by ID with Project", tags=["Tasks"])
def get_task_by_id(task_id: int, db: Session = Depends(get_db)):
    """Retrieves a specific task by ID, including project info."""
    db_task = crud.get_task(db, task_id=task_id) # crud.get_task now eager loads project
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

# --- Define UNSAFE Endpoints Last ---

# --- Project Update/Delete Endpoints ---
@app.put("/projects/{project_id}", response_model=schemas.Project, summary="Update Project", tags=["Projects"])
def update_project(project_id: int, project_update: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    try:
        db_project = crud.update_project(db, project_id=project_id, project_update=project_update)
        if db_project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        return db_project
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/projects/{project_id}", response_model=schemas.Project, summary="Delete Project", tags=["Projects"])
def delete_project(project_id: int, db: Session = Depends(get_db)):
    db_project = crud.delete_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project # Return the deleted object

# --- Agent GetById/Update/Delete Endpoints ---
# Added GET by ID for consistency
@app.get("/agents/id/{agent_id}", response_model=schemas.Agent, summary="Get Agent by ID", tags=["Agents"])
def get_agent_by_id(agent_id: int, db: Session = Depends(get_db)):
    db_agent = crud.get_agent(db, agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent

@app.put("/agents/{agent_id}", response_model=schemas.Agent, summary="Update Agent", tags=["Agents"])
def update_agent(agent_id: int, agent_update: schemas.AgentUpdate, db: Session = Depends(get_db)):
    try:
        db_agent = crud.update_agent(db, agent_id=agent_id, agent_update=agent_update)
        if db_agent is None:
            raise HTTPException(status_code=404, detail="Agent not found")
        return db_agent
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/agents/{agent_id}", response_model=schemas.Agent, summary="Delete Agent", tags=["Agents"])
def delete_agent(agent_id: int, db: Session = Depends(get_db)):
    db_agent = crud.delete_agent(db, agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent # Return the deleted object


# --- Task Update/Delete Endpoints ---
@app.put("/tasks/{task_id}", response_model=schemas.Task, summary="Update Task (incl. Project/Agent)", tags=["Tasks"])
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db)):
    # Ensure task_update schema is correct (already handled by Pydantic validation)
    # Logic moved to crud.update_task
    try:
        db_task = crud.update_task(db, task_id=task_id, task_update=task_update)
        if db_task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        return db_task
    except ValueError as e: # Catch specific errors like Project/Agent not found
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error in update_task: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@app.delete("/tasks/{task_id}", response_model=schemas.Task, summary="Delete Task by ID", tags=["Tasks"])
def delete_task(task_id: int, db: Session = Depends(get_db)):
    # Logic moved to crud.delete_task
    # Now returns a serialized Pydantic model to avoid DetachedInstanceError
    db_task = crud.delete_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task # Return the deleted object


# --- MCP Integration (Old Placement - Removed) ---
# try:
#     print("Attempting to initialize and mount FastApiMCP...")
#     mcp = FastApiMCP(app) # Try simplest initialization first
#     mcp.mount() # Try simplest mount first
#     print("FastApiMCP initialized and mounted successfully.")
# except TypeError as e:
#     print(f"ERROR initializing/mounting FastApiMCP: {e}")
#     print("FastApiMCP integration might be incompatible or misconfigured.")
# # --- End MCP Integration ---



# --- Placeholder for future planning endpoint (if needed outside MCP) ---
class PlanningRequest(BaseModel):
    goal: str

class PlanningResponse(BaseModel):
    prompt: str

@app.post("/planning/generate-prompt", response_model=PlanningResponse, summary="Generate Overmind Planning Prompt", tags=["Planning"], operation_id="gen_overmind_planning_prompt")
def generate_overmind_planning_prompt(request: PlanningRequest):
    # This is a simplified direct implementation. 
    # In a full system, this might call a service or use a more complex generation logic.
    # For now, we'll just echo back a formatted string for demonstration.
    
    # Example of constructing a more detailed prompt (can be expanded)
    structured_prompt = (
        f"Goal: {request.goal}\n\n"
        f"Please generate a detailed plan for the Overmind agent to achieve this goal. "
        f"Consider breaking down the goal into smaller, manageable tasks. "
        f"Identify potential challenges and suggest mitigation strategies."
    )
    return PlanningResponse(prompt=structured_prompt)

# It's good practice to ensure that uvicorn is only run when the script is executed directly.
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)
