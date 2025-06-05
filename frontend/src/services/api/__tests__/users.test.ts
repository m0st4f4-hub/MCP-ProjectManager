import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser, getUserById, getUsers, updateUser, deleteUser, login } from '../users';
import { buildApiUrl, API_CONFIG } from '../config';
import { request } from '../request';

vi.mock('../request', () => ({ request: vi.fn() }));

const requestMock = request as unknown as vi.Mock;

describe('users service', () => {
  beforeEach(() => {
    requestMock.mockResolvedValue(undefined);
    vi.clearAllMocks();
  });

  it('createUser calls correct URL', async () => {
    await createUser({} as any);
    expect(requestMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.USERS, '/'),
      expect.any(Object)
    );
  });

  it('getUserById calls correct URL', async () => {
    await getUserById('123');
    expect(requestMock.mock.calls[0][0]).toBe(
      buildApiUrl(API_CONFIG.ENDPOINTS.USERS, '/123')
    );
  });

  it('getUsers calls correct URL with params', async () => {
    await getUsers(5, 10);
    expect(requestMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.USERS, '/?skip=5&limit=10'),
    );
  });

  it('updateUser calls correct URL', async () => {
    await updateUser('123', {} as any);
    expect(requestMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.USERS, '/123'),
      expect.any(Object)
    );
  });

  it('deleteUser calls correct URL', async () => {
    await deleteUser('123');
    expect(requestMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.USERS, '/123'),
      expect.any(Object)
    );
  });

  it('login calls token URL', async () => {
    await login({ username: 'a', password: 'b' });
    expect(requestMock).toHaveBeenCalledWith(
      buildApiUrl(API_CONFIG.ENDPOINTS.AUTH, '/token'),
      expect.any(Object)
    );
  });
});
