from fastapi import APIRouter
from backend.enums import TaskStatusEnum
from ..schemas.api_responses import ListResponse

router = APIRouter(prefix="/enums", tags=["enums"])


@router.get("/task-status", response_model=ListResponse[str])
async def get_task_status() -> ListResponse[str]:
    """Return list of task status enum values."""
    statuses = [status.value for status in TaskStatusEnum]
    return ListResponse[str](
        data=statuses,
        total=len(statuses),
        page=1,
        page_size=len(statuses),
        has_more=False,
        message="Task status enums"
    )
