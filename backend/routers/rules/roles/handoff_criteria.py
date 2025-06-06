<<<<<<< HEAD
<<<<<<< HEAD
from fastapi import APIRouter, Depends, HTTPException, Query
=======
from fastapi import APIRouter, Depends, HTTPException
>>>>>>> origin/codex/add-agent_handoff_service-with-crud-methods
=======
from fastapi import APIRouter, Depends, HTTPException
>>>>>>> origin/codex/add-agent_handoff_service-with-crud-methods
from sqlalchemy.orm import Session
from typing import List, Optional

from ....database import get_sync_db as get_db
<<<<<<< HEAD
<<<<<<< HEAD
from ....services.agent_handoff_service import AgentHandoffService
=======
>>>>>>> origin/codex/add-agent_handoff_service-with-crud-methods
=======
>>>>>>> origin/codex/add-agent_handoff_service-with-crud-methods
from ....schemas.agent_handoff_criteria import (
    AgentHandoffCriteria,
    AgentHandoffCriteriaCreate,
    AgentHandoffCriteriaUpdate,
)
<<<<<<< HEAD
<<<<<<< HEAD
=======
from ....services.agent_handoff_service import AgentHandoffService
>>>>>>> origin/codex/add-agent_handoff_service-with-crud-methods
=======
from ....services.agent_handoff_service import AgentHandoffService
>>>>>>> origin/codex/add-agent_handoff_service-with-crud-methods

router = APIRouter()


<<<<<<< HEAD
<<<<<<< HEAD
@router.get("/", response_model=List[AgentHandoffCriteria])
def list_handoff_criteria(
    agent_role_id: Optional[str] = Query(None, description="Filter by agent role"),
    db: Session = Depends(get_db),
):
    """List handoff criteria, optionally filtered by agent role."""
    service = AgentHandoffService(db)
    return service.list_criteria(agent_role_id)


@router.get("/{criteria_id}", response_model=AgentHandoffCriteria)
def get_handoff_criteria(
    criteria_id: str,
    db: Session = Depends(get_db),
):
    """Retrieve a single handoff criteria by ID."""
    service = AgentHandoffService(db)
    db_obj = service.get_criteria(criteria_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Criteria not found")
    return db_obj


@router.post("/", response_model=AgentHandoffCriteria)
def create_handoff_criteria(
    criteria: AgentHandoffCriteriaCreate,
    db: Session = Depends(get_db),
):
    """Create new handoff criteria."""
=======
=======
>>>>>>> origin/codex/add-agent_handoff_service-with-crud-methods
@router.post("/", response_model=AgentHandoffCriteria)
def create_handoff_criteria(
    criteria: AgentHandoffCriteriaCreate, db: Session = Depends(get_db)
):
<<<<<<< HEAD
>>>>>>> origin/codex/add-agent_handoff_service-with-crud-methods
=======
>>>>>>> origin/codex/add-agent_handoff_service-with-crud-methods
    service = AgentHandoffService(db)
    return service.create_criteria(criteria)


<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> origin/codex/add-agent_handoff_service-with-crud-methods
@router.get("/", response_model=List[AgentHandoffCriteria])
def list_handoff_criteria(
    agent_role_id: Optional[str] = None, db: Session = Depends(get_db)
):
    service = AgentHandoffService(db)
    return service.get_criteria_list(agent_role_id)


<<<<<<< HEAD
>>>>>>> origin/codex/add-agent_handoff_service-with-crud-methods
=======
>>>>>>> origin/codex/add-agent_handoff_service-with-crud-methods
@router.put("/{criteria_id}", response_model=AgentHandoffCriteria)
def update_handoff_criteria(
    criteria_id: str,
    criteria_update: AgentHandoffCriteriaUpdate,
    db: Session = Depends(get_db),
):
<<<<<<< HEAD
<<<<<<< HEAD
    """Update existing handoff criteria."""
    service = AgentHandoffService(db)
    db_obj = service.update_criteria(criteria_id, criteria_update)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Criteria not found")
    return db_obj


@router.delete("/{criteria_id}", response_model=DataResponse[bool])
def delete_handoff_criteria(
    criteria_id: str,
    db: Session = Depends(get_db),
):
    """Delete handoff criteria by ID."""
    service = AgentHandoffService(db)
    success = service.delete_criteria(criteria_id)
    if not success:
        raise HTTPException(status_code=404, detail="Criteria not found")
    return DataResponse[bool](data=True, message="Criteria deleted successfully")
=======
=======
>>>>>>> origin/codex/add-agent_handoff_service-with-crud-methods
    service = AgentHandoffService(db)
    updated = service.update_criteria(criteria_id, criteria_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Handoff criteria not found")
    return updated


@router.delete("/{criteria_id}")
def delete_handoff_criteria(criteria_id: str, db: Session = Depends(get_db)):
    service = AgentHandoffService(db)
    success = service.delete_criteria(criteria_id)
    if not success:
        raise HTTPException(status_code=404, detail="Handoff criteria not found")
    return {"message": "Handoff criteria deleted"}
<<<<<<< HEAD
>>>>>>> origin/codex/add-agent_handoff_service-with-crud-methods
=======
>>>>>>> origin/codex/add-agent_handoff_service-with-crud-methods
