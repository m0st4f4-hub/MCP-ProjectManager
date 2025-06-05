import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from backend.database import Base
from backend.models.agent_verification_requirement import AgentVerificationRequirement


def test_create_verification_requirement_success():
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    with Session() as session:
        req = AgentVerificationRequirement(agent_role_id='r1', requirement='check')
        session.add(req)
        session.commit()
        assert session.query(AgentVerificationRequirement).count() == 1


def test_create_verification_requirement_missing_field():
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    with Session() as session:
        with pytest.raises(IntegrityError):
            req = AgentVerificationRequirement(agent_role_id='r1')
            session.add(req)
            session.commit()
