from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas.status_transition import StatusTransition, StatusTransitionCreate
from services.status_transition_service import StatusTransitionService
from auth import get_current_active_user, RoleChecker
from enums import UserRoleEnum
from models import User as UserModel

router = APIRouter(
    prefix="/status-transitions",
    tags=["StatusTransitions"],
    dependencies=[Depends(RoleChecker([UserRoleEnum.ADMIN]))],
)

def get_service(db: Session = Depends(get_db)) -> StatusTransitionService:
    return StatusTransitionService(db)

@router.get("/", response_model=list[StatusTransition])
async def list_transitions(
    service: StatusTransitionService = Depends(get_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    return service.get_transitions()

@router.post("/", response_model=StatusTransition)
async def create_transition(
    transition: StatusTransitionCreate,
    service: StatusTransitionService = Depends(get_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    return service.create_transition(transition)

@router.delete("/{transition_id}")
async def delete_transition(
    transition_id: int,
    service: StatusTransitionService = Depends(get_service),
    current_user: UserModel = Depends(get_current_active_user),
):
    success = service.delete_transition(transition_id)
    if not success:
        raise HTTPException(status_code=404, detail="Transition not found")
    return {"message": "Deleted"}
