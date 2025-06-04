import { request } from './request';
import { User, UserCreateData, UserUpdateData, LoginRequest, TokenResponse } from '@/types/user';
import { buildApiUrl, API_CONFIG } from './config';

export const createUser = async (userData: UserCreateData): Promise<User> => {
  return request<User>(buildApiUrl(API_CONFIG.ENDPOINTS.USERS, '/'), {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const getUserById = async (userId: string): Promise<User> => {
  return request<User>(buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}`));
};

export const getUsers = async (skip = 0, limit = 100): Promise<User[]> => {
  const params = new URLSearchParams();
  params.append('skip', String(skip));
  params.append('limit', String(limit));
  const query = params.toString();
  return request<User[]>(buildApiUrl(API_CONFIG.ENDPOINTS.USERS, query ? `/?${query}` : '/'));
};

export const updateUser = async (
  userId: string,
  userData: UserUpdateData,
): Promise<User> => {
  return request<User>(buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}`), {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (userId: string): Promise<User> => {
  return request<User>(buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}`), {
    method: 'DELETE',
  });
};

export const login = async (formData: LoginRequest): Promise<TokenResponse> => {
  return request<TokenResponse>(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH, '/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(formData as Record<string, string>).toString(),
  });
};
