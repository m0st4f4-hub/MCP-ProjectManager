import types
from datetime import datetime, timezone

import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

from backend.routers.workflows.core import router, get_workflow_service
from backend.schemas.workflow import Workflow, WorkflowCreate, WorkflowUpdate
from backend.auth import get_current_active_user


class DummyService:
    def __init__(self):
        self.workflows = {}
        self.next_id = 1

    def create_workflow(self, workflow: WorkflowCreate):
        wf = Workflow(
            id=str(self.next_id),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            **workflow.model_dump(),
        )
        self.workflows[wf.id] = wf
        self.next_id += 1
        return wf

    def get_workflow(self, workflow_id: str):
        return self.workflows.get(workflow_id)

    def get_workflows(self, skip: int = 0, limit: int = 100):
        return list(self.workflows.values())[skip : skip + limit]

    def update_workflow(self, workflow_id: str, workflow_update: WorkflowUpdate):
        wf = self.workflows.get(workflow_id)
        if not wf:
            return None
        data = wf.model_dump()
        data.update(workflow_update.model_dump(exclude_unset=True))
        data["updated_at"] = datetime.now(timezone.utc)
        wf = Workflow(**data)
        self.workflows[workflow_id] = wf
        return wf

    def delete_workflow(self, workflow_id: str):
        return self.workflows.pop(workflow_id, None) is not None


dummy_service = DummyService()


def override_service():
    return dummy_service


dummy_user = types.SimpleNamespace(id="u")


def override_user():
    return dummy_user


app = FastAPI()
app.include_router(router)
app.dependency_overrides[get_workflow_service] = override_service
app.dependency_overrides[get_current_active_user] = override_user


@pytest.mark.asyncio
async def test_create_and_get_workflow():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        resp = await client.post(
            "/workflows/",
            json={"name": "Test", "workflow_type": "basic"},
        )
        assert resp.status_code == 201
        wf_id = resp.json()["data"]["id"]

        resp = await client.get(f"/workflows/{wf_id}")
        assert resp.status_code == 200
        assert resp.json()["data"]["name"] == "Test"


@pytest.mark.asyncio
async def test_update_and_delete_workflow():
    wf = dummy_service.create_workflow(
        WorkflowCreate(name="Temp", workflow_type="basic")
    )
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        resp = await client.put(f"/workflows/{wf.id}", json={"name": "Updated"})
        assert resp.status_code == 200
        assert resp.json()["data"]["name"] == "Updated"

        resp = await client.delete(f"/workflows/{wf.id}")
        assert resp.status_code == 200
        assert resp.json()["data"]["message"] == "Workflow deleted"
