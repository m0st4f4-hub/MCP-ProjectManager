import asyncio
from fastapi import FastAPI, Depends, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from contextlib import asynccontextmanager
import multiprocessing
import logging

# Import database components and CRUD functions
from . import models, schemas, crud
from .database import engine, get_db

# Import FastApiMCP
from fastapi_mcp import FastApiMCP

# Set up logging
logger = logging.getLogger(__name__)

# Database tables are now created by migrations (for production) 
# or by test setup (for testing), not here directly.
# models.Base.metadata.create_all(bind=engine) # MODIFIED: Commented out for Alembic-driven schema

# Global state for MCP initialization
# mcp_initialized = False # REMOVED
# mcp_instance = None # REMOVED

# Attempt to set multiprocessing start method to 'spawn'
# This is a guess, hoping it might resolve recursion if MCP uses multiprocessing.
# try:
#     multiprocessing.set_start_method('spawn', force=True)
#     print(">>> Multiprocessing start method set to 'spawn'")
# except RuntimeError:
#     print(">>> Multiprocessing start method already set or failed to set.")
#     pass # Might already be set or not applicable on this OS/context

# Lifespan context manager for logging startup and shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[LIFESPAN] Application startup...")
    # print("[LIFESPAN] Initializing Database...") # REMOVED - Assumes DB is managed by migrations (Alembic)
    # await init_db() # REMOVED - Assumes DB is managed by migrations (Alembic)
    # print("[LIFESPAN] Database initialized.") # REMOVED

    # --- FastApiMCP Integration ---
    print("[LIFESPAN] Initializing FastApiMCP...")
    # Instantiate MCP inside the lifespan
    mcp_instance = FastApiMCP(app) # Create instance HERE
    print("[LIFESPAN] FastApiMCP instance created.")

    app.state.mcp_instance = mcp_instance # Assign the created instance
    print(f"[LIFESPAN] Stored MCP instance in app.state.mcp_instance")

    print(f"[LIFESPAN] Calling mcp_instance.setup_server()...")
    mcp_instance.setup_server() # Mounts routes - Pass app if needed by your setup_server version
    print(f"[LIFESPAN] mcp_instance.setup_server() called.")

    print(f"[LIFESPAN] Calling mcp_instance.mount()...")
    mcp_instance.mount() # This might have internal async init
    print(f"[LIFESPAN] mcp_instance.mount() called. MCP endpoint should be available.")

    print("[LIFESPAN] Adding a small delay to allow MCP internal tasks to fully initialize...")
    await asyncio.sleep(1) # Reduced delay slightly
    print("[LIFESPAN] Delay finished.")
    # End --- FastApiMCP Integration ---

    yield
    print("[LIFESPAN] Application shutdown...")
    # Perform cleanup here if needed for mcp_instance
    # For example, if mcp_instance has a shutdown method:
    # await mcp_instance.shutdown()

app = FastAPI(
    title="Task Manager API",
    description="API for managing projects, agents, tasks, and subtasks.",
    version="0.2.0",
    lifespan=lifespan
)

# --- NEW: Add Logging Middleware FIRST ---
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"[Connection Log] Incoming request from {request.client.host} for {request.url.path}", flush=True)
    response = await call_next(request)
    # You could add response status logging here too if needed
    # print(f"[Connection Log] Response status: {response.status_code}")
    return response
# --- END Logging Middleware ---

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
async def get_root_message(): # MODIFIED to remove 'request: Request'
    print("[Backend Log] Request received for /")
    return {"message": "Welcome to the Project Manager API"} # REVERTED to simple message

@app.get("/mcp-docs", summary="Get MCP Tools Documentation", tags=["MCP Documentation"])
async def get_mcp_tool_documentation(request: Request):
    """Get documentation for all MCP tools."""
    logger.info("Request received for /mcp-docs")
    
    # Get MCP instance reliably from app state
    mcp_instance = getattr(request.app.state, 'mcp_instance', None)
    if mcp_instance is None:
        # Log an error or raise an exception if MCP instance is not found
        logger.error("MCP instance not found in app.state during /mcp-docs request.")
        raise HTTPException(
            status_code=500,
            detail="MCP integration not properly initialized or found in application state."
        )
    
    tools_dict = {}
    try:
        if hasattr(mcp_instance, 'tools') and isinstance(mcp_instance.tools, dict):
            tools_dict = mcp_instance.tools
    except Exception as e:
        logger.error(f"Error accessing MCP instance tools: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error accessing MCP tools: {str(e)}"
        )

    # Process routes and tools
    routes = []
    for route in request.app.router.routes:
        if not hasattr(route, "path"):
            continue
            
        path = route.path or ""
        if not path:
            continue
            
        name = getattr(route, "name", None) or path
        description = getattr(route, "description", "") or ""
        methods = list(route.methods) if hasattr(route, "methods") and route.methods else []
        
        routes.append({
            "path": path,
            "name": name,
            "description": description,
            "methods": methods
        })

    # Format the response in the expected format
    mcp_tool_docs_md = "# MCP Project Manager Tools Documentation\n\n"
    
    # Add tools documentation
    if tools_dict:
        for tool_name, tool_info in tools_dict.items():
            mcp_tool_docs_md += f"## `{tool_name}`\n"
            if isinstance(tool_info, dict) and "description" in tool_info:
                mcp_tool_docs_md += f"- **Description**: {tool_info['description']}\n\n"
            else:
                mcp_tool_docs_md += f"- **Description**: Tool information not available\n\n"
    
    # Add routes documentation
    route_docs_added = False
    for route in routes:
        if route["path"].startswith("/mcp") or route["path"] in ["/mcp-docs", "/openapi.json", "/docs"]:
            continue
            
        route_docs_added = True
        tool_name = route["name"]
        if not tool_name or tool_name == "/{}" or tool_name == "/":
            tool_name = "unnamed_route"
            
        mcp_tool_name = f"mcp_project-manager_{tool_name}"
        
        mcp_tool_docs_md += f"## `{mcp_tool_name}` (derived from `{tool_name}`)\n"
        mcp_tool_docs_md += f"- **Original Path**: `{route['path']}`\n"
        mcp_tool_docs_md += f"- **Methods**: `{', '.join(route['methods'])}`\n"
        mcp_tool_docs_md += f"- **Description**: {route['description']}\n\n"

    if not tools_dict and not route_docs_added:
        mcp_tool_docs_md += "No MCP project-manager tools found via route inspection or MCP router not fully initialized at the time of this request for the /mcp-docs path."

    return {
        "message": "MCP Project Manager API - Tools Documentation",
        "mcp_project_manager_tools_documentation": mcp_tool_docs_md,
        "routes": routes,
        "tools": tools_dict
    }

# --- Project Endpoints (SAFE) ---

@app.post("/projects/", response_model=schemas.Project, summary="Create Project", tags=["Projects"], operation_id="create_project")
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    """Creates a new project.
    - **name**: Unique name for the project (required).
    - **description**: Optional description.
    """
    db_project = crud.get_project_by_name(db, name=project.name)
    if db_project:
        raise HTTPException(status_code=400, detail="Project name already registered")
    return crud.create_project(db=db, project=project)

@app.get("/projects/", response_model=List[schemas.Project], summary="Get Projects", tags=["Projects"], operation_id="get_projects")
def get_project_list(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieves a list of projects."""
    projects = crud.get_projects(db, skip=skip, limit=limit)
    return projects

@app.get("/projects/{project_id}", response_model=schemas.Project, summary="Get Project by ID", tags=["Projects"], operation_id="get_project_by_id")
def get_project_by_id(project_id: str, db: Session = Depends(get_db)):
    """Retrieves a specific project by its ID."""
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

# --- Agent Endpoints (SAFE) ---

@app.post("/agents/", response_model=schemas.Agent, summary="Create Agent", tags=["Agents"], operation_id="create_agent")
def create_agent(agent: schemas.AgentCreate, db: Session = Depends(get_db)):
    """Registers a new agent.
    - **name**: Unique name for the agent (required).
    """
    db_agent = crud.get_agent_by_name(db, name=agent.name)
    if db_agent:
        raise HTTPException(status_code=400, detail="Agent name already registered")
    return crud.create_agent(db=db, agent=agent)

@app.get("/agents/", response_model=List[schemas.Agent], summary="Get Agents", tags=["Agents"], operation_id="get_agents")
def get_agent_list(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieves a list of registered agents."""
    agents = crud.get_agents(db, skip=skip, limit=limit)
    return agents

@app.get("/agents/{agent_name}", response_model=schemas.Agent, summary="Get Agent by Name", tags=["Agents"], operation_id="get_agent_by_name")
def get_agent_by_name(agent_name: str, db: Session = Depends(get_db)):
    """Retrieves a specific agent by its unique name."""
    db_agent = crud.get_agent_by_name(db, name=agent_name)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent

# --- Task Endpoints (Updated SAFE) ---

@app.post("/tasks/", response_model=schemas.Task, summary="Create Task with Project/Agent", tags=["Tasks"], operation_id="create_task")
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    """Creates a new task, optionally linking to a project_id, agent_id, and parent_task_id.
    - **title**: Required.
    - **project_id**: Optional ID of an existing project.
    - **agent_id**: Optional ID of an existing agent.
    - **parent_task_id**: Optional ID of an existing parent task.
    """
    try:
        return crud.create_task(db=db, task=task)
    except ValueError as e: # Catch specific errors like Project/Agent/ParentTask not found
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error in create_task: {e}") # Log the specific error
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@app.get("/tasks/", response_model=List[schemas.Task], summary="Get Tasks with Filtering", tags=["Tasks"], operation_id="get_tasks")
def get_task_list(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    project_id: Optional[str] = None,
    agent_name: Optional[str] = None
):
    """Retrieve a list of tasks, with optional filtering."""
    agent_id = None
    if agent_name:
        agent = crud.get_agent_by_name(db, name=agent_name)
        if not agent:
            return []  # Return empty list if agent doesn't exist
        agent_id = agent.id

    tasks = crud.get_tasks(
        db,
        skip=skip,
        limit=limit,
        project_id=project_id,
        agent_id=agent_id
    )
    return tasks

@app.get("/tasks/{task_id}", response_model=schemas.Task, summary="Get Task by ID with Project", tags=["Tasks"], operation_id="get_task_by_id")
def get_task_by_id(task_id: str, db: Session = Depends(get_db)):
    """Retrieves a specific task by ID, including project info."""
    db_task = crud.get_task(db, task_id=task_id) # crud.get_task now eager loads project
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@app.get("/tasks/{parent_task_id}/subtasks/", response_model=List[schemas.Subtask], summary="List Subtasks for a Parent Task", tags=["Tasks"], operation_id="list_subtasks_for_parent")
def list_subtasks(parent_task_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List direct subtasks for a given parent task ID."""
    # Check if parent task exists, still good practice
    parent_task_check = crud.get_task(db, task_id=parent_task_id) 
    if parent_task_check is None:
        raise HTTPException(status_code=404, detail=f"Parent task with id {parent_task_id} not found")
    
    subtasks = crud.list_subtasks_crud(db, parent_task_id=parent_task_id, skip=skip, limit=limit)
    return subtasks

# --- Individual Subtask Endpoints (NEW) ---
@app.get("/subtasks/{subtask_id}", response_model=schemas.Subtask, summary="Get Subtask by ID", tags=["Subtasks"], operation_id="get_subtask_by_id")
def get_subtask_endpoint(subtask_id: str, db: Session = Depends(get_db)):
    db_subtask = crud.get_subtask(db, subtask_id=subtask_id)
    if db_subtask is None:
        raise HTTPException(status_code=404, detail=f"Subtask with id {subtask_id} not found")
    return db_subtask

@app.put("/subtasks/{subtask_id}", response_model=schemas.Subtask, summary="Update Subtask by ID", tags=["Subtasks"], operation_id="update_subtask_by_id")
def update_subtask_endpoint(subtask_id: str, subtask_update: schemas.SubtaskUpdate, db: Session = Depends(get_db)):
    db_subtask = crud.update_subtask(db, subtask_id=subtask_id, subtask_update=subtask_update)
    if db_subtask is None:
        raise HTTPException(status_code=404, detail=f"Subtask with id {subtask_id} not found for update")
    return db_subtask

@app.delete("/subtasks/{subtask_id}", response_model=schemas.Subtask, summary="Delete Subtask by ID", tags=["Subtasks"], operation_id="delete_subtask_by_id")
def delete_subtask_endpoint(subtask_id: str, db: Session = Depends(get_db)):
    # The crud.delete_subtask currently returns the ORM model before deletion.
    # The response_model=schemas.Subtask will attempt to validate this.
    # This is consistent with how other delete endpoints in this API behave.
    db_subtask_deleted = crud.delete_subtask(db, subtask_id=subtask_id)
    if db_subtask_deleted is None:
        raise HTTPException(status_code=404, detail=f"Subtask with id {subtask_id} not found for deletion")
    return db_subtask_deleted

# --- Define UNSAFE Endpoints Last ---

# --- Project Update/Delete Endpoints ---
@app.put("/projects/{project_id}", response_model=schemas.Project, summary="Update Project", tags=["Projects"], operation_id="update_project_by_id")
def update_project(project_id: str, project_update: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    try:
        db_project = crud.update_project(db, project_id=project_id, project_update=project_update)
        if db_project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        db.refresh(db_project)
        return db_project
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Unexpected error in PUT /projects/{project_id}: {e}")
        # Check if the exception wraps an HTTPException
        if isinstance(e.__cause__, HTTPException) or isinstance(e.args[0], HTTPException):
            http_exc = e.__cause__ if isinstance(e.__cause__, HTTPException) else e.args[0]
            raise http_exc
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@app.delete("/projects/{project_id}", response_model=schemas.Project, summary="Delete Project", tags=["Projects"], operation_id="delete_project_by_id")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    db_project = crud.delete_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project # Return the deleted object

# --- Agent GetById/Update/Delete Endpoints ---
# Added GET by ID for consistency
@app.get("/agents/id/{agent_id}", response_model=schemas.Agent, summary="Get Agent by ID", tags=["Agents"], operation_id="get_agent_by_id")
def get_agent_by_id_endpoint(agent_id: str, db: Session = Depends(get_db)):
    db_agent = crud.get_agent(db, agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent

@app.put("/agents/{agent_id}", response_model=schemas.Agent, summary="Update Agent", tags=["Agents"], operation_id="update_agent_by_id")
def update_agent(agent_id: str, agent_update: schemas.AgentUpdate, db: Session = Depends(get_db)):
    try:
        db_agent = crud.update_agent(db, agent_id=agent_id, agent_update=agent_update)
        if db_agent is None:
            raise HTTPException(status_code=404, detail="Agent not found")
        return db_agent
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Unexpected error in PUT /agents/{agent_id}: {e}")
        # Check if the exception wraps an HTTPException
        if isinstance(e.__cause__, HTTPException) or isinstance(e.args[0], HTTPException):
            http_exc = e.__cause__ if isinstance(e.__cause__, HTTPException) else e.args[0]
            raise http_exc
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@app.delete("/agents/{agent_id}", response_model=schemas.Agent, summary="Delete Agent", tags=["Agents"], operation_id="delete_agent_by_id")
def delete_agent(agent_id: str, db: Session = Depends(get_db)):
    db_agent = crud.delete_agent(db, agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent # Return the deleted object


# --- Task Update/Delete Endpoints ---
@app.put("/tasks/{task_id}", response_model=schemas.Task, summary="Update Task (incl. Project/Agent)", tags=["Tasks"], operation_id="update_task_by_id")
def update_task(task_id: str, task_update: schemas.TaskUpdate, db: Session = Depends(get_db)):
    try:
        # crud.update_task now raises HTTPException(404) if task not found
        updated_task_orm = crud.update_task(db=db, task_id=task_id, task_update=task_update)
        # The check for updated_task_orm is None is no longer needed here
        return updated_task_orm
    except HTTPException as http_exc: # Re-raise HTTPExceptions from crud (like 404)
        raise http_exc 
    except ValueError as e: # Catch other validation errors from crud (e.g., invalid project_id)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Unexpected error in PUT /tasks/{task_id}: {e}")
        # Check if the exception wraps an HTTPException
        if isinstance(e.__cause__, HTTPException) or isinstance(e.args[0], HTTPException):
            http_exc = e.__cause__ if isinstance(e.__cause__, HTTPException) else e.args[0]
            raise http_exc
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@app.delete("/tasks/{task_id}", response_model=schemas.Task, summary="Delete Task", tags=["Tasks"], operation_id="delete_task_by_id")
def delete_task(task_id: str, db: Session = Depends(get_db)):
    try:
        db_task = crud.delete_task(db, task_id=task_id)
        if db_task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        return db_task
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Unexpected error in DELETE /tasks/{task_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during task deletion: Something went wrong")


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

# MODIFIED: Renamed function, updated route, added DB dependency, enhanced prompt
@app.post("/projects/generate-planning-prompt", response_model=PlanningResponse, summary="Generate Project Manager Planning Prompt", tags=["Projects", "Planning"], operation_id="generate_project_manager_planning_prompt")
async def generate_project_manager_planning_prompt(request: PlanningRequest, db: Session = Depends(get_db)):
    """Generates a planning prompt instructing an LLM to utilize available agents."""
    
    # Fetch available agents
    agents = crud.get_agents(db=db, skip=0, limit=200) # Fetch a reasonable number of agents
    agent_list_str = "\n".join([f"- {agent.name} (ID: {agent.id})" for agent in agents])
    if not agent_list_str:
        agent_list_str = "- No agents found in the database."

    # Construct the enhanced prompt
    prompt_content = f"""Goal: {request.goal}

Please generate a detailed, step-by-step plan to achieve the stated goal. 

Available Project Manager Agents:
{agent_list_str}

Instructions:
1.  Break down the goal into smaller, manageable tasks suitable for assignment.
2.  For each task, suggest which of the available agents listed above would be most appropriate to assign it to, considering their likely roles or specializations based on their names.
3.  Identify potential challenges or dependencies between tasks.
4.  Structure the output clearly as a plan.
"""
    
    return PlanningResponse(prompt=prompt_content)

# Endpoint to create a subtask for a given task
# MODIFIED: Added explicit operation_id
@app.post("/tasks/{parent_task_id}/subtasks/", response_model=schemas.Subtask, summary="Create Subtask for Task", tags=["Subtasks"], operation_id="create_subtask")
def create_subtask(parent_task_id: str, subtask: schemas.SubtaskClientCreate, db: Session = Depends(get_db)):
    """
    Create a new subtask for a given parent task.
    """
    # Verify parent task exists
    parent_task = crud.get_task(db=db, task_id=parent_task_id)
    if parent_task is None:
        raise HTTPException(status_code=404, detail="Parent task not found")

    # Create the subtask using CRUD operation
    # Make sure schemas.SubtaskClientCreate aligns with crud.create_subtask expectations
    db_subtask = crud.create_subtask(db=db, subtask=subtask, parent_task_id=parent_task_id)
    if db_subtask is None:
        # This might happen if DB operation fails, e.g., constraint violation
        raise HTTPException(status_code=500, detail="Failed to create subtask in database")
    return db_subtask

# --- MOVE FastApiMCP setup TO HERE (END OF FILE) ---
# Ensure this block is after ALL @app.route definitions
# print("\n>>> Initializing and mounting FastApiMCP at the end of the file...")
# mcp_instance_at_end = FastApiMCP(app)
# mcp_instance_at_end.setup_server()
# print(">>> FastApiMCP setup_server() called (at end).")
# mcp_instance_at_end.mount()
# print(">>> FastApiMCP mounted (at end). MCP endpoint should be available.")
# --- END REMOVED BLOCK ---
