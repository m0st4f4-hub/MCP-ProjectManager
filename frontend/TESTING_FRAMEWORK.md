# Task Manager Frontend Testing Framework

**NASA/SpaceX Grade Testing Infrastructure**

Test Classification: MISSION-CRITICAL  
Test Control: TMS-ATP-011-DOCS  
Version: 2.0.0  
Compliance: NASA NPR 7150.2, SpaceX Software Standards

## Overview

This comprehensive testing framework ensures the reliability, performance, and correctness of the Task Manager frontend application. Our testing strategy follows aerospace-grade standards with multiple layers of validation.

## Testing Architecture

### Test Pyramid Structure

```
    ╔══════════════════════════════════════╗
    ║               E2E Tests              ║
    ║         (Playwright - 20%)           ║
    ╠══════════════════════════════════════╣
    ║           Integration Tests          ║
    ║           (Vitest - 30%)             ║
    ╠══════════════════════════════════════╣
    ║             Unit Tests               ║
    ║           (Vitest - 50%)             ║
    ╚══════════════════════════════════════╝
```

### Test Categories

1. **Unit Tests** - Individual component and function testing
2. **Integration Tests** - Component interaction and API integration
3. **End-to-End Tests** - Full user journey testing
4. **API Tests** - Backend endpoint validation
5. **Performance Tests** - Load and response time validation
6. **Accessibility Tests** - WCAG compliance verification

## Quick Start

### Prerequisites

```bash
# Ensure dependencies are installed
npm install

# Ensure backend is running (for integration/E2E tests)
python ../run_backend.py
```

### Running Tests

```bash
# Run all tests
npm run test:all

# Run specific test types
npm run test-runner unit          # Unit tests only
npm run test-runner integration   # Integration tests only
npm run test-runner e2e           # End-to-End tests only
npm run test-runner api           # API tests only
npm run test-runner coverage      # Generate coverage report

# Development workflow
npm run test:watch               # Watch mode for unit tests
npm run test:ui                  # Visual test interface
npm run test:e2e:ui             # Playwright UI mode
```

## Test Structure

### Unit Tests (`src/components/__tests__/`)

Tests individual components in isolation:

```typescript
// Example: TaskStatusTag.test.tsx
describe('TaskStatusTag', () => {
  it('should render with correct styling', () => {
    render(<TaskStatusTag displayName="In Progress" tagBg="blue.100" tagColor="blue.800" />)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })
})
```

**Coverage Requirements:**
- Minimum 80% line coverage
- All critical paths tested
- Edge cases and error states covered

### Integration Tests (`src/__tests__/integration/`)

Tests component interactions and API integration:

```typescript
// Example: task-management.test.tsx
describe('Task Management Integration', () => {
  it('should create task and update project count', async () => {
    // Test full task creation flow with mocked API
  })
})
```

### End-to-End Tests (`tests-e2e/`)

Tests complete user workflows:

```typescript
// Example: comprehensive.e2e.spec.ts
test('should complete full task management workflow', async ({ page }) => {
  // Test real user interactions across the entire application
})
```

### API Tests (`tests-e2e/api.e2e.spec.ts`)

Direct backend API validation:

```typescript
test('should handle task CRUD operations', async ({ request }) => {
  // Test API endpoints directly without UI
})
```

## Test Data Management

### Factories (`src/__tests__/factories/`)

Realistic test data generation aligned with backend models:

```typescript
// createRealisticTask - generates tasks matching backend Task model
const task = createRealisticTask({
  project_id: 'proj123',
  status: TaskStatus.IN_PROGRESS
})
```

### Mock Service Worker (MSW)

API mocking for consistent testing:

```typescript
// handlers.ts - Mock API responses
http.get('/api/v1/tasks', () => {
  return HttpResponse.json(createMockTasks(10))
})
```

## Data Model Alignment

**Critical Principle:** All test data must align with backend data models.

### Backend Model Compliance

Our tests verify that frontend components correctly handle data structures defined in:
- `backend/models/task.py` - Task entity structure
- `backend/models/project.py` - Project entity structure  
- `backend/models/user.py` - User entity structure

### Type Safety Validation

```typescript
// Tests validate TypeScript types match backend models
const task: Task = createMockTask({
  project_id: string,    // Must match backend string format
  task_number: number,   // Must match backend integer
  status: TaskStatus,    // Must match backend enum values
})
```

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    coverage: {
      threshold: {
        global: {
          branches: 80,
          functions: 80, 
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

### Playwright Configuration (`playwright.config.ts`)

```typescript
export default defineConfig({
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
    { name: 'Mobile Chrome', use: devices['Pixel 5'] },
    { name: 'API Tests', testMatch: /.*\.api\.spec\.ts/ }
  ]
})
```

## Best Practices

### Test Naming Convention

```
ComponentName.test.tsx         - Unit tests
feature-name.test.tsx          - Integration tests  
feature-name.e2e.spec.ts       - End-to-end tests
feature-name.api.spec.ts       - API tests
```

### Test Organization

```
src/
├── __tests__/
│   ├── factories/           # Test data generators
│   ├── mocks/              # MSW handlers
│   ├── utils/              # Test utilities
│   └── integration/        # Integration tests
├── components/
│   └── __tests__/          # Component unit tests
└── tests-e2e/             # Playwright E2E tests
```

### Writing Effective Tests

1. **Follow AAA Pattern**
   - Arrange: Set up test data and conditions
   - Act: Execute the functionality being tested
   - Assert: Verify the expected outcome

2. **Test Behavior, Not Implementation**
   ```typescript
   // Good - tests behavior
   expect(screen.getByText('Task created successfully')).toBeInTheDocument()
   
   // Avoid - tests implementation
   expect(component.state.tasks).toHaveLength(1)
   ```

3. **Use Realistic Test Data**
   ```typescript
   // Use factories for consistent, realistic data
   const task = createRealisticTask({ status: TaskStatus.COMPLETED })
   ```

## Continuous Integration

### GitHub Actions Integration

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Test Suite
        run: npm run test:ci
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:run && npm run lint"
    }
  }
}
```

## Performance Testing

### Load Testing Thresholds

- Component render time: < 16ms (60fps)
- API response time: < 500ms
- Large dataset rendering: < 2s for 1000 items
- Memory usage: No memory leaks detected

### Performance Test Examples

```typescript
test('should render large task list efficiently', async () => {
  const startTime = performance.now()
  render(<TaskList tasks={createMockTasks(1000)} />)
  const renderTime = performance.now() - startTime
  
  expect(renderTime).toBeLessThan(2000)
})
```

## Accessibility Testing

### WCAG Compliance

```typescript
import { axe } from 'axe-core'

test('should meet accessibility standards', async () => {
  const { container } = render(<TaskList />)
  const results = await axe.run(container)
  
  expect(results.violations).toHaveLength(0)
})
```

### Keyboard Navigation Testing

```typescript
test('should support keyboard navigation', () => {
  render(<TaskList />)
  
  const searchInput = screen.getByRole('searchbox')
  searchInput.focus()
  
  fireEvent.keyDown(searchInput, { key: 'Tab' })
  // Verify focus moves to next interactive element
})
```

## Debugging Tests

### Visual Debugging

```bash
# Open Vitest UI for interactive debugging
npm run test:ui

# Open Playwright UI for E2E debugging  
npm run test:e2e:ui

# Generate and view test reports
npm run test:e2e:report
```

### Common Issues and Solutions

1. **Test Timeouts**
   ```typescript
   // Increase timeout for slow operations
   test('slow operation', async () => {
     // test code
   }, { timeout: 10000 })
   ```

2. **Flaky Tests**
   ```typescript
   // Use proper waits instead of timeouts
   await waitFor(() => {
     expect(screen.getByText('Loading complete')).toBeInTheDocument()
   })
   ```

3. **Mock Issues**
   ```typescript
   // Clear mocks between tests
   beforeEach(() => {
     vi.clearAllMocks()
   })
   ```

## Coverage Reports

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open coverage report
open coverage/index.html
```

### Coverage Requirements

- **Minimum Coverage**: 80% across all metrics
- **Critical Components**: 95% coverage required
- **New Code**: 100% coverage required

## Security Testing

### Input Validation Testing

```typescript
test('should sanitize user input', () => {
  const maliciousInput = '<script>alert("xss")</script>'
  
  render(<TaskForm />)
  fireEvent.change(screen.getByLabelText('Task Title'), {
    target: { value: maliciousInput }
  })
  
  // Verify input is sanitized
  expect(screen.queryByText('alert')).not.toBeInTheDocument()
})
```

## Team Collaboration

### Running Tests in Development

```bash
# Before starting development
npm run test:watch

# Before committing changes  
npm run test:all

# Before creating pull request
npm run test:ci
```

### Test Review Guidelines

1. Every new feature must include tests
2. Tests must pass on all supported browsers
3. Coverage must not decrease
4. Performance benchmarks must be met

## Troubleshooting

### Common Setup Issues

1. **Backend Not Running**
   ```bash
   # Start backend first
   python ../run_backend.py
   ```

2. **Port Conflicts**
   ```bash
   # Check ports 3000 and 8000 are available
   lsof -i :3000
   lsof -i :8000
   ```

3. **Dependencies Issues**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   ```

## Support

For testing framework support:
- Check test documentation in `/docs/testing/`
- Review example tests in each category
- Consult with the development team for complex scenarios

---

**Remember: Our testing framework ensures mission-critical reliability. Every line of code must be thoroughly tested before deployment.**
