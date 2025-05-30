/**
 * MSW Handlers
 * Mock API handlers for testing
 */

import { http, HttpResponse } from 'msw'
import { createMockTask, createMockTasks, createMockProject, createMockProjects, createMockUser } from '../factories'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const handlers = [
  // Task endpoints
  http.get(`${API_BASE_URL}/api/v1/tasks`, () => {
    return HttpResponse.json(createMockTasks(10))
  }),

  http.get(`${API_BASE_URL}/api/v1/projects/:projectId/tasks`, ({ params }) => {
    const tasks = createMockTasks(5, { project_id: params.projectId as string })
    return HttpResponse.json(tasks)
  }),

  http.get(`${API_BASE_URL}/api/v1/projects/:projectId/tasks/:taskNumber`, ({ params }) => {
    const task = createMockTask({
      project_id: params.projectId as string,
      task_number: parseInt(params.taskNumber as string),
    })
    return HttpResponse.json(task)
  }),

  http.post(`${API_BASE_URL}/api/v1/projects/:projectId/tasks`, async ({ request, params }) => {
    const body = await request.json()
    const newTask = createMockTask({
      ...body,
      project_id: params.projectId as string,
      task_number: Math.floor(Math.random() * 1000),
    })
    return HttpResponse.json(newTask, { status: 201 })
  }),

  http.patch(`${API_BASE_URL}/api/v1/projects/:projectId/tasks/:taskNumber`, async ({ request, params }) => {
    const body = await request.json()
    const updatedTask = createMockTask({
      ...body,
      project_id: params.projectId as string,
      task_number: parseInt(params.taskNumber as string),
    })
    return HttpResponse.json(updatedTask)
  }),

  http.delete(`${API_BASE_URL}/api/v1/projects/:projectId/tasks/:taskNumber`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Project endpoints
  http.get(`${API_BASE_URL}/api/v1/projects`, () => {
    return HttpResponse.json(createMockProjects(5))
  }),

  http.get(`${API_BASE_URL}/api/v1/projects/:projectId`, ({ params }) => {
    const project = createMockProject({ id: params.projectId as string })
    return HttpResponse.json(project)
  }),

  http.post(`${API_BASE_URL}/api/v1/projects`, async ({ request }) => {
    const body = await request.json()
    const newProject = createMockProject(body)
    return HttpResponse.json(newProject, { status: 201 })
  }),

  // User endpoints
  http.get(`${API_BASE_URL}/api/v1/users/me`, () => {
    return HttpResponse.json(createMockUser())
  }),

  http.get(`${API_BASE_URL}/api/v1/users/:userId`, ({ params }) => {
    const user = createMockUser({ id: params.userId as string })
    return HttpResponse.json(user)
  }),
]
