import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import { UserRole, UserRoleObject, UserRoleAssignData } from '@/types/user';

/**
 * Assign a role to a user
 */
export const assignRole = async (
  userId: string,
  data: UserRoleAssignData
): Promise<UserRoleObject> => {
  return request<UserRoleObject>(
    buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}/roles`),
    { method: 'POST', body: JSON.stringify(data) }
  );
};

/**
 * List roles for a user
 */
export const listRoles = async (userId: string): Promise<UserRoleObject[]> => {
  return request<UserRoleObject[]>(
    buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}/roles`)
  );
};

/**
 * Remove a role from a user
 */
export const removeRole = async (
  userId: string,
  roleName: UserRole | string
): Promise<void> => {
  await request<void>(
    buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}/roles/${roleName}`),
    { method: 'DELETE' }
  );
};
