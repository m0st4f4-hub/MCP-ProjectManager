import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handoffApi } from '../handoff';
import { mockFetchResponse } from '@/__tests__/utils/test-utils';

describe('handoffApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates criteria', async () => {
    const payload = {
      agent_role_id: 'role1',
      criteria: 'when done',
      description: 'desc',
      target_agent_role: 'other',
      is_active: true,
    };
    const created = { ...payload, id: '1', created_at: '2024-01-01T00:00:00Z' };
    mockFetchResponse({ success: true, criteria: created });

    const result = await handoffApi.create(payload);
    expect(global.fetch).toHaveBeenCalled();
    expect(result).toEqual(created);
  });

  it('lists criteria', async () => {
    const list = [
      {
        id: '1',
        agent_role_id: 'role1',
        criteria: 'when done',
        description: 'desc',
        target_agent_role: 'other',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
      },
    ];
    mockFetchResponse({ success: true, criteria: list });

    const result = await handoffApi.list('role1');
    expect(global.fetch).toHaveBeenCalled();
    expect(result).toEqual(list);
  });

  it('deletes criteria', async () => {
    mockFetchResponse({ success: true });
    await handoffApi.remove('1');
    expect(global.fetch).toHaveBeenCalled();
  });
});
