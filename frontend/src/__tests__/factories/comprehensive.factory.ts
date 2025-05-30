/**
 * TASK MANAGER SYSTEM - COMPREHENSIVE TEST FACTORIES
 * NASA/SpaceX Grade Test Data Generation
 * 
 * Test Classification: MISSION-CRITICAL
 * Test Control: TMS-ATP-005-FACTORIES
 * Version: 2.0.0
 * Compliance: NASA NPR 7150.2, SpaceX Software Standards
 */

import { faker } from '@faker-js/faker'
import { Task, TaskStatus } from '@/types/task'
import { Project } from '@/types/project'
import { User } from '@/types/user'

// Enhanced Task Factory with realistic data scenarios
export const createRealisticTask = (overrides?: Partial<Task>): Task => {
  const projectId = overrides?.project_id || faker.string.uuid().replace(/-/g, '')
  const taskNumber = overrides?.task_number || faker.number.int({ min: 1, max: 9999 })
  
  // Create realistic task titles based on common software development patterns
  const taskTitles = [
    'Implement user authentication system',
    'Fix pagination bug in task list',
    'Add error handling to API endpoints',
    'Update database migration scripts',
    'Optimize query performance',
    'Add unit tests for user service',
    'Implement dark mode toggle',
    'Fix memory leak in component',
    'Add validation to form inputs',
    'Update API documentation',
  ]
  
  return {
    project_id: projectId,
    task_number: taskNumber,
    title: faker.helpers.arrayElement(taskTitles),
    description: faker.lorem.paragraph(3),
    status: faker.helpers.enumValue(TaskStatus),
    agent_id: Math.random() > 0.3 ? faker.string.uuid().replace(/-/g, '') : null,
    created_at: faker.date.past({ years: 1 }).toISOString(),
    updated_at: faker.date.recent({ days: 30 }).toISOString(),
    is_archived: faker.datatype.boolean({ probability: 0.1 }),
    id: `${projectId}-${taskNumber}`,
    ...overrides,
  }
}

// Create tasks with dependencies and relationships
export const createTaskWithDependencies = (projectId: string, baseTaskNumber = 1) => {
  const mainTask = createRealisticTask({
    project_id: projectId,
    task_number: baseTaskNumber,
    title: 'Main feature implementation',
    status: TaskStatus.IN_PROGRESS,
  })
  
  const prerequisiteTask = createRealisticTask({
    project_id: projectId,
    task_number: baseTaskNumber + 1,
    title: 'Setup prerequisite infrastructure',
    status: TaskStatus.COMPLETED,
  })
  
  const followupTask = createRealisticTask({
    project_id: projectId,
    task_number: baseTaskNumber + 2,
    title: 'Write tests for main feature',
    status: TaskStatus.TO_DO,
  })
  
  return { mainTask, prerequisiteTask, followupTask }
}

// Create project with realistic task distribution
export const createProjectWithTasks = (taskCount = 10): { project: Project; tasks: Task[] } => {
  const project = createRealisticProject()
  const tasks = Array.from({ length: taskCount }, (_, index) => 
    createRealisticTask({
      project_id: project.id,
      task_number: index + 1,
    })
  )
  
  return { project, tasks }
}

// Enhanced Project Factory
export const createRealisticProject = (overrides?: Partial<Project>): Project => {
  const projectNames = [
    'Task Management System',
    'E-commerce Platform',
    'Mobile Banking App',
    'Content Management System',
    'Analytics Dashboard',
    'Customer Support Portal',
    'Inventory Management System',
    'Real-time Chat Application',
  ]
  
  return {
    id: faker.string.uuid().replace(/-/g, ''),
    name: faker.helpers.arrayElement(projectNames),
    description: faker.lorem.paragraph(2),
    task_count: faker.number.int({ min: 5, max: 100 }),
    created_at: faker.date.past({ years: 2 }).toISOString(),
    updated_at: faker.date.recent({ days: 7 }).toISOString(),
    is_archived: faker.datatype.boolean({ probability: 0.15 }),
    progress: faker.number.int({ min: 0, max: 100 }),
    ...overrides,
  }
}

// Create user scenarios for testing
export const createDeveloperUser = (overrides?: Partial<User>): User => {
  return {
    id: faker.string.uuid().replace(/-/g, ''),
    username: faker.internet.username(),
    email: faker.internet.email(),
    full_name: faker.person.fullName(),
    disabled: false,
    ...overrides,
  }
}

export const createTestUserHierarchy = () => {
  const admin = createDeveloperUser({
    username: 'admin_user',
    full_name: 'System Administrator',
  })
  
  const projectManager = createDeveloperUser({
    username: 'pm_user',
    full_name: 'Project Manager',
  })
  
  const developers = Array.from({ length: 3 }, (_, index) => 
    createDeveloperUser({
      username: `dev_user_${index + 1}`,
      full_name: `Developer ${index + 1}`,
    })
  )
  
  return { admin, projectManager, developers }
}

// Create test scenarios for different states
export const createEmptyProjectScenario = () => ({
  project: createRealisticProject({ task_count: 0 }),
  tasks: [],
  users: [createDeveloperUser()],
})

export const createActiveProjectScenario = () => {
  const { project, tasks } = createProjectWithTasks(15)
  const users = createTestUserHierarchy()
  
  // Assign some tasks to users
  const assignedTasks = tasks.map((task, index) => {
    if (index % 3 === 0) {
      return { ...task, agent_id: users.developers[index % users.developers.length].id }
    }
    return task
  })
  
  return { project, tasks: assignedTasks, users }
}

export const createCompletedProjectScenario = () => {
  const { project, tasks } = createProjectWithTasks(8)
  const completedTasks = tasks.map(task => ({ ...task, status: TaskStatus.COMPLETED }))
  
  return {
    project: { ...project, progress: 100 },
    tasks: completedTasks,
    users: [createDeveloperUser()],
  }
}

// Performance testing data generators
export const createLargeDataSet = (taskCount = 1000, projectCount = 50) => {
  const projects = Array.from({ length: projectCount }, () => createRealisticProject())
  const tasks = Array.from({ length: taskCount }, (_, index) => {
    const project = faker.helpers.arrayElement(projects)
    return createRealisticTask({
      project_id: project.id,
      task_number: (index % 100) + 1,
    })
  })
  
  return { projects, tasks }
}

// Error scenario generators
export const createErrorScenarios = () => ({
  networkError: {
    message: 'Network request failed',
    code: 'NETWORK_ERROR',
  },
  validationError: {
    message: 'Invalid task data provided',
    code: 'VALIDATION_ERROR',
    field: 'title',
  },
  authError: {
    message: 'Unauthorized access',
    code: 'AUTH_ERROR',
  },
  serverError: {
    message: 'Internal server error',
    code: 'SERVER_ERROR',
  },
})

// API response generators
export const createSuccessResponse = (data: any) => ({
  data,
  success: true,
  timestamp: new Date().toISOString(),
})

export const createErrorResponse = (error: any, status = 400) => ({
  error,
  success: false,
  timestamp: new Date().toISOString(),
  status,
})

// Export all original factories for backward compatibility
export * from './task.factory'
export * from './user.factory'
export * from './project.factory'
