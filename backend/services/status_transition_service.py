from sqlalchemy.orm import Session
from typing import List, Optional

from ..models import StatusTransition
from ..schemas.status_transition import StatusTransitionCreate

class StatusTransitionService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_transitions(self) -> List[StatusTransition]:
        return self.db.query(StatusTransition).all()

    def create_transition(self, transition: StatusTransitionCreate) -> StatusTransition:
        db_obj = StatusTransition(**transition.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete_transition(self, transition_id: int) -> bool:
        obj = self.db.query(StatusTransition).get(transition_id)
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True
