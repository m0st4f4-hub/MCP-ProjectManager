import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workflowsApi } from '../workflows';
import { buildApiUrl, API_CONFIG } from '../config';
import { request } from '../request';

vi.mock('../request', () => ({ request: vi.fn() }));
const requestMock = request as unknown as vi.Mock;

describe('workflowsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestMock.mockResolvedValue(undefined);
  });

  it('list builds correct query', async () => {
    await workflowsApi.list({ workflow_type: 'demo', active_only: false });
    expect(requestMock).toHaveBeenCalledWith(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        '/workflows?workflow_type=demo&active_only=false'
      )
    );
  });

  it('get calls correct url', async () => {
    await workflowsApi.get('abc');
    expect(requestMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/workflows/abc')
    );
  });

  it('create posts to correct url', async () => {
    await workflowsApi.create({
      name: 'n',
      workflow_type: 't',
      is_active: true,
    });
    expect(requestMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/workflows'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('update puts to correct url', async () => {
    await workflowsApi.update('abc', { name: 'u' });
    expect(requestMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/workflows/abc'),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('delete sends delete request', async () => {
    await workflowsApi.delete('abc');
    expect(requestMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/workflows/abc'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
