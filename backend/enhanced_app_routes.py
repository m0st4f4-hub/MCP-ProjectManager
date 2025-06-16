# Project endpoints
@app.get("/api/v1/projects", response_model=List[ProjectResponse])
async def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all projects with optional filtering"""
    query = "SELECT * FROM projects"
    params = []
    
    if status:
        query += " WHERE status = ?"
        params.append(status)
    
    query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {skip}"
    
    result = await db.execute(query, params)
    projects = result.fetchall()
    
    # Get task counts for each project
    response_projects = []
    for project in projects:
        task_count_result = await db.execute(
            "SELECT COUNT(*) FROM tasks WHERE project_id = ?", 
            [project.id]
        )
        task_count = task_count_result.scalar() or 0
        
        project_dict = {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "status": project.status,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "task_count": task_count
        }
        response_projects.append(ProjectResponse(**project_dict))
    
    return response_projects

@app.post("/api/v1/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, db: AsyncSession = Depends(get_db)):
    """Create a new project"""
    new_project = Project(
        name=project.name,
        description=project.description,
        status=project.status
    )
    
    db.add(new_project)
    await db.commit()
    await db.refresh(new_project)
    
    return ProjectResponse(
        id=new_project.id,
        name=new_project.name,
        description=new_project.description,
        status=new_project.status,
        created_at=new_project.created_at,
        updated_at=new_project.updated_at,
        task_count=0
    )

@app.get("/api/v1/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific project by ID"""
    result = await db.execute("SELECT * FROM projects WHERE id = ?", [project_id])
    project = result.fetchone()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get task count
    task_count_result = await db.execute(
        "SELECT COUNT(*) FROM tasks WHERE project_id = ?", 
        [project_id]
    )
    task_count = task_count_result.scalar() or 0
    
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        status=project.status,
        created_at=project.created_at,
        updated_at=project.updated_at,
        task_count=task_count
    )

@app.put("/api/v1/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str, 
    project_update: ProjectUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update a project"""
    # Check if project exists
    result = await db.execute("SELECT * FROM projects WHERE id = ?", [project_id])
    project = result.fetchone()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Build update query
    updates = []
    params = []
    
    if project_update.name is not None:
        updates.append("name = ?")
        params.append(project_update.name)
    
    if project_update.description is not None:
        updates.append("description = ?")
        params.append(project_update.description)
    
    if project_update.status is not None:
        updates.append("status = ?")
        params.append(project_update.status)
    
    if updates:
        updates.append("updated_at = ?")
        params.append(datetime.utcnow())
        params.append(project_id)
        
        query = f"UPDATE projects SET {', '.join(updates)} WHERE id = ?"
        await db.execute(query, params)
        await db.commit()
    
    # Return updated project
    return await get_project(project_id, db)

@app.delete("/api/v1/projects/{project_id}")
async def delete_project(project_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a project and all its tasks"""
    # Check if project exists
    result = await db.execute("SELECT * FROM projects WHERE id = ?", [project_id])
    project = result.fetchone()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Delete all tasks first
    await db.execute("DELETE FROM tasks WHERE project_id = ?", [project_id])
    
    # Delete project
    await db.execute("DELETE FROM projects WHERE id = ?", [project_id])
    await db.commit()
    
    return {"message": "Project deleted successfully"}

# Task endpoints
@app.get("/api/v1/tasks", response_model=List[TaskResponse])
async def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    project_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all tasks with optional filtering"""
    query = "SELECT * FROM tasks"
    params = []
    conditions = []
    
    if project_id:
        conditions.append("project_id = ?")
        params.append(project_id)
    
    if status:
        conditions.append("status = ?")
        params.append(status)
    
    if priority:
        conditions.append("priority = ?")
        params.append(priority)
    
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    
    query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {skip}"
    
    result = await db.execute(query, params)
    tasks = result.fetchall()
    
    return [TaskResponse(
        id=task.id,
        project_id=task.project_id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        completed_at=task.completed_at,
        created_at=task.created_at,
        updated_at=task.updated_at
    ) for task in tasks]

@app.post("/api/v1/tasks", response_model=TaskResponse)
async def create_task(task: TaskCreate, db: AsyncSession = Depends(get_db)):
    """Create a new task"""
    # Verify project exists
    result = await db.execute("SELECT id FROM projects WHERE id = ?", [task.project_id])
    if not result.fetchone():
        raise HTTPException(status_code=404, detail="Project not found")
    
    new_task = Task(
        project_id=task.project_id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date
    )
    
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    
    return TaskResponse(
        id=new_task.id,
        project_id=new_task.project_id,
        title=new_task.title,
        description=new_task.description,
        status=new_task.status,
        priority=new_task.priority,
        due_date=new_task.due_date,
        completed_at=new_task.completed_at,
        created_at=new_task.created_at,
        updated_at=new_task.updated_at
    )

@app.get("/api/v1/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific task by ID"""
    result = await db.execute("SELECT * FROM tasks WHERE id = ?", [task_id])
    task = result.fetchone()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return TaskResponse(
        id=task.id,
        project_id=task.project_id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        completed_at=task.completed_at,
        created_at=task.created_at,
        updated_at=task.updated_at
    )

@app.put("/api/v1/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str, 
    task_update: TaskUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update a task"""
    # Check if task exists
    result = await db.execute("SELECT * FROM tasks WHERE id = ?", [task_id])
    task = result.fetchone()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Build update query
    updates = []
    params = []
    
    if task_update.title is not None:
        updates.append("title = ?")
        params.append(task_update.title)
    
    if task_update.description is not None:
        updates.append("description = ?")
        params.append(task_update.description)
    
    if task_update.status is not None:
        updates.append("status = ?")
        params.append(task_update.status)
        
        # If marking as completed, set completed_at
        if task_update.status == "completed":
            updates.append("completed_at = ?")
            params.append(datetime.utcnow())
        elif task.status == "completed" and task_update.status != "completed":
            # If removing completed status, clear completed_at
            updates.append("completed_at = NULL")
    
    if task_update.priority is not None:
        updates.append("priority = ?")
        params.append(task_update.priority)
    
    if task_update.due_date is not None:
        updates.append("due_date = ?")
        params.append(task_update.due_date)
    
    if updates:
        updates.append("updated_at = ?")
        params.append(datetime.utcnow())
        params.append(task_id)
        
        query = f"UPDATE tasks SET {', '.join(updates)} WHERE id = ?"
        await db.execute(query, params)
        await db.commit()
    
    # Return updated task
    return await get_task(task_id, db)

@app.delete("/api/v1/tasks/{task_id}")
async def delete_task(task_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a task"""
    # Check if task exists
    result = await db.execute("SELECT * FROM tasks WHERE id = ?", [task_id])
    task = result.fetchone()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Delete task
    await db.execute("DELETE FROM tasks WHERE id = ?", [task_id])
    await db.commit()
    
    return {"message": "Task deleted successfully"}

# Agent endpoints
@app.get("/api/v1/agents", response_model=List[AgentResponse])
async def get_agents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all agents with optional filtering"""
    query = "SELECT * FROM agents"
    params = []
    
    if status:
        query += " WHERE status = ?"
        params.append(status)
    
    query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {skip}"
    
    result = await db.execute(query, params)
    agents = result.fetchall()
    
    return [AgentResponse(
        id=agent.id,
        name=agent.name,
        description=agent.description,
        capabilities=agent.capabilities,
        status=agent.status,
        created_at=agent.created_at,
        updated_at=agent.updated_at
    ) for agent in agents]

@app.post("/api/v1/agents", response_model=AgentResponse)
async def create_agent(agent: AgentCreate, db: AsyncSession = Depends(get_db)):
    """Create a new agent"""
    new_agent = Agent(
        name=agent.name,
        description=agent.description,
        capabilities=agent.capabilities,
        status=agent.status
    )
    
    db.add(new_agent)
    await db.commit()
    await db.refresh(new_agent)
    
    return AgentResponse(
        id=new_agent.id,
        name=new_agent.name,
        description=new_agent.description,
        capabilities=new_agent.capabilities,
        status=new_agent.status,
        created_at=new_agent.created_at,
        updated_at=new_agent.updated_at
    )

# Statistics endpoint
@app.get("/api/v1/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Get application statistics"""
    # Count projects
    projects_result = await db.execute("SELECT COUNT(*) FROM projects")
    total_projects = projects_result.scalar() or 0
    
    # Count tasks by status
    tasks_result = await db.execute("""
        SELECT status, COUNT(*) as count 
        FROM tasks 
        GROUP BY status
    """)
    task_stats = {row.status: row.count for row in tasks_result.fetchall()}
    
    # Count agents
    agents_result = await db.execute("SELECT COUNT(*) FROM agents")
    total_agents = agents_result.scalar() or 0
    
    # Get recent activity
    recent_tasks_result = await db.execute("""
        SELECT title, status, created_at 
        FROM tasks 
        ORDER BY created_at DESC 
        LIMIT 5
    """)
    recent_tasks = [
        {
            "title": row.title,
            "status": row.status,
            "created_at": row.created_at
        }
        for row in recent_tasks_result.fetchall()
    ]
    
    return {
        "projects": {
            "total": total_projects
        },
        "tasks": {
            "total": sum(task_stats.values()),
            "by_status": task_stats
        },
        "agents": {
            "total": total_agents
        },
        "recent_activity": recent_tasks,
        "database": "connected",
        "version": "2.1.0"
    }

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