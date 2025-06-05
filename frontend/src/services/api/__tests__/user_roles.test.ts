import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userRolesApi } from '../user_roles';
import { buildApiUrl, API_CONFIG } from '../config';
import { request } from '../request';

vi.mock('../request', () => ({ request: vi.fn() }));

const requestMock = request as unknown as vi.Mock;

describe('userRolesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestMock.mockResolvedValue(undefined);
  });

  it('assign calls correct URL and method', async () => {
    await userRolesApi.assign('u1', 'admin' as any);
    expect(requestMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.USERS, '/u1/roles'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('remove calls correct URL and method', async () => {
    await userRolesApi.remove('u1', 'admin' as any);
    expect(requestMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.USERS, '/u1/roles/admin'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
