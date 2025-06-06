import types
from datetime import datetime, timezone
<<<<<<< HEAD

=======
<<<<<<< HEAD
=======

>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

from backend.routers.memory.observations.observations import (
    router,
    get_memory_service,
)
<<<<<<< HEAD
from backend.schemas.memory import MemoryObservation, MemoryObservationCreate


<<<<<<< HEAD
class DummyService:
=======
class DummyObsService:
=======
from backend.schemas.memory import MemoryObservationCreate


class DummyService:
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
    def __init__(self):
        self.observations = {}
        self.next_id = 1

    def add_observation_to_entity(self, entity_id: int, observation: MemoryObservationCreate):
<<<<<<< HEAD
        obs = MemoryObservation(
=======
        obs = types.SimpleNamespace(
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
            id=self.next_id,
            entity_id=entity_id,
            content=observation.content,
            metadata_=observation.metadata_,
<<<<<<< HEAD
            created_at=datetime.now(timezone.utc),
<<<<<<< HEAD
=======
            entity=None,
=======
            source=None,
            timestamp=datetime.now(timezone.utc),
            created_at=datetime.now(timezone.utc),
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
        )
        self.observations[self.next_id] = obs
        self.next_id += 1
        return obs

    def get_observations(self, entity_id=None, search_query=None, skip=0, limit=100):
        obs = list(self.observations.values())
        if entity_id is not None:
            obs = [o for o in obs if o.entity_id == entity_id]
<<<<<<< HEAD
        return obs[skip : skip + limit]
=======
<<<<<<< HEAD
        return obs[skip: skip + limit]
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5

    async def update_observation(self, observation_id: int, observation_update: MemoryObservationCreate):
        obs = self.observations.get(observation_id)
        if not obs:
            return None
        obs.content = observation_update.content
        obs.metadata_ = observation_update.metadata_
        return obs

    async def delete_observation(self, observation_id: int) -> bool:
        return self.observations.pop(observation_id, None) is not None


dummy_service = DummyService()

app = FastAPI()
app.include_router(router)
<<<<<<< HEAD
app.dependency_overrides[get_memory_service] = lambda: dummy_service
=======
app.dependency_overrides[get_memory_service] = override_service
=======
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
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5


@pytest.mark.asyncio
async def test_update_and_delete_observation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/entities/1/observations/",
<<<<<<< HEAD
            json={"entity_id": 1, "content": "original content"},
=======
<<<<<<< HEAD
            json={"entity_id": 1, "content": "orig"},
=======
            json={"entity_id": 1, "content": "hello"},
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
        )
        assert resp.status_code == 200
        obs_id = resp.json()["id"]

        resp = await client.put(
            f"/observations/{obs_id}",
            json={"entity_id": 1, "content": "updated content"},
        )
        assert resp.status_code == 200
        assert resp.json()["content"] == "updated content"

        resp = await client.delete(f"/observations/{obs_id}")
<<<<<<< HEAD
        assert resp.status_code == 204

        resp = await client.delete(f"/observations/{obs_id}")
        assert resp.status_code == 404


@pytest.mark.asyncio
async def test_read_observations_pagination():
    dummy_service.observations = {}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        for i in range(3):
            resp = await client.post(
                "/entities/1/observations/",
                json={"entity_id": 1, "content": f"obs {i}"},
            )
            assert resp.status_code == 200

        resp = await client.get("/observations/?entity_id=1&page=1&page_size=2")
        assert resp.status_code == 200
        assert len(resp.json()) == 2

        resp = await client.get("/observations/?entity_id=1&page=2&page_size=2")
        assert resp.status_code == 200
        assert len(resp.json()) == 1
=======
<<<<<<< HEAD
        assert resp.status_code == 200
        assert resp.json()["data"] is True

        resp = await client.delete(f"/observations/{obs_id}")
        assert resp.status_code == 404
=======
        assert resp.status_code == 204
>>>>>>> origin/8tnwtv-codex/extend-memory_service-with-update-and-delete
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
