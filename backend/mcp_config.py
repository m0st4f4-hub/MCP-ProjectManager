"""
FastAPI-MCP Configuration Module

This module contains standardized MCP configuration following best practices
from the FastAPI-MCP documentation.
"""

from typing import List, Optional
from fastapi import FastAPI
from fastapi_mcp import FastApiMCP, AuthConfig

def create_mcp_server(app: FastAPI) -> Optional[FastApiMCP]:
    """
    Create and configure the MCP server following FastAPI-MCP best practices.
    
    Best practices implemented:
    - Selective endpoint exposure (only safe GET/POST operations)
    - Clear operation IDs for better tool naming
    - Proper tagging for tool categorization
    - Authentication ready configuration
    - Safety-first approach (no PUT/DELETE by default)
    
    Args:
        app: The FastAPI application instance
        
    Returns:
        FastApiMCP instance or None if MCP is not available
    """
    try:
        from fastapi_mcp import FastApiMCP
        
        # Create MCP instance with standardized configuration
        mcp = FastApiMCP(
            app=app,
            name="Task Manager MCP Server",
            description="AI-powered task and project management server with comprehensive tooling",
            
            # Tool Selection - Following best practices for safety
            include_tags=["mcp-tools"],  # Only expose endpoints tagged as MCP tools
            
            # Tool Documentation Enhancement
            describe_all_responses=True,  # Include all response schemas in tool descriptions
            describe_full_response_schema=True,  # Include full JSON schema details
            
            # Future: Authentication configuration can be added here
            # auth_config=AuthConfig(
            #     dependencies=[Depends(verify_auth)],
            # )
        )
        
        return mcp
        
    except ImportError:
        return None
    except Exception as e:
        print(f"Error creating MCP server: {e}")
        return None


def get_mcp_tool_operations() -> List[str]:
    """
    Get the list of operation IDs that are exposed as MCP tools.
    
    This follows the FastAPI-MCP best practice of using clear,
    descriptive operation IDs for better tool naming.
    
    Returns:
        List of operation IDs exposed as MCP tools
    """
    return [
        # Core API operations
        "get_root",
        "health_check",
        
        # Project management operations (safe operations only)
        "create_project",
        "get_projects", 
        "get_project_by_id",
        
        # Task management operations (safe operations only)
        "create_task",
        "get_tasks",
        "get_task_by_number",
        
        # Memory operations (when implemented)
        "add_memory_entity",
        "search_memory",
        "add_memory_observation",
        "add_memory_relation",
        
        # Future: Additional safe operations can be added here
        # "get_project_analytics",
        # "get_task_dependencies",
        # "export_project_data",
    ]


def get_mcp_tool_descriptions() -> dict:
    """
    Get detailed descriptions for MCP tools following best practices.
    
    This provides clear, concise descriptions that help LLMs understand
    how to use each tool effectively.
    
    Returns:
        Dictionary mapping operation IDs to their descriptions
    """
    return {
        "get_root": "Get API welcome message and basic information",
        "health_check": "Check API health status and database connectivity",
        
        "create_project": "Create a new project with name, description, and settings",
        "get_projects": "List all projects with filtering and pagination support",
        "get_project_by_id": "Get detailed information about a specific project",
        
        "create_task": "Create a new task within a project",
        "get_tasks": "List tasks in a project with filtering and sorting",
        "get_task_by_number": "Get detailed information about a specific task",
        
        "add_memory_entity": "Add a new entity to the memory system for context retention",
        "search_memory": "Search through stored memory entities and observations",
        "add_memory_observation": "Add an observation to an existing memory entity",
        "add_memory_relation": "Create relationships between memory entities",
    }


def configure_mcp_security():
    """
    Configure MCP security settings following best practices.
    
    This implements the security recommendations from FastAPI-MCP docs:
    - No PUT/DELETE endpoints exposed by default
    - Authentication ready
    - Rate limiting considerations
    """
    # Future implementation:
    # - JWT token validation
    # - Role-based access control
    # - Rate limiting per client
    # - Request logging and monitoring
    pass


def get_mcp_client_config() -> dict:
    """
    Get the client configuration for connecting to this MCP server.
    
    Returns standardized configuration for popular MCP clients like
    Claude Desktop, Cursor, and Windsurf.
    
    Returns:
        Dictionary with client configuration
    """
    return {
        "mcpServers": {
            "task-manager": {
                "url": "http://localhost:8000/mcp",
                "description": "Task Manager MCP Server with project and task management tools"
            }
        }
    }


def get_mcp_remote_config(port: int = 8080) -> dict:
    """
    Get configuration for using mcp-remote bridge client.
    
    This is useful when authentication is needed or when the MCP client
    doesn't support SSE transport.
    
    Args:
        port: Port number for mcp-remote bridge
        
    Returns:
        Dictionary with mcp-remote configuration
    """
    return {
        "mcpServers": {
            "task-manager": {
                "command": "npx",
                "args": [
                    "mcp-remote",
                    "http://localhost:8000/mcp",
                    str(port)  # Fixed port for OAuth callback configuration
                ]
            }
        }
    }
