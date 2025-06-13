from enums import TaskStatusEnum, ProjectStatus, ProjectPriority, ProjectVisibility, ProjectMemberRole
from fastapi import APIRouter
from schemas.api_responses import ListResponse

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


@router.get("/project-status", response_model=ListResponse[str])
async def get_project_status() -> ListResponse[str]:
    """Return list of project status enum values."""
    statuses = [status.value for status in ProjectStatus]
    return ListResponse[str](
        data=statuses,
        total=len(statuses),
        page=1,
        page_size=len(statuses),
        has_more=False,
        message="Project status enums"
    )


@router.get("/project-priority", response_model=ListResponse[str])
async def get_project_priority() -> ListResponse[str]:
    """Return list of project priority enum values."""
    priorities = [priority.value for priority in ProjectPriority]
    return ListResponse[str](
        data=priorities,
        total=len(priorities),
        page=1,
        page_size=len(priorities),
        has_more=False,
        message="Project priority enums"
    )


@router.get("/project-visibility", response_model=ListResponse[str])
async def get_project_visibility() -> ListResponse[str]:
    """Return list of project visibility enum values."""
    visibilities = [visibility.value for visibility in ProjectVisibility]
    return ListResponse[str](
        data=visibilities,
        total=len(visibilities),
        page=1,
        page_size=len(visibilities),
        has_more=False,
        message="Project visibility enums"
    )


@router.get("/project-member-role", response_model=ListResponse[str])
async def get_project_member_role() -> ListResponse[str]:
    """Return list of project member role enum values."""
    roles = [role.value for role in ProjectMemberRole]
    return ListResponse[str](
        data=roles,
        total=len(roles),
        page=1,
        page_size=len(roles),
        has_more=False,
        message="Project member role enums"
    )
