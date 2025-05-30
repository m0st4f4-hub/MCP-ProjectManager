/**
 * Task Factory
 * Creates mock task data aligned with backend models
 */

import { faker } from '@faker-js/faker'
import { Task, TaskStatus } from '@/types/task'

export const createMockTask = (overrides?: Partial<Task>): Task => {
  const projectId = overrides?.project_id || faker.string.uuid().replace(/-/g, '')
  const taskNumber = overrides?.task_number || faker.number.int({ min: 1, max: 9999 })
  
  return {
    project_id: projectId,
    task_number: taskNumber,
    title: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    status: TaskStatus.TO_DO,
    agent_id: Math.random() > 0.5 ? faker.string.uuid().replace(/-/g, '') : null,
    created_at: faker.date.recent().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    is_archived: false,
    // Computed ID for frontend compatibility
    id: `${projectId}-${taskNumber}`,
    ...overrides,
  }
}

export const createMockTasks = (count: number, overrides?: Partial<Task>): Task[] => {
  return Array.from({ length: count }, () => createMockTask(overrides))
}

// Create tasks with different statuses
export const createTasksByStatus = (projectId: string) => {
  const statuses = Object.values(TaskStatus)
  return statuses.flatMap((status, index) => 
    createMockTasks(2, { 
      project_id: projectId, 
      status,
      task_number: index * 10 + 1
    })
  )
}
