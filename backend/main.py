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
    print(">>> Starting MCP Initialization...", flush=True)
    try:
        mcp_instance = FastApiMCP(app)
        mcp_instance.mount()
        # Wait for initialization to complete
        await asyncio.sleep(2)  # Increased delay to ensure proper initialization
        mcp_initialized = True
        print(">>> MCP Initialization Complete", flush=True)
    except Exception as e:
        print(f">>> ERROR during MCP initialization: {e}", flush=True)
        mcp_initialized = False
    yield
    # Cleanup during shutdown
    print(">>> Shutting down MCP...", flush=True)
    mcp_initialized = False
    mcp_instance = None

app = FastAPI(title="Task Manager API with Projects & Agents", lifespan=lifespan)

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
    return {"message": "Welcome to the Task Manager API"}

# --- Project Endpoints (SAFE) ---

@app.post("/projects/", response_model=schemas.Project, summary="Create Project", tags=["Projects"])
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    """
    Creates a new project in the system.

    **Purpose for Agents:**
    Agents can use this endpoint to programmatically create new projects when a task
    or a series of tasks requires a new organizational container. For example,
    an Overmind agent might create a new project before assigning related sub-tasks.

    **Inputs:**
    - `project` (schemas.ProjectCreate):
        - `name` (str): Unique name for the project (required). Must not already exist.
        - `description` (str, optional): A brief description of the project's purpose.

    **Outputs:**
    - Returns the newly created `schemas.Project` object upon success.
    - Raises HTTPException (400) if a project with the same name already exists.
    """
    db_project = crud.get_project_by_name(db, name=project.name)
    if db_project:
        raise HTTPException(status_code=400, detail="Project name already registered")
    return crud.create_project(db=db, project=project)

@app.get("/projects/", response_model=List[schemas.Project], summary="Get Projects", tags=["Projects"])
def get_project_list(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieves a list of all projects currently available in the system.

    **Purpose for Agents:**
    Agents can use this endpoint to discover existing projects. This might be useful for
    listing available projects to an Overmind or for an agent that needs to associate
    a task with an existing project.

    **Inputs (Query Parameters):**
    - `skip` (int, optional, default=0): Number of projects to skip for pagination.
    - `limit` (int, optional, default=100): Maximum number of projects to return.

    **Outputs:**
    - Returns a list of `schemas.Project` objects. The list may be empty if no projects exist
      or if the skip/limit parameters result in no projects being selected.
    """
    projects = crud.get_projects(db, skip=skip, limit=limit)
    return projects

@app.get("/projects/{project_id}", response_model=schemas.Project, summary="Get Project by ID", tags=["Projects"])
def get_project_by_id(project_id: int, db: Session = Depends(get_db)):
    """
    Retrieves a specific project by its unique ID.

    **Purpose for Agents:**
    Agents can use this endpoint to fetch detailed information about a specific project
    when they have its ID. This is useful for verifying a project's existence or
    retrieving its details before performing further actions related to it (e.g., assigning tasks).

    **Inputs (Path Parameter):**
    - `project_id` (int): The unique identifier of the project to retrieve.

    **Outputs:**
    - Returns the `schemas.Project` object if found.
    - Raises HTTPException (404) if no project with the given ID is found.
    """
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

# --- Agent Endpoints (SAFE) ---

@app.post("/agents/", response_model=schemas.Agent, summary="Create Agent", tags=["Agents"])
def create_agent(agent: schemas.AgentCreate, db: Session = Depends(get_db)):
    """
    Registers a new agent in the system.

    **Purpose for Agents:**
    This endpoint allows for the programmatic registration of new agent entities.
    An Overmind or a specialized spawner agent might use this to add new worker agents
    to the available pool.

    **Inputs:**
    - `agent` (schemas.AgentCreate):
        - `name` (str): Unique name for the agent (required). Must not already exist.
        - `description` (str, optional): A brief description of the agent's capabilities or purpose.

    **Outputs:**
    - Returns the newly created `schemas.Agent` object upon success.
    - Raises HTTPException (400) if an agent with the same name already exists.
    """
    db_agent = crud.get_agent_by_name(db, name=agent.name)
    if db_agent:
        raise HTTPException(status_code=400, detail="Agent name already registered")
    return crud.create_agent(db=db, agent=agent)

@app.get("/agents/", response_model=List[schemas.Agent], summary="Get Agents", tags=["Agents"])
def get_agent_list(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieves a list of all registered agents in the system.

    **Purpose for Agents:**
    Agents can use this endpoint to discover other available agents. This is useful for
    an Overmind to see its workforce, or for agents that might need to delegate tasks
    or collaborate with other specific agents.

    **Inputs (Query Parameters):**
    - `skip` (int, optional, default=0): Number of agents to skip for pagination.
    - `limit` (int, optional, default=100): Maximum number of agents to return.

    **Outputs:**
    - Returns a list of `schemas.Agent` objects. The list may be empty if no agents exist.
    """
    agents = crud.get_agents(db, skip=skip, limit=limit)
    return agents

@app.get("/agents/{agent_name}", response_model=schemas.Agent, summary="Get Agent by Name", tags=["Agents"])
def get_agent_by_name(agent_name: str, db: Session = Depends(get_db)):
    """
    Retrieves a specific agent by its unique name.

    **Purpose for Agents:**
    Allows agents to fetch detailed information about a specific agent when its unique name
    is known. This can be used to verify an agent's existence, capabilities (via description),
    or to get its ID for other operations.

    **Inputs (Path Parameter):**
    - `agent_name` (str): The unique name of the agent to retrieve.

    **Outputs:**
    - Returns the `schemas.Agent` object if found.
    - Raises HTTPException (404) if no agent with the given name is found.
    """
    db_agent = crud.get_agent_by_name(db, name=agent_name)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent

# --- Task Endpoints (Updated SAFE) ---

@app.post("/tasks/", response_model=schemas.Task, summary="Create Task with Project/Agent", tags=["Tasks"])
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    """
    Creates a new task, with options to link it to a project and assign it to an agent.

    **Purpose for Agents:**
    This is a primary endpoint for agents (e.g., Overmind, or user-facing interface agents)
    to create new units of work. Tasks can be standalone or associated with a specific
    project and/or assigned to a particular agent for execution.

    **Inputs:**
    - `task` (schemas.TaskCreate):
        - `title` (str): A descriptive title for the task (required).
        - `description` (str, optional): More detailed information about the task.
        - `project_id` (int, optional): The ID of an existing project to associate this task with.
        - `agent_name` (str, optional): The unique name of an existing agent to assign this task to.
        - `status` (str, optional, default="pending"): The initial status of the task.

    **Outputs:**
    - Returns the newly created `schemas.Task` object upon success.
    - May raise HTTPException if referenced `project_id` or `agent_name` are invalid (though
      current CRUD implementation might not explicitly check this before creation, relying on DB constraints or later validation).
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
    """
    Retrieves a list of tasks, with optional filtering by project ID and/or agent name.

    **Purpose for Agents:**
    Agents can use this endpoint to query for tasks based on various criteria.
    For example, an Overmind might query all tasks for a specific project, or an individual
    agent might query for tasks specifically assigned to it.

    **Inputs (Query Parameters):**
    - `skip` (int, optional, default=0): Number of tasks to skip for pagination.
    - `limit` (int, optional, default=100): Maximum number of tasks to return.
    - `project_id` (int, optional): If provided, only tasks associated with this project ID are returned.
    - `agent_name` (str, optional): If provided, only tasks assigned to this agent name are returned.

    **Outputs:**
    - Returns a list of `schemas.Task` objects matching the criteria.
      The list can be empty if no tasks match or due to pagination.
    """
    # Logic moved to crud.get_tasks
    tasks = crud.get_tasks(db, skip=skip, limit=limit, project_id=project_id, agent_name=agent_name)
    return tasks

@app.get("/tasks/{task_id}", response_model=schemas.Task, summary="Get Task by ID with Project", tags=["Tasks"])
def get_task_by_id(task_id: int, db: Session = Depends(get_db)):
    """
    Retrieves a specific task by its unique ID, including associated project and agent information.

    **Purpose for Agents:**
    Allows agents to fetch all details of a specific task when its ID is known.
    This is essential for an agent to understand the requirements, status, and associations
    of a task it needs to process or report on.

    **Inputs (Path Parameter):**
    - `task_id` (int): The unique identifier of the task to retrieve.

    **Outputs:**
    - Returns the `schemas.Task` object if found (including project and agent details if linked).
    - Raises HTTPException (404) if no task with the given ID is found.
    """
    db_task = crud.get_task(db, task_id=task_id) # crud.get_task now eager loads project
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

# --- Define UNSAFE Endpoints Last ---

# --- Project Update/Delete Endpoints ---
@app.put("/projects/{project_id}", response_model=schemas.Project, summary="Update Project", tags=["Projects"])
def update_project(project_id: int, project_update: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    """
    Updates an existing project by its ID.

    **Purpose for Agents:**
    Agents can use this to modify details of an existing project, such as its name
    or description. This should be used with caution as it alters persisted data.

    **Inputs:**
    - `project_id` (int, Path): The ID of the project to update.
    - `project_update` (schemas.ProjectUpdate, Body): An object containing the fields to update.
      Only provided fields will be updated.

    **Outputs:**
    - Returns the updated `schemas.Project` object.
    - Raises HTTPException (404) if the project is not found.
    - Raises HTTPException (400) if the update data is invalid (e.g., duplicate name).
    """
    try:
        db_project = crud.update_project(db, project_id=project_id, project_update=project_update)
        if db_project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        return db_project
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/projects/{project_id}", response_model=schemas.Project, summary="Delete Project", tags=["Projects"])
def delete_project(project_id: int, db: Session = Depends(get_db)):
    """
    Deletes a project by its ID. CAUTION: This is a destructive operation.

    **Purpose for Agents:**
    Allows agents to remove projects that are no longer needed. Agents should confirm
    this action if possible, or ensure it's part of a well-defined automated cleanup process,
    as project deletion can impact associated tasks.

    **Inputs (Path Parameter):**
    - `project_id` (int): The ID of the project to delete.

    **Outputs:**
    - Returns the deleted `schemas.Project` object as confirmation.
    - Raises HTTPException (404) if the project is not found.
    """
    db_project = crud.delete_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project # Return the deleted object

# --- Agent GetById/Update/Delete Endpoints ---
# Added GET by ID for consistency
@app.get("/agents/id/{agent_id}", response_model=schemas.Agent, summary="Get Agent by ID", tags=["Agents"])
def get_agent_by_id(agent_id: int, db: Session = Depends(get_db)):
    """
    Retrieves a specific agent by its unique ID.

    **Purpose for Agents:**
    Allows agents to fetch detailed information about a specific agent when its ID is known.
    This is an alternative to `get_agent_by_name` when the numeric ID is available.

    **Inputs (Path Parameter):**
    - `agent_id` (int): The unique identifier of the agent to retrieve.

    **Outputs:**
    - Returns the `schemas.Agent` object if found.
    - Raises HTTPException (404) if no agent with the given ID is found.
    """
    db_agent = crud.get_agent(db, agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent

@app.put("/agents/{agent_id}", response_model=schemas.Agent, summary="Update Agent", tags=["Agents"])
def update_agent(agent_id: int, agent_update: schemas.AgentUpdate, db: Session = Depends(get_db)):
    """
    Updates an existing agent by its ID.

    **Purpose for Agents:**
    Agents can use this to modify details of an existing registered agent, such as its name
    or description. Caution is advised as this changes persisted agent information.

    **Inputs:**
    - `agent_id` (int, Path): The ID of the agent to update.
    - `agent_update` (schemas.AgentUpdate, Body): Object with fields to update.

    **Outputs:**
    - Returns the updated `schemas.Agent` object.
    - Raises HTTPException (404) if the agent is not found.
    - Raises HTTPException (400) for invalid data (e.g., duplicate name).
    """
    try:
        db_agent = crud.update_agent(db, agent_id=agent_id, agent_update=agent_update)
        if db_agent is None:
            raise HTTPException(status_code=404, detail="Agent not found")
        return db_agent
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/agents/{agent_id}", response_model=schemas.Agent, summary="Delete Agent", tags=["Agents"])
def delete_agent(agent_id: int, db: Session = Depends(get_db)):
    """
    Deletes an agent by its ID. CAUTION: This is a destructive operation.

    **Purpose for Agents:**
    Enables agents to remove other agent registrations. This should be used carefully,
    ideally with confirmation or by authorized system management agents, as it can affect
    task assignments and system capabilities.

    **Inputs (Path Parameter):**
    - `agent_id` (int): The ID of the agent to delete.

    **Outputs:**
    - Returns the deleted `schemas.Agent` object as confirmation.
    - Raises HTTPException (404) if the agent is not found.
    """
    db_agent = crud.delete_agent(db, agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent # Return the deleted object


# --- Task Update/Delete Endpoints ---
@app.put("/tasks/{task_id}", response_model=schemas.Task, summary="Update Task (incl. Project/Agent)", tags=["Tasks"])
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db)):
    """
    Updates an existing task by its ID. Allows modification of title, description, status,
    and associated project_id or agent_name.

    **Purpose for Agents:**
    Agents use this endpoint to reflect changes in a task's lifecycle (e.g., updating status
    from 'pending' to 'in_progress' or 'completed'), reassign tasks, or modify details.

    **Inputs:**
    - `task_id` (int, Path): The ID of the task to update.
    - `task_update` (schemas.TaskUpdate, Body): Object with fields to update (e.g., title,
      description, status, project_id, agent_name).

    **Outputs:**
    - Returns the updated `schemas.Task` object.
    - Raises HTTPException (404) if the task is not found.
    - Raises HTTPException (400) if referenced project_id or agent_name is invalid, or for other
      validation errors related to the update data.
    """
    # Ensure task_update schema is correct (already handled by Pydantic validation)
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
    """
    Deletes a task by its ID. CAUTION: This is a destructive operation.

    **Purpose for Agents:**
    Allows agents to remove tasks from the system, for instance, when a task is
    cancelled or erroneously created. Should be used with consideration for data integrity.

    **Inputs (Path Parameter):**
    - `task_id` (int): The ID of the task to delete.

    **Outputs:**
    - Returns the deleted `schemas.Task` object as confirmation.
    - Raises HTTPException (404) if the task is not found.
    """
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
    """
    Generates a structured planning prompt for an Overmind agent based on a high-level goal.

    **Purpose for Agents (Overmind):**
    This tool is designed to be called by an Overmind agent at the beginning of a complex task.
    The Overmind provides a high-level `goal`, and this endpoint returns a more detailed
    and structured prompt. This prompt should guide the Overmind in decomposing the goal
    into smaller, manageable sub-tasks, identifying necessary resources, and planning
    the execution flow according to the "Ultra-Deep Thinking Protocol".

    **Inputs:**
    - `request`: A `PlanningRequest` object containing:
        - `goal` (str): A high-level description of the task or objective the Overmind agent
                       needs to plan and orchestrate. For example: "Refactor the user authentication module."

    **Outputs:**
    - Returns a `PlanningResponse` object containing:
        - `prompt` (str): A detailed, structured prompt intended to be used by the Overmind
                         agent to initiate its planning process. This prompt may include
                         sections for outlining sub-tasks, identifying assumptions, planning
                         verification steps, and considering potential risks.

    **Example Interaction:**
    An Overmind agent, upon receiving a new complex assignment, would call this endpoint
    with the overall goal. The returned prompt then serves as the foundational template for
    the Overmind's internal planning and task delegation process.
    """
    # This is a simplified direct implementation. 
    # In a full system, this might call a service or use a more complex generation logic.
    
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
