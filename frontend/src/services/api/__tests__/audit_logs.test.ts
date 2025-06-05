import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteLog } from '../audit_logs';
import { buildApiUrl, API_CONFIG } from '../config';
import { request } from '../request';

vi.mock('../request', () => ({ request: vi.fn() }));

const requestMock = request as unknown as vi.Mock;

describe('audit_logs service', () => {
  beforeEach(() => {
    requestMock.mockResolvedValue(undefined);
    vi.clearAllMocks();
  });

  it('deleteLog calls correct URL', async () => {
    await deleteLog('123');
    expect(requestMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.AUDIT_LOGS, '/123'),
      { method: 'DELETE' }
    );
  });
});
