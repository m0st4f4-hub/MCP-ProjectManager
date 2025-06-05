from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ....database import get_sync_db as get_db
from ....schemas.agent_forbidden_action import (
    AgentForbiddenAction,
    AgentForbiddenActionCreate,
)
from ....schemas.api_responses import DataResponse, ListResponse
from ....services.agent_forbidden_action_service import AgentForbiddenActionService

router = APIRouter()


def get_service(db: Session = Depends(get_db)) -> AgentForbiddenActionService:
    return AgentForbiddenActionService(db)


@router.get(
    "/{agent_role_id}/forbidden-actions",
    response_model=ListResponse[AgentForbiddenAction],
    summary="List Forbidden Actions",
    operation_id="list_forbidden_actions",
)
async def list_forbidden_actions_endpoint(
    agent_role_id: str,
    skip: int = Query(0, ge=0, description="Records to skip"),
    limit: int = Query(100, gt=0, description="Max records to return"),
    service: AgentForbiddenActionService = Depends(get_service),
):
    actions = await service.list_forbidden_actions(agent_role_id, skip=skip, limit=limit)
    total_actions = await service.list_forbidden_actions(agent_role_id, skip=0, limit=None)
    return ListResponse[AgentForbiddenAction](
        data=actions,
        total=len(total_actions),
        page=skip // limit + 1,
        page_size=limit,
        has_more=skip + len(actions) < len(total_actions),
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
