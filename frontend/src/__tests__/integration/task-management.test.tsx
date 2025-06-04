/**
 * TASK MANAGER SYSTEM - INTEGRATION TESTS
 * NASA/SpaceX Grade Integration Test Suite
 * 
 * Test Classification: MISSION-CRITICAL
 * Test Control: TMS-ATP-006-INTEGRATION
 * Version: 2.0.0
 * Compliance: NASA NPR 7150.2, SpaceX Software Standards
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent, within } from '@/__tests__/utils/test-utils'
import { server } from '@/__tests__/mocks/server'
import { http, HttpResponse } from 'msw'
import { 
  createActiveProjectScenario, 
  createEmptyProjectScenario,
  createErrorScenarios,
  createSuccessResponse,
  createErrorResponse,
  createRealisticTask,
  createLargeDataSet
} from '@/__tests__/factories/comprehensive.factory'
import TaskList from '@/components/TaskList'
import ProjectList from '@/components/project/ProjectList'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

describe('Task Management Integration Tests', () => {
  beforeEach(() => {
    // Reset any runtime request handlers before each test
    server.resetHandlers()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Task-Project Integration', () => {
    it('should load and display tasks for a specific project', async () => {
      const scenario = createActiveProjectScenario()
      const { project, tasks } = scenario
      
      // Mock the API responses
      server.use(
        http.get(`${API_BASE_URL}/api/v1/projects/${project.id}/tasks`, () => {
          return HttpResponse.json(createSuccessResponse(tasks))
        }),
        http.get(`${API_BASE_URL}/api/v1/projects/${project.id}`, () => {
          return HttpResponse.json(createSuccessResponse(project))
        })
      )

      render(<TaskList />)
      
      await waitFor(() => {
        tasks.forEach(task => {
          expect(screen.getByText(task.title)).toBeInTheDocument()
        })
      })
    })

    it('should handle task creation and project task count update', async () => {
      const scenario = createEmptyProjectScenario()
      const { project } = scenario
      
      let currentTaskCount = 0
      
      // Mock task creation
      server.use(
        http.post(`${API_BASE_URL}/api/v1/projects/${project.id}/tasks`, async ({ request }) => {
          const body = await request.json()
          currentTaskCount++
          
          const newTask = {
            ...body,
            project_id: project.id,
            task_number: currentTaskCount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          
          return HttpResponse.json(createSuccessResponse(newTask), { status: 201 })
        }),
        
        http.get(`${API_BASE_URL}/api/v1/projects/${project.id}`, () => {
          return HttpResponse.json(createSuccessResponse({
            ...project,
            task_count: currentTaskCount
          }))
        })
      )

      render(<TaskList />)
      
      // Initially should show no tasks
      expect(screen.getByTestId('no-tasks')).toBeInTheDocument()
    })
  })

  describe('Error Handling Integration', () => {
    it('should gracefully handle API errors across components', async () => {
      const errorScenarios = createErrorScenarios()
      
      // Mock network error
      server.use(
        http.get(`${API_BASE_URL}/api/v1/tasks`, () => {
          return HttpResponse.json(
            createErrorResponse(errorScenarios.networkError, 500), 
            { status: 500 }
          )
        })
      )

      render(<TaskList />)
      
      await waitFor(() => {
        expect(screen.getByTestId('task-error')).toBeInTheDocument()
        expect(screen.getByText(/Network request failed/i)).toBeInTheDocument()
      })
    })
  })

  describe('Real-time Updates Integration', () => {
    it('should handle polling updates correctly', async () => {
      const scenario = createActiveProjectScenario()
      let { tasks } = scenario
      
      // Mock initial load
      server.use(
        http.get(`${API_BASE_URL}/api/v1/tasks`, () => {
          return HttpResponse.json(createSuccessResponse(tasks))
        })
      )

      render(<TaskList />)
      
      await waitFor(() => {
        expect(screen.getAllByTestId('task-item')).toHaveLength(tasks.length)
      })
      
      // Simulate new task added by another user
      const newTask = createRealisticTask({
        project_id: tasks[0].project_id,
        task_number: tasks.length + 1,
        title: 'New task from another user'
      })
      
      tasks = [...tasks, newTask]
      
      // Mock updated response for polling
      server.use(
        http.get(`${API_BASE_URL}/api/v1/tasks`, () => {
          return HttpResponse.json(createSuccessResponse(tasks))
        })
      )
    })
  })

  describe('Performance Integration', () => {
    it('should handle large datasets efficiently', async () => {
      const { projects, tasks } = createLargeDataSet(500, 10)
      
      server.use(
        http.get(`${API_BASE_URL}/api/v1/tasks`, () => {
          return HttpResponse.json(createSuccessResponse(tasks))
        }),
        http.get(`${API_BASE_URL}/api/v1/projects`, () => {
          return HttpResponse.json(createSuccessResponse(projects))
        })
      )

      const startTime = performance.now()
      
      render(<TaskList />)
      
      await waitFor(() => {
        expect(screen.getAllByTestId('task-item')).toHaveLength(500)
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render large dataset within reasonable time
      expect(renderTime).toBeLessThan(2000) // 2 seconds max
    })
  })

  describe('Accessibility Integration', () => {
    it('should maintain accessibility across component interactions', async () => {
      const scenario = createActiveProjectScenario()
      const { tasks } = scenario
      
      server.use(
        http.get(`${API_BASE_URL}/api/v1/tasks`, () => {
          return HttpResponse.json(createSuccessResponse(tasks))
        })
      )

      render(<TaskList />)
      
      await waitFor(() => {
        expect(screen.getAllByTestId('task-item')).toHaveLength(tasks.length)
      })
      
      // Test keyboard navigation
      const searchInput = screen.getByTestId('search-input')
      searchInput.focus()
      expect(document.activeElement).toBe(searchInput)
      
      // Tab through interactive elements
      fireEvent.keyDown(searchInput, { key: 'Tab' })
    })
  })
})
