import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assignRole, removeRole } from '../user_roles';
import { buildApiUrl, API_CONFIG } from '../config';
import { request } from '../request';

vi.mock('../request', () => ({ request: vi.fn() }));
const requestMock = request as unknown as vi.Mock;

describe('user_roles service', () => {
  beforeEach(() => {
    requestMock.mockResolvedValue(undefined);
    vi.clearAllMocks();
  });

  it('assignRole calls correct URL', async () => {
    await assignRole('1', 'admin');
    expect(requestMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.USERS, '/1/roles'),
      { method: 'POST', body: JSON.stringify({ role_name: 'admin' }) }
    );
  });

  it('removeRole calls correct URL', async () => {
    await removeRole('1', 'admin');
    expect(requestMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.USERS, '/1/roles/admin'),
      { method: 'DELETE' }
    );
  });
});
