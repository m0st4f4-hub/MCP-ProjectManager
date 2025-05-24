# Task ID: Generated
# Agent Role: Agent (FixingCircularImports)
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-24T12:00:00Z

"""
Validation logic for task dependencies.
This file handles validating dependencies without circular imports.
"""

from typing import Any
from sqlalchemy.orm import Session
from fastapi import HTTPException
from .utils.dependency_utils import is_self_dependency, get_direct_predecessors


def is_circular_dependency(db: Session, predecessor_project_id: str, predecessor_task_number: int,
                          successor_project_id: str, successor_task_number: int) -> bool:
    """
    Returns True if adding the dependency would create a circular dependency in the task graph.
    Traverses from the successor to see if it eventually depends on the predecessor.
    """
    def is_ancestor(current_task_project_id: str, current_task_number: int, 
                   target_project_id: str, target_task_number: int, 
                   visited=None) -> bool:
        """
        Recursive helper function to check if target is an ancestor of current_task
        Uses a visited set to prevent infinite recursion in existing circular dependencies
        """
        if visited is None:
            visited = set()
            
        # Create a unique key for the current task
        task_key = (current_task_project_id, current_task_number)
        
        # If we've already visited this task, skip it
        if task_key in visited:
            return False
            
        # Add current task to visited set
        visited.add(task_key)
        
        # Check if current task is the target (base case)
        if current_task_project_id == target_project_id and current_task_number == target_task_number:
            return True
            
        # Get all predecessors of the current task
        predecessors = get_direct_predecessors(
            db, 
            successor_project_id=current_task_project_id, 
            successor_task_number=current_task_number
        )
        
        # Check each predecessor recursively
        for dep in predecessors:
            if is_ancestor(
                dep.predecessor_project_id, 
                dep.predecessor_task_number, 
                target_project_id, 
                target_task_number,
                visited
            ):
                return True
                
        return False

    # Start the check from the predecessor looking for the successor in its ancestry
    return is_ancestor(predecessor_project_id, predecessor_task_number, 
                      successor_project_id, successor_task_number)
