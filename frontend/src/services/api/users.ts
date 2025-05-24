import { request } from "./request";
import { User, UserCreateData, UserUpdateData, LoginRequest, LoginResponse } from "@/types/user"; // Anticipating user types

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Create a new user
export const createUser = async (userData: UserCreateData): Promise<User> => {
  return request<User>(`${API_BASE_URL}/users/`, { method: "POST", body: JSON.stringify(userData) });
};

// Fetch a single user by ID
export const getUserById = async (userId: string): Promise<User> => {
  return request<User>(`${API_BASE_URL}/users/${userId}`);
};

// Fetch a list of users
export const getUsers = async (skip: number = 0, limit: number = 100): Promise<User[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append("skip", String(skip));
  queryParams.append("limit", String(limit));
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/users/${queryString ? `?${queryString}` : ""}`;;
  return request<User[]>(url);
};

// Update an existing user
export const updateUser = async (
  userId: string,
  userData: UserUpdateData
): Promise<User> => {
  return request<User>(`${API_BASE_URL}/users/${userId}`, { method: "PUT", body: JSON.stringify(userData) });
};

// Delete a user
export const deleteUser = async (userId: string): Promise<User> => {
  return request<User>(`${API_BASE_URL}/users/${userId}`, { method: "DELETE" });
};

// Login (placeholder for token, returns user info from backend)
export const login = async (formData: LoginRequest): Promise<LoginResponse> => {
  // Note: Backend expects OAuth2 form data, but we'll send JSON for now
  return request<LoginResponse>(`${API_BASE_URL}/users/token`, { 
    method: "POST", 
    headers: { "Content-Type": "application/x-www-form-urlencoded" }, // Backend expects form data
    body: new URLSearchParams(formData as Record<string, string>).toString(), // Sending as form data
  });
}; 