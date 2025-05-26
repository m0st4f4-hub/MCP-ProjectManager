"""
Validation logic for task dependencies.
This file handles validating dependencies without circular imports.
"""

from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from .utils.dependency_utils import is_self_dependency, get_direct_predecessors


async def is_circular_dependency(db: AsyncSession, 
                                 predecessor_project_id: str, 
                                 predecessor_task_number: int,
                                 successor_project_id: str, 
                                 successor_task_number: int) -> bool:
    """
    Returns True if adding the dependency (predecessor -> successor) 
    would create a circular dependency in the task graph.
    This is done by checking if the predecessor is reachable from the successor 
    by traversing existing dependencies.
    """
    
    async def is_ancestor(current_task_project_id: str, 
                          current_task_number: int, 
                          target_ancestor_project_id: str, 
                          target_ancestor_task_number: int, 
                          visited=None) -> bool:
        if visited is None:
            visited = set()
            
        task_key = (current_task_project_id, current_task_number)
        
        if task_key in visited:
            return False
            
        visited.add(task_key)
        
        if current_task_project_id == target_ancestor_project_id and current_task_number == target_ancestor_task_number:
            return True
            
        predecessors_of_current = await get_direct_predecessors(
            db, 
            successor_project_id=current_task_project_id, 
            successor_task_number=current_task_number
        )
        
        for dep in predecessors_of_current:
            if await is_ancestor(
                dep.predecessor_project_id, 
                dep.predecessor_task_number, 
                target_ancestor_project_id, 
                target_ancestor_task_number,
                visited
            ):
                return True
                
        return False

    return await is_ancestor(successor_project_id, 
                             successor_task_number, 
                             predecessor_project_id, 
                             predecessor_task_number)
