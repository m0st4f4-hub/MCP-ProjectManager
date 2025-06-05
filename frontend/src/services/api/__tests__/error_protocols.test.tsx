import { describe, it, expect, beforeEach, vi } from 'vitest';
import { errorProtocolsApi } from '../error_protocols';
import { mockFetchResponse } from '@/__tests__/utils/test-utils';

describe('errorProtocolsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates protocol', async () => {
    const payload = {
      agent_role_id: 'role1',
      error_type: 'Type',
      protocol: 'Handle',
      priority: 1,
      is_active: true,
    };
    const created = { ...payload, id: '1', created_at: '2024-01-01T00:00:00Z' };
    mockFetchResponse({ success: true, protocol: created });

    const result = await errorProtocolsApi.create(payload);
    expect(global.fetch).toHaveBeenCalled();
    expect(result).toEqual(created);
  });

  it('lists protocols', async () => {
    const list = [
      {
        id: '1',
        agent_role_id: 'role1',
        error_type: 'Type',
        protocol: 'Handle',
        priority: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
      },
    ];
    mockFetchResponse({ success: true, protocols: list });

    const result = await errorProtocolsApi.list('role1');
    expect(global.fetch).toHaveBeenCalled();
    expect(result).toEqual(list);
  });

  it('deletes protocol', async () => {
    mockFetchResponse({ success: true });
    await errorProtocolsApi.remove('1');
    expect(global.fetch).toHaveBeenCalled();
  });
});
