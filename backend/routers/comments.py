from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession
from typing import List, Optional
import uuid # Import uuid for comment and author IDs

from ..database import get_db
from backend.schemas.comment import Comment, CommentCreate, CommentUpdate
from backend.crud.comments import get_comment, get_comments_by_task, create_comment, update_comment, delete_comment # Import async CRUD functions

# Import standardized API response models
from backend.schemas.api_responses import DataResponse, ListResponse, ErrorResponse


router = APIRouter(
    prefix="/comments",
    tags=["Comments"],
)

# Dependency to get AsyncSession
async def get_async_db():
    async for db in get_db():
        yield db


@router.post("/", response_model=DataResponse[Comment], summary="Create Comment", operation_id="create_comment")
async def create_comment_endpoint(
    comment_create: CommentCreate,
    db: AsyncSession = Depends(get_async_db)
):
    """Creates a new comment."""
    try:
        db_comment = await create_comment(db=db, comment_create=comment_create)
        return DataResponse[Comment](
            data=Comment.model_validate(db_comment),
            message="Comment created successfully"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{comment_id}", response_model=DataResponse[Comment], summary="Get Comment by ID", operation_id="get_comment_by_id")
async def get_comment_by_id_endpoint(
    comment_id: str = Path(..., description="ID of the comment to retrieve"),
    db: AsyncSession = Depends(get_async_db)
):
    """Retrieves a specific comment by its ID."""
    db_comment = await get_comment(db, comment_id)
    if db_comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return DataResponse[Comment](
        data=Comment.model_validate(db_comment),
        message="Comment retrieved successfully"
    )

@router.get("/task/{task_project_id}/{task_task_number}", response_model=ListResponse[Comment], summary="Get Comments by Task", operation_id="get_comments_by_task")
async def get_comments_by_task_endpoint(
    task_project_id: uuid.UUID = Path(..., description="Project ID of the task"),
    task_task_number: int = Path(..., description="Task number within the project"),
    skip: int = Query(0, description="Skip the first N comments."),
    limit: int = Query(100, description="Limit the number of comments returned."),
    db: AsyncSession = Depends(get_async_db)
):
    """Retrieves comments for a specific task."""
    comments = await get_comments_by_task(db, task_project_id=task_project_id, task_task_number=task_task_number, skip=skip, limit=limit)
    # You might want to implement total count for proper pagination in a real app
    return ListResponse[Comment](
        data=[Comment.model_validate(comment) for comment in comments],
        total=len(comments), # This is incorrect for pagination, but a placeholder
        page=int(skip/limit) + 1 if limit > 0 else 1, # Placeholder
        page_size=limit,
        has_more=len(comments) == limit, # Placeholder
        message=f"Retrieved {len(comments)} comments for task {task_project_id}/{task_task_number}"
    )

@router.put("/{comment_id}", response_model=DataResponse[Comment], summary="Update Comment", operation_id="update_comment")
async def update_comment_endpoint(
    comment_update: CommentUpdate,
    comment_id: str = Path(..., description="ID of the comment to update"),
    db: AsyncSession = Depends(get_async_db)
):
    """Updates a comment by ID."""
    db_comment = await update_comment(db, comment_id=comment_id, comment_update=comment_update)
    if db_comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return DataResponse[Comment](
        data=Comment.model_validate(db_comment),
        message="Comment updated successfully"
    )

@router.delete("/{comment_id}", response_model=DataResponse[dict], summary="Delete Comment", operation_id="delete_comment")
async def delete_comment_endpoint(
    comment_id: str = Path(..., description="ID of the comment to delete"),
    db: AsyncSession = Depends(get_async_db)
):
    """Deletes a comment by ID."""
    success = await delete_comment(db, comment_id=comment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found")
    return DataResponse[dict](
        data={"message": "Comment deleted successfully"},
        message="Comment deleted successfully"
    ) 