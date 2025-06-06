import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from backend.database import Base
from backend.models.agent_forbidden_action import AgentForbiddenAction


def test_create_forbidden_action_success():
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    with Session() as session:
        action = AgentForbiddenAction(agent_role_id='r1', action='avoid')
        session.add(action)
        session.commit()
        assert session.query(AgentForbiddenAction).count() == 1


def test_create_forbidden_action_missing_field():
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    with Session() as session:
        with pytest.raises(IntegrityError):
            action = AgentForbiddenAction(agent_role_id='r1')
            session.add(action)
            session.commit()
