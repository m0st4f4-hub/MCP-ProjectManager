/**
 * User Factory
 * Creates mock user data aligned with backend models
 */

import { faker } from '@faker-js/faker'
import { User } from '@/types/user'

export const createMockUser = (overrides?: Partial<User>): User => {
  return {
    id: faker.string.uuid().replace(/-/g, ''),
    username: faker.internet.username(),
    email: faker.internet.email(),
    full_name: faker.person.fullName(),
    disabled: false,
    ...overrides,
  }
}

export const createMockUsers = (count: number, overrides?: Partial<User>): User[] => {
  return Array.from({ length: count }, () => createMockUser(overrides))
}

export const createAdminUser = (overrides?: Partial<User>): User => {
  return createMockUser({
    username: `admin_${faker.internet.username()}`,
    ...overrides,
  })
}
