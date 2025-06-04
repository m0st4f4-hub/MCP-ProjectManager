"""
Validation logic for task dependencies.
This file handles validating dependencies without circular imports.
"""

from typing import Any, Set, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from .utils.dependency_utils import get_direct_successors


async def is_circular_dependency(db: AsyncSession,
                                predecessor_project_id: str,
                                predecessor_task_number: int,
                                successor_project_id: str,
                                successor_task_number: int) -> bool:
    """
    Returns True if adding the dependency (predecessor -> successor)
    would create a circular dependency in the task graph.
    This is done by checking if the predecessor is reachable from the successor
    by traversing existing dependencies forward (through successors).
    """
    
    async def can_reach_target(current_task_project_id: str,
                              current_task_number: int,
                              target_project_id: str,
                              target_task_number: int,
                              visited: Set[Tuple[str, int]] = None) -> bool:
        """Check if we can reach the target task from the current task by following successors."""
        if visited is None:
            visited = set()
        
        task_key = (current_task_project_id, current_task_number)
        
        if task_key in visited:
            return False
        
        visited.add(task_key)
        
        if current_task_project_id == target_project_id and current_task_number == target_task_number:
            return True
        
        # Get all successors of the current task
        successors_of_current = await get_direct_successors(
            db,
            predecessor_project_id=current_task_project_id,
            predecessor_task_number=current_task_number
        )
        
        # Check if we can reach the target from any successor
        for dep in successors_of_current:
            if await can_reach_target(
                dep.successor_project_id,
                dep.successor_task_number,
                target_project_id,
                target_task_number,
                visited
            ):
                return True
        
        return False
    
    # Check if we can reach the predecessor from the successor
    # If yes, then adding predecessor -> successor would create a cycle
    return await can_reach_target(successor_project_id,
                                successor_task_number,
                                predecessor_project_id,
                                predecessor_task_number)
