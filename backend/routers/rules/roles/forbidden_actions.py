

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ....database import get_db
from ....schemas.agent_forbidden_action import (
    AgentForbiddenAction,
    AgentForbiddenActionCreate,
)
from ....schemas.api_responses import DataResponse, ListResponse
from ....services.agent_forbidden_action_service import AgentForbiddenActionService

router = APIRouter()


def get_service(db: AsyncSession = Depends(get_db)) -> AgentForbiddenActionService:
    return AgentForbiddenActionService(db)


@router.get(
    "/{agent_role_id}/forbidden-actions",
    response_model=ListResponse[AgentForbiddenAction],
    summary="List Forbidden Actions",
    operation_id="list_forbidden_actions",
)
async def list_forbidden_actions_endpoint(
    agent_role_id: str,
    service: AgentForbiddenActionService = Depends(get_service),
):
    actions = await service.list_forbidden_actions(agent_role_id)
    return ListResponse[AgentForbiddenAction](
        data=actions,
        total=len(actions),
        page=1,
        page_size=len(actions),
        has_more=False,
        message="Retrieved forbidden actions",
    )


@router.post(
    "/{agent_role_id}/forbidden-actions",
    response_model=DataResponse[AgentForbiddenAction],
    summary="Create Forbidden Action",
    operation_id="create_forbidden_action",
)
async def create_forbidden_action_endpoint(
    agent_role_id: str,
    action_data: AgentForbiddenActionCreate,
    service: AgentForbiddenActionService = Depends(get_service),
):
    action = await service.create_forbidden_action(
        agent_role_id,
        action_data.action,
        action_data.reason,
    )
    return DataResponse[AgentForbiddenAction](
        data=action,
        message="Forbidden action created successfully",
    )


@router.delete(
    "/forbidden-actions/{action_id}",
    response_model=DataResponse[dict],
    summary="Delete Forbidden Action",
    operation_id="delete_forbidden_action",
)
async def delete_forbidden_action_endpoint(
    action_id: str,
    service: AgentForbiddenActionService = Depends(get_service),
):
    success = await service.delete_forbidden_action(action_id)
    if not success:
        raise HTTPException(status_code=404, detail="Forbidden action not found")
    return DataResponse[dict](
        data={"message": "Forbidden action removed"},
        message="Forbidden action removed",
    )
