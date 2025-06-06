# Agent Development Guide

This guide covers AI agent development, MCP (Model Context Protocol) integration, and agent-specific features in the MCP Project Manager.

## 🤖 Agent System Overview

### Core Concepts
- **MCP Protocol**: Model Context Protocol for agent communication
- **Agent Tools**: Standardized interfaces for agent operations
- **Context Management**: Efficient context passing and memory
- **Rule-Based Behavior**: Agents follow defined rules and constraints

### Agent Architecture
```
Agent Layer
    ↓
MCP Protocol
    ↓
Tool Interface
    ↓
Backend Services
    ↓
Database Layer
```

## 🏗️ Tech Stack for Agents

### Backend Integration
- **FastAPI**: RESTful API with MCP integration
- **SQLAlchemy**: ORM for database operations
- **Pydantic**: Data validation and serialization
- **Memory Service**: Knowledge graph for context storage

### MCP Framework
- **fastapi-mcp**: FastAPI integration for MCP
- **Rule Files**: `.cursor/rules/` directory for agent behaviors
- **Tool Definitions**: Standardized tool interfaces
- **Context Protocol**: Efficient context passing

## 🛠️ Setting Up Agent Development

### Environment Setup

1. **Backend Environment**
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate  # Linux/macOS
   # or
   .venv\Scripts\activate     # Windows
   
   pip install -r requirements.txt
   ```

2. **Database Setup**
   ```bash
   cd backend
   python -m alembic upgrade head
   ```

3. **Start Development Server**
   ```bash
   # Quick start (recommended)
   python start_system.py
   
   # Or manual start
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

## 🔧 Agent Tool Development

### Creating Agent Tools

```python
# backend/mcp_tools/example_tool.py
from typing import Dict, Any
from pydantic import BaseModel

class ExampleToolInput(BaseModel):
    parameter1: str
    parameter2: int

class ExampleToolOutput(BaseModel):
    result: str
    success: bool

async def example_tool(input_data: ExampleToolInput) -> ExampleToolOutput:
    """Example agent tool implementation."""
    # Tool logic here
    result = f"Processed {input_data.parameter1} with {input_data.parameter2}"
    
    return ExampleToolOutput(
        result=result,
        success=True
    )
```

### Registering Tools

```python
# backend/routers/mcp_tools.py
from fastapi import APIRouter
from .mcp_tools.example_tool import example_tool, ExampleToolInput, ExampleToolOutput

router = APIRouter(prefix="/mcp-tools", tags=["MCP Tools"])

@router.post("/example", response_model=ExampleToolOutput)
async def example_endpoint(input_data: ExampleToolInput):
    """Example MCP tool endpoint."""
    return await example_tool(input_data)
```

## 🧠 Memory Service Integration

### Storing Agent Context

```python
# Store context for later retrieval
from backend.services.memory_service import MemoryService

async def store_agent_context(
    agent_id: str,
    context_data: Dict[str, Any],
    tags: List[str]
):
    """Store agent context in memory service."""
    memory_service = MemoryService()
    
    await memory_service.create_memory_entry(
        content=json.dumps(context_data),
        metadata={
            "agent_id": agent_id,
            "type": "agent_context",
            "tags": tags
        }
    )
```

## 📋 Agent Management API

### Create Agent

```python
# POST /api/agents
{
  "name": "Task Assistant",
  "description": "Helps with task management",
  "capabilities": [
    "task_creation",
    "task_assignment",
    "status_tracking"
  ],
  "constraints": [
    "no_deletion_without_approval",
    "respect_user_permissions"
  ],
  "is_active": true
}
```

## 🔐 Agent Security Guidelines

### Permission Management

```python
async def check_agent_permission(
    agent_id: str,
    operation: str,
    resource_id: str = None
) -> bool:
    """Check if agent has permission for operation."""
    permissions = await get_agent_permissions(agent_id)
    
    if operation == "create_task":
        return permissions.can_create_tasks
    elif operation == "modify_task":
        return permissions.can_modify_tasks
    elif operation == "access_project":
        return resource_id in permissions.can_access_projects
    
    return False
```

## 🧪 Testing Agent Tools

### Unit Testing

```python
# tests/test_agent_tools.py
import pytest
from backend.mcp_tools.example_tool import example_tool, ExampleToolInput

@pytest.mark.asyncio
async def test_example_tool():
    """Test example agent tool."""
    input_data = ExampleToolInput(
        parameter1="test",
        parameter2=42
    )
    
    result = await example_tool(input_data)
    
    assert result.success is True
    assert "test" in result.result
```

## 📊 Agent Monitoring and Logging

### Performance Monitoring

```python
import time
from functools import wraps

def monitor_agent_performance(func):
    """Decorator to monitor agent tool performance."""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        
        try:
            result = await func(*args, **kwargs)
            execution_time = time.time() - start_time
            
            # Log performance metrics
            await log_agent_metrics({
                "tool": func.__name__,
                "execution_time": execution_time,
                "success": True,
                "timestamp": time.time()
            })
            
            return result
            
        except Exception as e:
            # Log error metrics
            raise
    
    return wrapper
```

## 📚 Best Practices

### Agent Development
1. **Clear Interfaces**: Define clear input/output schemas
2. **Error Handling**: Implement comprehensive error handling
3. **Validation**: Validate all inputs and outputs
4. **Logging**: Log all agent actions for debugging
5. **Testing**: Write comprehensive tests for all tools

### Security Best Practices
1. **Input Sanitization**: Sanitize all user inputs
2. **Permission Checks**: Verify permissions before operations
3. **Rate Limiting**: Implement rate limiting
4. **Audit Logging**: Log all security-relevant actions

## 🎯 Next Steps

After reading this guide:
1. Set up your agent development environment
2. Create your first agent tool
3. Test the tool thoroughly
4. Deploy and monitor the agent
5. Review [Deployment Guide](../07-deployment/README.md) for production deployment
