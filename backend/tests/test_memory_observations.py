from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport
from datetime import datetime, timezone

import pytest

from backend.routers.memory.observations.observations import (
    router,
    get_memory_service,
)
from backend.schemas.memory import MemoryObservation, MemoryObservationCreate


class DummyService:
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

    def update_observation(self, observation_id: int, observation: MemoryObservationCreate):
        obs = self.observations.get(observation_id)
        if not obs:
            return None
        obs.content = observation.content
        obs.metadata_ = observation.metadata_
        return obs

    def delete_observation(self, observation_id: int) -> bool:
        if observation_id in self.observations:
            del self.observations[observation_id]
            return True
        return False

    def get_observations(self, entity_id=None, search_query=None, skip=0, limit=100):
        result = list(self.observations.values())
        if entity_id is not None:
            result = [o for o in result if o.entity_id == entity_id]
        if search_query:
            result = [o for o in result if search_query in o.content]
        return result[skip: skip + limit]


dummy_service = DummyService()
app = FastAPI()
app.include_router(router)
app.dependency_overrides[get_memory_service] = lambda: dummy_service


@pytest.mark.asyncio
async def test_update_and_delete_observation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/entities/1/observations/",
            json={"entity_id": 1, "content": "first"},
        )
        obs_id = resp.json()["id"]

        resp = await client.put(
            f"/observations/{obs_id}",
            json={"entity_id": 1, "content": "updated"},
        )
        assert resp.status_code == 200
        assert resp.json()["content"] == "updated"

        resp = await client.delete(f"/observations/{obs_id}")
        assert resp.status_code == 204
        assert obs_id not in dummy_service.observations
