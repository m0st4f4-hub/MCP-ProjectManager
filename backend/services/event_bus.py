import asyncio
from typing import Any, Dict, List

# Simple in-memory pub/sub for server events
_subscribers: List[asyncio.Queue] = []

async def subscribe() -> asyncio.Queue:
    queue: asyncio.Queue = asyncio.Queue()
    _subscribers.append(queue)
    return queue

def unsubscribe(queue: asyncio.Queue) -> None:
    if queue in _subscribers:
        _subscribers.remove(queue)

def publish(event: Dict[str, Any]) -> None:
    for queue in list(_subscribers):
        queue.put_nowait(event)
