import asyncio
import pytest


@pytest.mark.asyncio
async def test_concurrent_health_requests(async_client):
    tasks = [async_client.get('/health') for _ in range(10)]
    responses = await asyncio.gather(*tasks)
    assert all(r.status_code == 200 for r in responses)
