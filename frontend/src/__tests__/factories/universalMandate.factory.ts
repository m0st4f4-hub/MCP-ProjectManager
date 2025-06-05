import { faker } from '@faker-js/faker';
import type { UniversalMandate } from '@/types/rules';

export const createMockUniversalMandate = (
  overrides?: Partial<UniversalMandate>,
): UniversalMandate => {
  return {
    id: faker.string.uuid().replace(/-/g, ''),
    title: faker.lorem.words(3),
    content: faker.lorem.sentence(),
    priority: faker.number.int({ min: 1, max: 10 }),
    is_active: true,
    category: 'general',
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides,
  };
};

export const createMockUniversalMandates = (
  count: number,
  overrides?: Partial<UniversalMandate>,
): UniversalMandate[] => Array.from({ length: count }, () => createMockUniversalMandate(overrides));
