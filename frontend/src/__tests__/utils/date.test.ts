import { describe, it, expect } from 'vitest';
import { parseDate } from '@/utils/date';

describe('parseDate', () => {
  it('parses ISO strings with timezone offsets correctly', () => {
    const dt = parseDate('2024-05-01T08:00:00-04:00');
    expect(dt.toISOString()).toBe('2024-05-01T12:00:00.000Z');
  });

  it('returns Date instances unchanged', () => {
    const now = new Date('2024-05-01T12:00:00Z');
    expect(parseDate(now)).toBe(now);
  });
});
