"""Minimal tasks router for testing"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from ...database import get_db
from ...services.task_service import TaskService
from ...schemas.task import Task, TaskCreate, TaskUpdate
from ...schemas.api_responses import DataResponse
from typing import List, Optional

router = APIRouter()

@router.post("/", response_model=DataResponse[Task], status_code=201)
async def create_task(
    task: TaskCreate,
    db: AsyncSession = Depends(get_db),
):
    try:
        task_service = TaskService(db)
        # Extract project_id from task data
        project_id = UUID(task.project_id) if hasattr(task, 'project_id') and task.project_id else None
        if not project_id:
            raise HTTPException(status_code=400, detail="project_id is required")
        db_task = await task_service.create_task(project_id=project_id, task=task)
        return DataResponse[Task](data=db_task, message="Task created successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{task_id}", response_model=DataResponse[Task])
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        task_service = TaskService(db)
        # Parse composite task_id (format: project_id:task_number)
        try:
            project_id_str, task_number_str = task_id.split(':', 1)
            project_id = UUID(project_id_str)
            task_number = int(task_number_str)
        except (ValueError, IndexError) as e:
            raise HTTPException(status_code=400, detail=f"Invalid task_id format: {e}")
        
        db_task = await task_service.update_task(
            project_id=project_id, 
            task_number=task_number, 
            task_update=task_update
        )
        return DataResponse[Task](data=db_task, message="Task updated successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.delete("/{task_id}", response_model=DataResponse[bool])
async def delete_task(
    task_id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Get the task before deleting
        task_service = TaskService(db)
        try:
            project_id_str, task_number_str = task_id.split(':', 1)
            project_id = UUID(project_id_str)
            task_number = int(task_number_str)
        except (ValueError, IndexError) as e:
            raise HTTPException(status_code=400, detail=f"Invalid task_id format: {e}")
        
        # Get task before deletion for response
        task_to_delete = await task_service.get_task(project_id=project_id, task_number=task_number)
        
        # Delete the task 
        await task_service.delete_task(project_id=project_id, task_number=task_number)
        
        return DataResponse[bool](data=True, message="Task deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.post("/{project_id}/tasks/", response_model=DataResponse[Task], status_code=201)
async def create_task_for_project(
    project_id: str,
    task: TaskCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        task_service = TaskService(db)
        db_task = await task_service.create_task(project_id=UUID(project_id), task=task)
        return DataResponse[Task](data=db_task, message="Task created successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=DataResponse[List[Task]])
async def get_tasks(
    db: AsyncSession = Depends(get_db),
    project_id: Optional[str] = None,
    skip: int = 0,
    limit: int = Query(20, le=1000),
):
    """Get all tasks with optional project_id filter and pagination"""
    try:
        task_service = TaskService(db)
        tasks = await task_service.get_all_tasks(
            project_id=UUID(project_id) if project_id else None,
            skip=skip,
            limit=limit
        )
        return DataResponse[List[Task]](data=tasks, message="Tasks retrieved successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
