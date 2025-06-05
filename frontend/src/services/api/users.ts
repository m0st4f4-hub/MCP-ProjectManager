import { request } from './request';
import {
  User,
  UserCreateData,
  UserUpdateData,
  LoginRequest,
  TokenResponse, // unified type for auth token
} from '@/types/user';
import { buildApiUrl, API_CONFIG } from './config';

/**
 * Create a new user
 */
export const createUser = async (userData: UserCreateData): Promise<User> => {
  return request<User>(buildApiUrl(API_CONFIG.ENDPOINTS.USERS, '/'), {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

/**
 * Get a user by ID
 */
export const getUserById = async (userId: string): Promise<User> => {
  return request<User>(buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}`));
};

/**
 * Get a paginated list of users
 */
export const getUsers = async (skip = 0, limit = 100): Promise<User[]> => {
  const params = new URLSearchParams();
  params.append('skip', String(skip));
  params.append('limit', String(limit));
  const query = params.toString();
  return request<User[]>(
    buildApiUrl(API_CONFIG.ENDPOINTS.USERS, query ? `/?${query}` : '/')
  );
};

/**
 * Update a user
 */
export const updateUser = async (
  userId: string,
  userData: UserUpdateData
): Promise<User> => {
  return request<User>(buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}`), {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

/**
 * Delete a user
 */
export const deleteUser = async (userId: string): Promise<User> => {
  return request<User>(buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}`), {
    method: 'DELETE',
  });
};

/**
 * Login to acquire token (OAuth2 compatible)
 */
export const login = async (formData: LoginRequest): Promise<TokenResponse> => {
  // Use the OAuth2-compatible token endpoint which expects URL encoded form data
  return request<TokenResponse>(
    buildApiUrl(API_CONFIG.ENDPOINTS.AUTH, '/token'),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData as Record<string, string>).toString(),
      credentials: 'include',
    }
  );
};

<<<<<<< HEAD
export const redirectToOAuthLogin = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = buildApiUrl(API_CONFIG.ENDPOINTS.AUTH, '/oauth/login');
  }
};

export const logout = (): void => {
=======
export const logout = async (): Promise<void> => {
  try {
    await request(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH, '/logout'), {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Ignore errors during logout
  }
>>>>>>> origin/codex/add-and-manage-refresh-token-functionality
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};
