from .routers.projects import PlanningRequest, PlanningResponse
from fastapi import Request, Depends
from sqlalchemy.orm import Session


async def generate_project_manager_planning_prompt(request: PlanningRequest, db: Session):
    # Dummy implementation for test compatibility
    return PlanningResponse(prompt=f"Planning for goal: {request.goal}")
