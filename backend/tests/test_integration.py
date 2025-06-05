#!/usr/bin/env python3
"""Backend-Frontend integration tests using live endpoints."""

import aiohttp
import asyncio
import time
import pytest

BACKEND_URL = "http://localhost:8000"

@pytest.mark.asyncio
async def test_backend_health():
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{BACKEND_URL}/health") as response:
            assert response.status == 200
            data = await response.json()
            assert "status" in data
            assert "database" in data

@pytest.mark.asyncio
async def test_backend_openapi():
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{BACKEND_URL}/openapi.json") as response:
            assert response.status == 200
            spec = await response.json()
            paths = spec.get("paths", {})
            required = [
                "/api/projects/",
                "/api/projects/{project_id}",
                "/api/projects/{project_id}/archive",
                "/api/projects/{project_id}/members",
                "/api/projects/{project_id}/tasks",
                "/api/tasks/",
                "/health",
            ]
            missing = [p for p in required if p not in paths]
            assert not missing, f"Missing endpoints: {missing}"

@pytest.mark.asyncio
async def test_projects_api():
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{BACKEND_URL}/api/projects/") as resp:
            assert resp.status == 200
            data = await resp.json()
            assert "data" in data and isinstance(data["data"], list)

        payload = {
            "name": f"Test Project {int(time.time())}",
            "description": "Integration test project",
        }
        async with session.post(
            f"{BACKEND_URL}/api/projects/",
            json=payload,
            headers={"Content-Type": "application/json"},
        ) as resp:
            assert resp.status == 200
            data = await resp.json()
            assert "data" in data and "id" in data["data"]
            project_id = data["data"]["id"]

        async with session.get(f"{BACKEND_URL}/api/projects/{project_id}") as resp:
            assert resp.status == 200

@pytest.mark.asyncio
async def test_response_format_alignment():
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{BACKEND_URL}/api/projects/") as resp:
            assert resp.status == 200
            data = await resp.json()
            required_fields = ["data", "success", "message", "timestamp"]
            missing = [f for f in required_fields if f not in data]
            assert not missing, f"Missing response fields: {missing}"
            assert isinstance(data["data"], list)
