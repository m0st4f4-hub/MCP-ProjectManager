/**
 * Project Factory
 * Creates mock project data aligned with backend models
 */

import { faker } from '@faker-js/faker'
import { Project } from '@/types/project'

export const createMockProject = (overrides?: Partial<Project>): Project => {
  return {
    id: faker.string.uuid().replace(/-/g, ''),
    name: faker.company.name() + ' Project',
    description: faker.lorem.paragraph(),
    task_count: faker.number.int({ min: 0, max: 100 }),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    is_archived: false,
    ...overrides,
  }
}

export const createMockProjects = (count: number, overrides?: Partial<Project>): Project[] => {
  return Array.from({ length: count }, () => createMockProject(overrides))
}

export const createActiveProject = (overrides?: Partial<Project>): Project => {
  return createMockProject({
    is_archived: false,
    task_count: faker.number.int({ min: 1, max: 50 }),
    ...overrides,
  })
}

export const createArchivedProject = (overrides?: Partial<Project>): Project => {
  return createMockProject({
    is_archived: true,
    ...overrides,
  })
}
