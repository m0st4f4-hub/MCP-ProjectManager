import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import { UserRole, UserRoleObject } from '@/types/user';

export const assignRole = async (
  userId: string,
  role: UserRole,
): Promise<UserRoleObject> => {
  return request<UserRoleObject>(
    buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}/roles`),
    {
      method: 'POST',
      body: JSON.stringify({ role_name: role }),
    },
  );
};

export const removeRole = async (
  userId: string,
  role: UserRole,
): Promise<void> => {
  await request(
    buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}/roles/${role}`),
    { method: 'DELETE' },
  );
};
