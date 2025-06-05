import types
from datetime import datetime, timezone
import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

from backend.routers.memory.observations.observations import (
    router,
    get_memory_service,
)
from backend.schemas.memory import MemoryObservation, MemoryObservationCreate


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

    def get_observations(self, entity_id=None, search_query=None, skip=0, limit=100):
        obs = list(self.observations.values())
        if entity_id is not None:
            obs = [o for o in obs if o.entity_id == entity_id]
        return obs[skip: skip + limit]

    def update_observation(self, observation_id: int, observation_update: MemoryObservationCreate):
        obs = self.observations.get(observation_id)
        if not obs:
            return None
        obs.entity_id = observation_update.entity_id
        obs.content = observation_update.content
        obs.metadata_ = observation_update.metadata_
        return obs

    def delete_observation(self, observation_id: int):
        return self.observations.pop(observation_id, None) is not None


dummy_service = DummyObsService()


def override_service():
    return dummy_service


app = FastAPI()
app.include_router(router)
app.dependency_overrides[get_memory_service] = override_service


@pytest.mark.asyncio
async def test_update_and_delete_observation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/entities/1/observations/",
            json={"entity_id": 1, "content": "orig"},
        )
        assert resp.status_code == 200
        obs_id = resp.json()["id"]

        resp = await client.put(
            f"/observations/{obs_id}",
            json={"entity_id": 1, "content": "updated"},
        )
        assert resp.status_code == 200
        assert resp.json()["content"] == "updated"

        resp = await client.delete(f"/observations/{obs_id}")
        assert resp.status_code == 204

        resp = await client.delete(f"/observations/{obs_id}")
        assert resp.status_code == 404
