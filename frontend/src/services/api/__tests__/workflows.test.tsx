import { describe, it, expect, beforeEach, vi } from 'vitest';
import { workflowsApi } from '../workflows';
import { mockFetchResponse } from '@/__tests__/utils/test-utils';

describe('workflowsApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('list returns data', async () => {
    const mock = [{ id: '1', name: 'WF', workflow_type: 'type', is_active: true, created_at: '', updated_at: '' }];
    mockFetchResponse(mock);
    const data = await workflowsApi.list();
    expect(data).toEqual(mock);
  });
});
