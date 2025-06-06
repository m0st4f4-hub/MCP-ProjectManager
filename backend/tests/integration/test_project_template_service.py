import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database import Base
from backend.services.project_template_service import ProjectTemplateService
from backend.schemas.project_template import ProjectTemplateCreate


@pytest.fixture()
def sync_session():
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)


def test_create_and_retrieve_template(sync_session):
    service = ProjectTemplateService(sync_session)
    tpl = service.create_template(
        ProjectTemplateCreate(
            name='Template 1',
            description='demo',
            template_data={'default_tasks': []}
        )
    )
    assert tpl.id
    fetched = service.get_template(tpl.id)
    assert fetched is not None
    assert fetched.name == 'Template 1'
    templates = service.get_templates()
    assert len(templates) == 1
