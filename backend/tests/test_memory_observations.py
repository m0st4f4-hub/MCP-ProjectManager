import types
from datetime import datetime, timezone
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
=======

>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

from backend.routers.memory.observations.observations import (
    router,
    get_memory_service,
)
<<<<<<< HEAD
<<<<<<< HEAD
from backend.schemas.memory import MemoryObservation, MemoryObservationCreate


class DummyObsService:
=======
=======
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
from backend.schemas.memory import MemoryObservationCreate


class DummyService:
<<<<<<< HEAD
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
=======
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
    def __init__(self):
        self.observations = {}
        self.next_id = 1

    def add_observation_to_entity(self, entity_id: int, observation: MemoryObservationCreate):
<<<<<<< HEAD
<<<<<<< HEAD
        obs = MemoryObservation(
=======
        obs = types.SimpleNamespace(
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
=======
        obs = types.SimpleNamespace(
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
            id=self.next_id,
            entity_id=entity_id,
            content=observation.content,
            metadata_=observation.metadata_,
<<<<<<< HEAD
<<<<<<< HEAD
            created_at=datetime.now(timezone.utc),
            entity=None,
=======
            source=None,
            timestamp=datetime.now(timezone.utc),
            created_at=datetime.now(timezone.utc),
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
=======
            source=None,
            timestamp=datetime.now(timezone.utc),
            created_at=datetime.now(timezone.utc),
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
        )
        self.observations[self.next_id] = obs
        self.next_id += 1
        return obs

    def get_observations(self, entity_id=None, search_query=None, skip=0, limit=100):
        obs = list(self.observations.values())
        if entity_id is not None:
            obs = [o for o in obs if o.entity_id == entity_id]
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
=======
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
        return obs[skip : skip + limit]

    def update_observation(self, observation_id: int, observation: MemoryObservationCreate):
        obs = self.observations.get(observation_id)
        if not obs:
            return None
        obs.entity_id = observation.entity_id
        obs.content = observation.content
        obs.metadata_ = observation.metadata_
        return obs

    def delete_observation(self, observation_id: int):
        return self.observations.pop(observation_id, None)


dummy_service = DummyService()

app = FastAPI()
app.include_router(router)
app.dependency_overrides[get_memory_service] = lambda: dummy_service
<<<<<<< HEAD
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
=======
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete


@pytest.mark.asyncio
async def test_update_and_delete_observation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/entities/1/observations/",
<<<<<<< HEAD
<<<<<<< HEAD
            json={"entity_id": 1, "content": "orig"},
=======
            json={"entity_id": 1, "content": "hello"},
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
=======
            json={"entity_id": 1, "content": "hello"},
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
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
<<<<<<< HEAD
<<<<<<< HEAD
        assert resp.status_code == 200
        assert resp.json()["data"] is True

        resp = await client.delete(f"/observations/{obs_id}")
        assert resp.status_code == 404
=======
        assert resp.status_code == 204
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
=======
        assert resp.status_code == 204
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
