import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import { UserRole, UserRoleObject } from '@/types/user';

export const userRolesApi = {
  async assign(userId: string, roleName: UserRole): Promise<UserRoleObject> {
    return request<UserRoleObject>(
      buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}/roles`),
      {
        method: 'POST',
        body: JSON.stringify({ role_name: roleName }),
      }
    );
  },

  async remove(
    userId: string,
    roleName: UserRole
  ): Promise<{ message: string }> {
    return request<{ message: string }>(
      buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}/roles/${roleName}`),
      { method: 'DELETE' }
    );
  },
};
