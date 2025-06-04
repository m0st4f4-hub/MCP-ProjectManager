import { request } from "./request";
import {
  User,
  UserCreateData,
  UserUpdateData,
  LoginRequest,
  LoginResponse,
} from "@/types/user"; // Anticipating user types
import { buildApiUrl, API_CONFIG } from "./config";

// Create a new user
export const createUser = async (userData: UserCreateData): Promise<User> => {
  return request<User>(buildApiUrl(API_CONFIG.ENDPOINTS.USERS, "/"), {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

// Fetch a single user by ID
export const getUserById = async (userId: string): Promise<User> => {
  return request<User>(buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}`));
};

// Fetch a list of users
export const getUsers = async (
  skip: number = 0,
  limit: number = 100,
): Promise<User[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append("skip", String(skip));
  queryParams.append("limit", String(limit));
  const queryString = queryParams.toString();
  const url = buildApiUrl(
    API_CONFIG.ENDPOINTS.USERS,
    queryString ? `?${queryString}` : "",
  );
  return request<User[]>(url);
};

// Update an existing user
export const updateUser = async (
  userId: string,
  userData: UserUpdateData,
): Promise<User> => {
  return request<User>(buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}`), {
    method: "PUT",
    body: JSON.stringify(userData),
  });
};

// Delete a user
export const deleteUser = async (userId: string): Promise<User> => {
  return request<User>(buildApiUrl(API_CONFIG.ENDPOINTS.USERS, `/${userId}`), {
    method: "DELETE",
  });
};

// Login (placeholder for token, returns user info from backend)
export const login = async (formData: LoginRequest): Promise<LoginResponse> => {
  // Note: Backend expects OAuth2 form data, but we'll send form-encoded data
  return request<LoginResponse>(
    buildApiUrl(API_CONFIG.ENDPOINTS.USERS, "/token"),
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData as Record<string, string>).toString(),
    },
  );
};
