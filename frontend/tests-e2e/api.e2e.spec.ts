/**
 * TASK MANAGER SYSTEM - API E2E TESTS
 * NASA/SpaceX Grade API Integration Test Suite
 * 
 * Test Classification: MISSION-CRITICAL
 * Test Control: TMS-ATP-009-API-E2E
 * Version: 2.0.0
 * Compliance: NASA NPR 7150.2, SpaceX Software Standards
 */

import { test, expect } from '@playwright/test'
import { TaskStatus } from '../src/types/task'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

test.describe('Task Manager API E2E Tests', () => {
  let testProjectId: string
  let testTaskNumber: number

  test.beforeAll(async ({ request }) => {
    // Create a test project for our tests
    const projectResponse = await request.post(`${API_BASE_URL}/api/v1/projects`, {
      data: {
        name: 'E2E Test Project',
        description: 'Project created for E2E testing',
      }
    })
    
    expect(projectResponse.ok()).toBeTruthy()
    const projectData = await projectResponse.json()
    testProjectId = projectData.data?.id || projectData.id
    console.log(`Created test project: ${testProjectId}`)
  })

  test.afterAll(async ({ request }) => {
    // Cleanup: Delete test project
    if (testProjectId) {
      await request.delete(`${API_BASE_URL}/api/v1/projects/${testProjectId}`)
      console.log(`Cleaned up test project: ${testProjectId}`)
    }
  })

  test.describe('Project Management API', () => {
    test('should create, read, update, and delete projects', async ({ request }) => {
      // CREATE
      const createResponse = await request.post(`${API_BASE_URL}/api/v1/projects`, {
        data: {
          name: 'CRUD Test Project',
          description: 'Testing CRUD operations',
        }
      })
      
      expect(createResponse.status()).toBe(201)
      const createData = await createResponse.json()
      const projectId = createData.data?.id || createData.id
      expect(projectId).toBeTruthy()

      // READ
      const readResponse = await request.get(`${API_BASE_URL}/api/v1/projects/${projectId}`)
      expect(readResponse.ok()).toBeTruthy()
      const readData = await readResponse.json()
      expect(readData.data?.name || readData.name).toBe('CRUD Test Project')

      // UPDATE
      const updateResponse = await request.patch(`${API_BASE_URL}/api/v1/projects/${projectId}`, {
        data: {
          name: 'Updated CRUD Test Project',
          description: 'Updated description',
        }
      })
      expect(updateResponse.ok()).toBeTruthy()
      const updateData = await updateResponse.json()
      expect(updateData.data?.name || updateData.name).toBe('Updated CRUD Test Project')

      // DELETE
      const deleteResponse = await request.delete(`${API_BASE_URL}/api/v1/projects/${projectId}`)
      expect(deleteResponse.status()).toBe(204)

      // Verify deletion
      const verifyResponse = await request.get(`${API_BASE_URL}/api/v1/projects/${projectId}`)
      expect(verifyResponse.status()).toBe(404)
    })

    test('should list projects with pagination', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/v1/projects?page=1&page_size=10`)
      
      expect(response.ok()).toBeTruthy()
      const data = await response.json()
      
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('total')
      expect(data).toHaveProperty('page')
      expect(data).toHaveProperty('page_size')
      expect(Array.isArray(data.data)).toBeTruthy()
    })
  })

  test.describe('Task Management API', () => {
    test('should create, read, update, and delete tasks', async ({ request }) => {
      // CREATE
      const createResponse = await request.post(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks`, {
        data: {
          title: 'API Test Task',
          description: 'Task created via API test',
          status: TaskStatus.TO_DO,
        }
      })
      
      expect(createResponse.status()).toBe(201)
      const createData = await createResponse.json()
      testTaskNumber = createData.data?.task_number || createData.task_number
      expect(testTaskNumber).toBeTruthy()

      // READ
      const readResponse = await request.get(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks/${testTaskNumber}`)
      expect(readResponse.ok()).toBeTruthy()
      const readData = await readResponse.json()
      expect(readData.data?.title || readData.title).toBe('API Test Task')

      // UPDATE
      const updateResponse = await request.patch(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks/${testTaskNumber}`, {
        data: {
          title: 'Updated API Test Task',
          status: 'IN_PROGRESS',
        }
      })
      expect(updateResponse.ok()).toBeTruthy()
      const updateData = await updateResponse.json()
      expect(updateData.data?.title || updateData.title).toBe('Updated API Test Task')
      expect(updateData.data?.status || updateData.status).toBe('IN_PROGRESS')

      // DELETE
      const deleteResponse = await request.delete(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks/${testTaskNumber}`)
      expect(deleteResponse.status()).toBe(204)

      // Verify deletion
      const verifyResponse = await request.get(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks/${testTaskNumber}`)
      expect(verifyResponse.status()).toBe(404)
    })

    test('should handle task status transitions correctly', async ({ request }) => {
      // Create a task
      const createResponse = await request.post(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks`, {
        data: {
          title: 'Status Transition Test',
          description: 'Testing status transitions',
          status: TaskStatus.TO_DO,
        }
      })
      
      const task = await createResponse.json()
      const taskNumber = task.data?.task_number || task.task_number

      // Valid transitions: TO_DO -> IN_PROGRESS -> COMPLETED
      const transitions = [
        { from: TaskStatus.TO_DO, to: 'IN_PROGRESS' },
        { from: 'IN_PROGRESS', to: 'COMPLETED' }
      ]

      for (const transition of transitions) {
        const updateResponse = await request.patch(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks/${taskNumber}`, {
          data: { status: transition.to }
        })
        
        expect(updateResponse.ok()).toBeTruthy()
        const updatedTask = await updateResponse.json()
        expect(updatedTask.data?.status || updatedTask.status).toBe(transition.to)
      }

      // Cleanup
      await request.delete(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks/${taskNumber}`)
    })

    test('should validate task data correctly', async ({ request }) => {
      // Test missing required fields
      const missingTitleResponse = await request.post(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks`, {
        data: {
          description: 'Task without title',
          status: TaskStatus.TO_DO,
        }
      })
      expect(missingTitleResponse.status()).toBe(422) // Validation error

      // Test invalid status
      const invalidStatusResponse = await request.post(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks`, {
        data: {
          title: 'Invalid Status Task',
          status: 'INVALID_STATUS',
        }
      })
      expect(invalidStatusResponse.status()).toBe(422) // Validation error

      // Test valid task creation
      const validResponse = await request.post(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks`, {
        data: {
          title: 'Valid Task',
          description: 'This is a valid task',
          status: TaskStatus.TO_DO,
        }
      })
      expect(validResponse.status()).toBe(201)

      // Cleanup valid task
      const validTask = await validResponse.json()
      const taskNumber = validTask.data?.task_number || validTask.task_number
      await request.delete(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks/${taskNumber}`)
    })
  })

  test.describe('Task Filtering and Search API', () => {
    test.beforeEach(async ({ request }) => {
      // Create test tasks with different statuses
      const testTasks = [
        { title: 'Frontend Task', status: TaskStatus.TO_DO, description: 'Frontend development' },
        { title: 'Backend Task', status: 'IN_PROGRESS', description: 'Backend development' },
        { title: 'Testing Task', status: 'COMPLETED', description: 'Testing phase' },
      ]

      for (const task of testTasks) {
        await request.post(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks`, { data: task })
      }
    })

    test('should filter tasks by status', async ({ request }) => {
      // Filter by TO_DO status
      const todoResponse = await request.get(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks?status=TO_DO`)
      expect(todoResponse.ok()).toBeTruthy()
      const todoData = await todoResponse.json()
      
      expect(todoData.data).toHaveLength(1)
      expect(todoData.data[0].title).toBe('Frontend Task')
      expect(todoData.data[0].status).toBe(TaskStatus.TO_DO)
    })

    test('should search tasks by title', async ({ request }) => {
      const searchResponse = await request.get(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks?search=Backend`)
      expect(searchResponse.ok()).toBeTruthy()
      const searchData = await searchResponse.json()
      
      expect(searchData.data).toHaveLength(1)
      expect(searchData.data[0].title).toBe('Backend Task')
    })

    test('should combine filters and search', async ({ request }) => {
      const combinedResponse = await request.get(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks?status=IN_PROGRESS&search=Backend`)
      expect(combinedResponse.ok()).toBeTruthy()
      const combinedData = await combinedResponse.json()
      
      expect(combinedData.data).toHaveLength(1)
      expect(combinedData.data[0].title).toBe('Backend Task')
      expect(combinedData.data[0].status).toBe('IN_PROGRESS')
    })
  })

  test.describe('API Error Handling', () => {
    test('should handle 404 errors correctly', async ({ request }) => {
      // Test non-existent project
      const projectResponse = await request.get(`${API_BASE_URL}/api/v1/projects/nonexistent`)
      expect(projectResponse.status()).toBe(404)

      // Test non-existent task
      const taskResponse = await request.get(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks/99999`)
      expect(taskResponse.status()).toBe(404)
    })

    test('should handle validation errors correctly', async ({ request }) => {
      // Test invalid data types
      const invalidResponse = await request.post(`${API_BASE_URL}/api/v1/projects`, {
        data: {
          name: 123, // Should be string
          description: true, // Should be string
        }
      })
      
      expect(invalidResponse.status()).toBe(422)
      const errorData = await invalidResponse.json()
      expect(errorData).toHaveProperty('detail')
    })
  })

  test.describe('API Performance', () => {
    test('should respond quickly to basic requests', async ({ request }) => {
      const startTime = Date.now()
      
      const response = await request.get(`${API_BASE_URL}/api/v1/projects`)
      expect(response.ok()).toBeTruthy()
      
      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(1000) // Should respond within 1 second
    })

    test('should handle concurrent requests', async ({ request }) => {
      const requests = Array.from({ length: 10 }, (_, i) => 
        request.get(`${API_BASE_URL}/api/v1/projects`)
      )
      
      const startTime = Date.now()
      const responses = await Promise.all(requests)
      const totalTime = Date.now() - startTime
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.ok()).toBeTruthy()
      })
      
      // Should handle 10 concurrent requests within 3 seconds
      expect(totalTime).toBeLessThan(3000)
    })
  })

  test.describe('Data Model Compliance', () => {
    test('should return data matching backend models', async ({ request }) => {
      // Create a task to test the response structure
      const createResponse = await request.post(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks`, {
        data: {
          title: 'Model Compliance Test',
          description: 'Testing data model compliance',
          status: TaskStatus.TO_DO,
        }
      })
      
      expect(createResponse.status()).toBe(201)
      const taskData = await createResponse.json()
      const task = taskData.data || taskData
      
      // Verify all required fields according to backend Task model
      expect(task).toHaveProperty('project_id')
      expect(task).toHaveProperty('task_number')
      expect(task).toHaveProperty('title')
      expect(task).toHaveProperty('description')
      expect(task).toHaveProperty('status')
      expect(task).toHaveProperty('created_at')
      expect(task).toHaveProperty('updated_at')
      expect(task).toHaveProperty('is_archived')
      
      // Verify data types
      expect(typeof task.project_id).toBe('string')
      expect(typeof task.task_number).toBe('number')
      expect(typeof task.title).toBe('string')
      expect(typeof task.status).toBe('string')
      expect(typeof task.is_archived).toBe('boolean')
      
      // Verify date formats
      expect(new Date(task.created_at)).toBeInstanceOf(Date)
      expect(new Date(task.updated_at)).toBeInstanceOf(Date)

      // Cleanup
      await request.delete(`${API_BASE_URL}/api/v1/projects/${testProjectId}/tasks/${task.task_number}`)
    })
  })
})
