# Contributing to MCP Project Manager

Thank you for your interest in contributing! This guide will help you get started.

## 🚀 Quick Start

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/m0st4f4-hub/MCP-ProjectManager.git
   cd MCP-ProjectManager
   ```

2. **One-command setup**
   ```bash
   python start_system.py
   ```

3. **Install pre-commit hooks**
   ```bash
   pip install pre-commit
   pre-commit install
   ```

## 📋 Development Workflow

### Before Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Run tests to ensure everything works**
   ```bash
   # Backend tests
   cd backend && pytest
   
   # Frontend tests
   cd frontend && npm test
   
   # Integration tests
   python final_integration.py --mode all
   ```

### Code Quality Standards

#### Backend (Python)
- **Linting**: Use `flake8` for code style
- **Testing**: Write tests with `pytest`
- **Coverage**: Maintain >80% test coverage
- **Type Hints**: Use type annotations where possible

```bash
# Run backend quality checks
cd backend
flake8 .
pytest --cov=. --cov-fail-under=80
```

#### Frontend (TypeScript/React)
- **Linting**: Use ESLint with our configuration
- **Type Checking**: Run TypeScript compiler checks
- **Testing**: Write tests with Vitest
- **Formatting**: Use Prettier for consistent formatting

```bash
# Run frontend quality checks
cd frontend
npm run lint
npm run type-check
npm run test
npm run format
```

### Pre-commit Hooks

Our pre-commit hooks automatically run:
- Backend linting (flake8)
- Frontend linting (ESLint)
- Frontend type checking (TypeScript)
- Frontend testing
- Code formatting (Prettier)

### Commit Message Format

Use conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(backend): add memory entity search endpoint
fix(frontend): resolve task filtering issue
docs: update API documentation
test(backend): add tests for project service
```

## 🧪 Testing Guidelines

### Backend Testing
- Write unit tests for all services and utilities
- Use fixtures for database testing
- Mock external dependencies
- Test error conditions and edge cases

### Frontend Testing
- Write component tests for UI components
- Test user interactions and state changes
- Mock API calls in tests
- Test accessibility features

### Integration Testing
- Test full user workflows
- Verify API contract compliance
- Test MCP tool integrations

## 📚 Documentation

- Update README.md for new features
- Add docstrings to Python functions
- Document API endpoints in OpenAPI format
- Update type definitions for TypeScript

## 🔧 Debugging

### Backend Debugging
```bash
# Run with debug logging
cd backend
DEBUG=1 uvicorn main:app --reload
```

### Frontend Debugging
```bash
# Run with development tools
cd frontend
npm run dev
```

## 🚀 Deployment

### Environment Variables
See `ENVIRONMENT_SETUP.md` for required environment variables.

### Database Migrations
```bash
# Create migration
cd backend
alembic revision --autogenerate -m "Description"

# Apply migration
alembic upgrade head
```

## 📝 Pull Request Process

1. **Ensure all tests pass**
2. **Update documentation** if needed
3. **Add tests** for new functionality
4. **Follow commit message format**
5. **Request review** from maintainers

### PR Checklist

- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Commit messages follow convention

## 🤝 Code Review Guidelines

### For Authors
- Keep PRs focused and small
- Provide clear descriptions
- Respond to feedback promptly
- Update based on review comments

### For Reviewers
- Be constructive and helpful
- Focus on code quality and maintainability
- Check for security issues
- Verify tests cover new functionality

## 🐛 Bug Reports

When reporting bugs, include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Error messages/logs
- Screenshots if applicable

## 💡 Feature Requests

For new features:
- Describe the use case
- Explain the expected behavior
- Consider implementation complexity
- Discuss alternatives

## 📞 Getting Help

- Check existing issues and documentation
- Ask questions in discussions
- Join our community channels
- Contact maintainers for urgent issues

## 🏆 Recognition

Contributors are recognized in:
- Release notes
- Contributors section
- Special mentions for significant contributions

Thank you for contributing to MCP Project Manager! 🎉