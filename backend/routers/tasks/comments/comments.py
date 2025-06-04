from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from ...database import get_sync_db as get_db
from ...services.task_service import TaskService  # Assuming comment retrieval is part of task service

from ...schemas.comment import Comment
from ...schemas.api_responses import ListResponse, PaginationParams
from ...services.exceptions import EntityNotFoundError

router = APIRouter()

def get_task_service(db: Session = Depends(get_db)) -> TaskService:
    return TaskService(db)

@router.get(
    "/{project_id}/tasks/{task_number}/comments/",
    response_model=ListResponse[Comment],
    summary="Get Comments for Task",
    tags=["Task Comments"],
    operation_id="projects_tasks_get_task_comments"
)


async def get_task_comments_endpoint(
    project_id: str,
    task_number: int,
    pagination: PaginationParams = Depends(),
    sort_by: Optional[str] = Query(
    "created_at", description="Field to sort by (e.g., \'created_at\')."),
    sort_direction: Optional[str] = Query(
    "asc", description="Sort direction: \'asc\' or \'desc\'."),
    task_service: TaskService = Depends(get_task_service)
):
    """Retrieves a list of comments for a task."""
    try:
    comments, total_comments = await task_service.get_task_comments(
    project_id=uuid.UUID(project_id),
    task_number=task_number,
    skip=pagination.offset,
    limit=pagination.page_size,
    sort_by=sort_by,
    sort_direction=sort_direction
    )
    pydantic_comments = [Comment.model_validate(comment) for comment in comments]
    return ListResponse[Comment](
    data=pydantic_comments,
    total=total_comments,
    page=pagination.page,
    page_size=pagination.page_size,
    has_more=pagination.offset + len(pydantic_comments) < total_comments,
    message=f"Retrieved {len(pydantic_comments)} comments for task"
    )
    except EntityNotFoundError as e:
    raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
    raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
