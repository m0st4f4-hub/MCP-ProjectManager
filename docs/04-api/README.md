# API Documentation

This guide covers the complete API reference for the MCP Project Manager backend.

## 🌐 API Overview

### Base Information
- **Base URL**: `http://localhost:8000`
- **API Version**: v1
- **Authentication**: JWT Bearer tokens
- **Content Type**: `application/json`
- **Documentation**: Available at `/docs` (Swagger UI) and `/redoc` (ReDoc)

### Response Format Standards

All API responses follow standardized formats:

```typescript
// Successful data response
DataResponse<T> = {
  data: T,
  success: boolean,
  message: string,
  timestamp: string
}

// List response with pagination
ListResponse<T> = {
  data: T[],
  total: number,
  page: number,
  page_size: number,
  has_more: boolean
}

// Error response
ErrorResponse = {
  success: false,
  message: string,
  error_code?: string
}
```

## 🔐 Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 1800
  },
  "success": true,
  "message": "Login successful",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "full_name": "string"
}
```

### Using Authentication
Include the JWT token in the Authorization header:
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## 📋 Projects API

### List Projects
```http
GET /api/projects?page=1&page_size=10&search=query
Authorization: Bearer <token>
```

### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Project Name",
  "description": "Project description",
  "status": "ACTIVE"
}
```

### Get Project
```http
GET /api/projects/{project_id}
Authorization: Bearer <token>
```

### Update Project
```http
PUT /api/projects/{project_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "status": "ACTIVE"
}
```

### Delete Project
```http
DELETE /api/projects/{project_id}
Authorization: Bearer <token>
```

### Archive/Unarchive Project
```http
POST /api/projects/{project_id}/archive
POST /api/projects/{project_id}/unarchive
Authorization: Bearer <token>
```

### Project Members
```http
# List project members
GET /api/projects/{project_id}/members

# Add member
POST /api/projects/{project_id}/members
{
  "user_id": "uuid",
  "role": "MEMBER" | "ADMIN"
}

# Update member role
PUT /api/projects/{project_id}/members/{user_id}
{
  "role": "MEMBER" | "ADMIN"
}

# Remove member
DELETE /api/projects/{project_id}/members/{user_id}
```

## ✅ Tasks API

### List Tasks
```http
GET /api/tasks?project_id=uuid&status=TODO&priority=HIGH&page=1&page_size=10
Authorization: Bearer <token>
```

### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Task Title",
  "description": "Task description",
  "project_id": "uuid",
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "status": "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED",
  "due_date": "2024-12-31T23:59:59Z",
  "assigned_to": "uuid"
}
```

### Get Task
```http
GET /api/tasks/{task_id}
Authorization: Bearer <token>
```

### Update Task
```http
PUT /api/tasks/{task_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "IN_PROGRESS",
  "priority": "HIGH"
}
```

### Delete Task
```http
DELETE /api/tasks/{task_id}
Authorization: Bearer <token>
```

### Task Dependencies
```http
# Add dependency
POST /api/tasks/{task_id}/dependencies
{
  "depends_on_task_id": "uuid"
}

# Remove dependency
DELETE /api/tasks/{task_id}/dependencies/{dependency_id}
```

### Task Comments
```http
# List comments
GET /api/tasks/{task_id}/comments

# Add comment
POST /api/tasks/{task_id}/comments
{
  "content": "Comment text"
}

# Update comment
PUT /api/tasks/{task_id}/comments/{comment_id}
{
  "content": "Updated comment"
}

# Delete comment
DELETE /api/tasks/{task_id}/comments/{comment_id}
```

## 🤖 Agents API

### List Agents
```http
GET /api/agents?page=1&page_size=10
Authorization: Bearer <token>
```

### Create Agent
```http
POST /api/agents
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Agent Name",
  "description": "Agent description",
  "capabilities": ["capability1", "capability2"],
  "constraints": ["constraint1", "constraint2"],
  "is_active": true
}
```

### Get Agent
```http
GET /api/agents/{agent_id}
Authorization: Bearer <token>
```

### Update Agent
```http
PUT /api/agents/{agent_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "is_active": false
}
```

### Delete Agent
```http
DELETE /api/agents/{agent_id}
Authorization: Bearer <token>
```

## 👥 Users API

### List Users
```http
GET /api/users?page=1&page_size=10&search=query
Authorization: Bearer <token>
```

### Get User Profile
```http
GET /api/users/me
Authorization: Bearer <token>
```

### Update User Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Updated Name",
  "email": "new@email.com"
}
```

### Get User by ID
```http
GET /api/users/{user_id}
Authorization: Bearer <token>
```

## 🧠 Memory API

### Search Memory
```http
GET /api/memory/search?query=search_term&limit=10
Authorization: Bearer <token>
```

### Add Memory Entry
```http
POST /api/memory/entries
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Memory content",
  "metadata": {
    "type": "note",
    "tags": ["tag1", "tag2"]
  }
}
```

### Get Memory Entry
```http
GET /api/memory/entries/{entry_id}
Authorization: Bearer <token>
```

### Update Memory Entry
```http
PUT /api/memory/entries/{entry_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated content",
  "metadata": {
    "type": "note",
    "tags": ["updated_tag"]
  }
}
```

### Delete Memory Entry
```http
DELETE /api/memory/entries/{entry_id}
Authorization: Bearer <token>
```

## 📊 Audit Logs API

### List Audit Logs
```http
GET /api/audit-logs?entity_type=project&entity_id=uuid&action=CREATE&page=1&page_size=10
Authorization: Bearer <token>
```

### Get Audit Log
```http
GET /api/audit-logs/{log_id}
Authorization: Bearer <token>
```

## 🛠️ MCP Tools API

### Mandate Management
```http
# Create mandate
POST /mcp-tools/rule/mandate/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Mandate Title",
  "description": "Mandate description",
  "content": "Mandate content",
  "is_active": true
}

# List mandates
GET /mcp-tools/rule/mandate/list?active_only=true
Authorization: Bearer <token>

# Delete mandate
DELETE /mcp-tools/rule/mandate/delete?mandate_id=uuid
Authorization: Bearer <token>
```

### Workflow Management
```http
# Create workflow
POST /mcp-tools/workflow/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Workflow Name",
  "description": "Workflow description",
  "steps": [
    {
      "name": "Step 1",
      "action": "action_type",
      "parameters": {}
    }
  ]
}

# List workflows
GET /mcp-tools/workflow/list
Authorization: Bearer <token>

# Delete workflow
DELETE /mcp-tools/workflow/delete?workflow_id=uuid
Authorization: Bearer <token>
```

## 🔍 Health Check

### System Health
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0",
  "database": "connected"
}
```

## 📝 Error Codes

| Code | Description |
|------|-------------|
| `AUTH_001` | Invalid credentials |
| `AUTH_002` | Token expired |
| `AUTH_003` | Insufficient permissions |
| `VAL_001` | Validation error |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict |
| `RATE_LIMIT` | Rate limit exceeded |

## 🔧 Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **General API**: 100 requests per minute
- **Search endpoints**: 20 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📚 OpenAPI Specification

The complete OpenAPI specification is available at:
- **JSON**: `http://localhost:8000/openapi.json`
- **Interactive Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🧪 Testing the API

### Using curl
```bash
# Login
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Use token
curl -X GET "http://localhost:8000/api/projects" \
  -H "Authorization: Bearer <your_token>"
```

### Using Python requests
```python
import requests

# Login
response = requests.post(
    "http://localhost:8000/auth/login",
    json={"username": "admin", "password": "password"}
)
token = response.json()["data"]["access_token"]

# Make authenticated request
headers = {"Authorization": f"Bearer {token}"}
projects = requests.get(
    "http://localhost:8000/api/projects",
    headers=headers
)
```

## 🎯 Next Steps

- Explore the [Frontend Guide](../05-frontend/README.md)
- Learn about [Agent Development](../06-agents/README.md)
- Check out [Deployment Guide](../07-deployment/README.md) 