import types
import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

from backend.routers.memory.observations import observations as obs_router
from backend.routers.memory.observations.observations import (
    get_memory_service,
)
from backend.schemas.memory import MemoryObservation, MemoryObservationCreate
from backend.services.exceptions import EntityNotFoundError
from datetime import datetime, timezone

class DummyObsService:
    def __init__(self):
        self.observations = {}
        self.next_id = 1

    def add_observation_to_entity(self, entity_id: int, observation: MemoryObservationCreate):
        obs = MemoryObservation(
            id=self.next_id,
            entity_id=entity_id,
            content=observation.content,
            metadata_=observation.metadata_,
            created_at=datetime.now(timezone.utc),
            entity=None,
        )
        self.observations[self.next_id] = obs
        self.next_id += 1
        return obs

    def update_observation(self, entity_id: int, observation_id: int, observation_update: MemoryObservationCreate):
        obs = self.observations.get(observation_id)
        if not obs or obs.entity_id != entity_id:
            raise EntityNotFoundError("MemoryObservation", observation_id)
        obs.content = observation_update.content
        obs.metadata_ = observation_update.metadata_
        return obs

    def delete_observation(self, observation_id: int) -> bool:
        if observation_id in self.observations:
            del self.observations[observation_id]
            return True
        return False

dummy_service = DummyObsService()

def override_service():
    return dummy_service

app = FastAPI()
app.include_router(obs_router.router)
app.dependency_overrides[get_memory_service] = override_service

@pytest.mark.asyncio
async def test_update_observation_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        create_resp = await client.post(
            "/entities/1/observations/",
            json={"entity_id": 1, "content": "a"},
        )
        obs_id = create_resp.json()["id"]
        update_resp = await client.put(
            f"/entities/1/observations/{obs_id}",
            json={"entity_id": 1, "content": "b", "metadata_": {"k": "v"}},
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["content"] == "b"
        assert update_resp.json()["metadata_"] == {"k": "v"}

@pytest.mark.asyncio
async def test_delete_observation_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        create_resp = await client.post(
            "/entities/1/observations/",
            json={"entity_id": 1, "content": "to delete"},
        )
        obs_id = create_resp.json()["id"]
        delete_resp = await client.delete(f"/observations/{obs_id}")
        assert delete_resp.status_code == 204
        assert obs_id not in dummy_service.observations
