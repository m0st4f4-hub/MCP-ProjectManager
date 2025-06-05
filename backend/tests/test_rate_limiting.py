import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

from backend.middleware import init_middleware
from backend.config.app_config import settings


@pytest.mark.asyncio
async def test_rate_limit_exceeded():
    original = settings.RATE_LIMIT_PER_MINUTE
    settings.RATE_LIMIT_PER_MINUTE = 1
    try:
        app = FastAPI()
        init_middleware(app)

        @app.get("/limited")
        async def limited():
            return {"message": "ok"}

        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            first = await client.get("/limited")
            assert first.status_code == 200
            second = await client.get("/limited")
            assert second.status_code == 429
    finally:
        settings.RATE_LIMIT_PER_MINUTE = original
