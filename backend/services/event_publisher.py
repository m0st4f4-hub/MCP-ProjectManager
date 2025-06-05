import asyncio
from typing import Any, Dict, List


class EventPublisher:
    """Simple pub-sub event broadcaster for in-process events."""

    def __init__(self) -> None:
        self.subscribers: List[asyncio.Queue] = []

    def subscribe(self) -> asyncio.Queue:
        """Register a new subscriber and return its queue."""
        queue: asyncio.Queue = asyncio.Queue()
        self.subscribers.append(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue) -> None:
        """Remove a subscriber's queue."""
        if queue in self.subscribers:
            self.subscribers.remove(queue)

    async def publish(self, event: Dict[str, Any]) -> None:
        """Publish an event to all subscribers."""
        for queue in list(self.subscribers):
            await queue.put(event)


# Global publisher instance used across the application
publisher = EventPublisher()
