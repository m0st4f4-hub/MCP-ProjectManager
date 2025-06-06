# Development Guide

This guide covers development workflows, coding standards, and best practices for contributing to the MCP Project Manager.

## 🏗️ Development Philosophy

### Core Principles
- **Aerospace-Grade Quality**: Mission-critical reliability with comprehensive testing
- **AI-First Development**: Designed for seamless AI agent collaboration
- **Full-Stack Integration**: Unified backend-frontend development experience
- **Production-Ready**: Enterprise-grade architecture and security

### Development Values
- **Code Quality**: Maintainable, readable, and well-documented code
- **Testing First**: Comprehensive test coverage for all features
- **Security**: Secure by design with regular security audits
- **Performance**: Optimized for speed and scalability

## 🛠️ Development Workflow

### 1. Setting Up Development Environment

```bash
# Clone and setup
git clone <repository-url>
cd task-manager

# Quick setup (recommended)
python start_system.py

# Or manual setup
./init_backend.sh  # macOS/Linux
# or
powershell ./init_backend.ps1  # Windows
```

### 2. Branch Strategy

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Create bugfix branch
git checkout -b bugfix/issue-description

# Create hotfix branch
git checkout -b hotfix/critical-fix
```

### 3. Development Cycle

1. **Write Tests First** (TDD approach)
2. **Implement Feature**
3. **Run Quality Checks**
4. **Update Documentation**
5. **Submit Pull Request**

## 📝 Coding Standards

### Backend (Python/FastAPI)

#### Code Style
- **Formatter**: Black (line length: 88)
- **Linter**: Flake8 + pylint
- **Import Sorting**: isort
- **Type Hints**: Required for all functions

```python
# Example: Proper function signature
async def create_task(
    task_data: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> TaskResponse:
    """Create a new task with proper validation."""
    # Implementation here
    pass
```

#### File Organization
```
backend/
├── models/          # SQLAlchemy models
├── schemas/         # Pydantic schemas
├── crud/           # Database operations
├── routers/        # API endpoints
├── services/       # Business logic
├── middleware/     # Request middleware
└── tests/          # Test files
```

### Frontend (Next.js/TypeScript)

#### Code Style
- **Formatter**: Prettier
- **Linter**: ESLint with TypeScript rules
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS + CSS Modules

```typescript
// Example: Proper component structure
interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onUpdate,
  className
}) => {
  // Implementation here
};
```

## 🧪 Testing Standards

### Backend Testing

#### Test Structure
```python
# tests/test_tasks.py
import pytest
from httpx import AsyncClient

class TestTaskAPI:
    async def test_create_task_success(self, client: AsyncClient, auth_headers):
        """Test successful task creation."""
        task_data = {
            "title": "Test Task",
            "description": "Test Description",
            "priority": "high"
        }
        
        response = await client.post(
            "/api/tasks/",
            json=task_data,
            headers=auth_headers
        )
        
        assert response.status_code == 201
        assert response.json()["data"]["title"] == "Test Task"
```

#### Coverage Requirements
- **Minimum**: 80% code coverage
- **Critical Paths**: 95% coverage for core business logic
- **Integration Tests**: All API endpoints tested

### Frontend Testing

#### Test Structure
```typescript
// __tests__/TaskCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../TaskCard';

describe('TaskCard', () => {
  it('renders task information correctly', () => {
    const mockTask = {
      id: '1',
      title: 'Test Task',
      status: 'TODO'
    };
    
    render(<TaskCard task={mockTask} onUpdate={jest.fn()} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
```

## 🔧 Development Tools

### Pre-commit Hooks

```bash
# Install pre-commit
pip install pre-commit
pre-commit install

# Manual run
pre-commit run --all-files
```

### Quality Checks

```bash
# Backend quality checks
cd backend
black .                    # Format code
flake8 .                  # Lint code
pytest                    # Run tests

# Frontend quality checks
cd frontend
npm run lint              # ESLint
npm run test              # Jest tests
```

## 🔄 Git Workflow

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

### Pull Request Process

1. **Create Feature Branch**
2. **Make Changes with Tests**
3. **Quality Checks**
4. **Submit Pull Request**
5. **Code Review**

## 🔐 Security Guidelines

### Backend Security
- **Authentication**: JWT with secure headers
- **Authorization**: Role-based access control
- **Input Validation**: Pydantic schemas
- **SQL Injection**: SQLAlchemy ORM protection

### Frontend Security
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token-based protection
- **Secure Storage**: HTTP-only cookies

## 🤖 AI Agent Development

### Agent Integration
- **MCP Protocol**: Model Context Protocol for agent communication
- **Tool Integration**: Standardized tool interfaces
- **Context Management**: Efficient context passing
- **Error Handling**: Robust error recovery

## 📚 Documentation Standards

### Code Documentation
- **Docstrings**: All functions and classes
- **Type Hints**: Complete type annotations
- **Comments**: Complex logic explanation

### API Documentation
- **OpenAPI**: Auto-generated from FastAPI
- **Examples**: Request/response examples
- **Error Codes**: Documented error responses

## 🎯 Next Steps

After reading this guide:
1. Set up your development environment
2. Read the [API Documentation](../04-api/README.md)
3. Explore the [Frontend Guide](../05-frontend/README.md)
4. Check out [Agent Development](../06-agents/README.md)
