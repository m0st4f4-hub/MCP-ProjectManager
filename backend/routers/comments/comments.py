from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List, Optional
import uuid

from database import get_db  # Use proper async db
from schemas.comment import Comment, CommentCreate, CommentUpdate
from schemas.api_responses import DataResponse, ListResponse
from crud.comments import (
    get_comment,
    get_comments_by_task,
    create_comment,
    update_comment,
    delete_comment
)

router = APIRouter(
    prefix="/comments",
    tags=["Comments"],
)

@router.post(
    "/", 
    response_model=DataResponse[Comment], 
    status_code=status.HTTP_201_CREATED,
    summary="Create Comment", 
    operation_id="create_comment"
)
async def create_comment_endpoint(
    comment_create: CommentCreate,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Creates a new comment.
    
    - **content**: Required comment content
    - **task_project_id**: ID of the project containing the task
    - **task_task_number**: Task number within the project
    - **author_id**: ID of the comment author
    """
    try:
        db_comment = await create_comment(db=db, comment_create=comment_create)
        return DataResponse[Comment](
            data=Comment.model_validate(db_comment),
            message="Comment created successfully"
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get(
    "/{comment_id}", 
    response_model=DataResponse[Comment], 
    summary="Get Comment by ID", 
    operation_id="get_comment_by_id"
)
async def get_comment_by_id_endpoint(
    comment_id: Annotated[str, Path(description="ID of the comment to retrieve")],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Retrieves a specific comment by its ID.
    
    Returns the comment details if found.
    """
    db_comment = await get_comment(db, comment_id)
    if db_comment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    return DataResponse[Comment](
        data=Comment.model_validate(db_comment),
        message="Comment retrieved successfully"
    )

@router.get(
    "/task/{task_project_id}/{task_task_number}", 
    response_model=ListResponse[Comment], 
    summary="Get Comments by Task", 
    operation_id="get_comments_by_task"
)
async def get_comments_by_task_endpoint(
    task_project_id: Annotated[uuid.UUID, Path(description="Project ID of the task")],
    task_task_number: Annotated[int, Path(description="Task number within the project")],
    skip: Annotated[int, Query(0, description="Skip the first N comments")],
    limit: Annotated[int, Query(100, description="Limit the number of comments returned")],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Retrieves comments for a specific task.
    
    Returns a paginated list of comments for the specified task.
    """
    comments = await get_comments_by_task(
        db, 
        task_project_id=task_project_id, 
        task_task_number=task_task_number, 
        skip=skip, 
        limit=limit
    )
    return ListResponse[Comment](
        data=[Comment.model_validate(comment) for comment in comments],
        total=len(comments),  # This is incorrect for pagination, but a placeholder
        page=int(skip/limit) + 1 if limit > 0 else 1,  # Placeholder
        page_size=limit,
        has_more=len(comments) == limit,  # Placeholder
        message=f"Retrieved {len(comments)} comments for task {task_project_id}/{task_task_number}"
    )

@router.put(
    "/{comment_id}", 
    response_model=DataResponse[Comment], 
    summary="Update Comment", 
    operation_id="update_comment"
)
async def update_comment_endpoint(
    comment_id: Annotated[str, Path(description="ID of the comment to update")],
    comment_update: CommentUpdate,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Updates a comment by ID.
    
    - **content**: Optional new comment content
    """
    db_comment = await update_comment(db, comment_id=comment_id, comment_update=comment_update)
    if db_comment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    return DataResponse[Comment](
        data=Comment.model_validate(db_comment),
        message="Comment updated successfully"
    )

@router.delete(
    "/{comment_id}", 
    response_model=DataResponse[bool], 
    status_code=status.HTTP_200_OK,
    summary="Delete Comment", 
    operation_id="delete_comment"
)
async def delete_comment_endpoint(
    comment_id: Annotated[str, Path(description="ID of the comment to delete")],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Deletes a comment by ID.
    
    This action cannot be undone. The comment will be permanently removed.
    """
    success = await delete_comment(db, comment_id=comment_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    return DataResponse[bool](
        data=True,
        message="Comment deleted successfully"
    )
