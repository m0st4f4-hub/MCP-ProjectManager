import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import { UserRoleObject } from '@/types/user';

export const assignRole = async (
  userId: string,
  roleName: string
): Promise<UserRoleObject> => {
  return request<UserRoleObject>(
    buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}/roles`),
    {
      method: 'POST',
      body: JSON.stringify({ role_name: roleName }),
    }
  );
};

export const removeRole = async (
  userId: string,
  roleName: string
): Promise<{ message: string }> => {
  return request<{ message: string }>(
    buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}/roles/${roleName}`),
    { method: 'DELETE' }
  );
};

export const getUserRoles = async (
  userId: string
): Promise<UserRoleObject[]> => {
  return request<UserRoleObject[]>(
    buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}/roles`)
  );
};
