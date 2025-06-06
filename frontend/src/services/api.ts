import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '../types';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance with default configuration
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for authentication
  instance.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add request ID for tracking
      config.headers['X-Request-ID'] = generateRequestId();
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      // Handle common error scenarios
      if (error.response?.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        // Forbidden - show permission error
        console.error('Permission denied');
      } else if (error.response?.status >= 500) {
        // Server error - show generic error message
        console.error('Server error occurred');
      }
      
      return Promise.reject(formatApiError(error));
    }
  );

  return instance;
};

// Generate unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Format API errors consistently
const formatApiError = (error: any): ApiError => {
  if (error.response?.data) {
    return {
      message: error.response.data.message || error.response.data.detail || 'An error occurred',
      code: error.response.data.code || error.response.status?.toString(),
      details: error.response.data.details || {}
    };
  }
  
  if (error.request) {
    return {
      message: 'Network error - please check your connection',
      code: 'NETWORK_ERROR'
    };
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
};

// Create the main API instance
export const api = createApiInstance();

// Specialized API methods
export const apiMethods = {
  // Projects
  projects: {
    list: (params?: Record<string, any>) => 
      api.get<ApiResponse<any[]>>('/projects', { params }),
    get: (id: string) => 
      api.get<ApiResponse<any>>(`/projects/${id}`),
    create: (data: any) => 
      api.post<ApiResponse<any>>('/projects', data),
    update: (id: string, data: any) => 
      api.patch<ApiResponse<any>>(`/projects/${id}`, data),
    delete: (id: string) => 
      api.delete(`/projects/${id}`),
    archive: (id: string) => 
      api.patch<ApiResponse<any>>(`/projects/${id}/archive`),
    unarchive: (id: string) => 
      api.patch<ApiResponse<any>>(`/projects/${id}/unarchive`),
  },
  
  // Tasks
  tasks: {
    list: (projectId: string, params?: Record<string, any>) => 
      api.get<ApiResponse<any[]>>(`/projects/${projectId}/tasks`, { params }),
    get: (projectId: string, taskId: string) => 
      api.get<ApiResponse<any>>(`/projects/${projectId}/tasks/${taskId}`),
    create: (projectId: string, data: any) => 
      api.post<ApiResponse<any>>(`/projects/${projectId}/tasks`, data),
    update: (projectId: string, taskId: string, data: any) => 
      api.patch<ApiResponse<any>>(`/projects/${projectId}/tasks/${taskId}`, data),
    delete: (projectId: string, taskId: string) => 
      api.delete(`/projects/${projectId}/tasks/${taskId}`),
    assign: (projectId: string, taskId: string, assigneeId: string) => 
      api.patch<ApiResponse<any>>(`/projects/${projectId}/tasks/${taskId}/assign`, { assignee_id: assigneeId }),
  },
  
  // Memory/Knowledge Graph
  memory: {
    entities: {
      list: (params?: Record<string, any>) => 
        api.get<ApiResponse<any[]>>('/memory/entities', { params }),
      get: (id: string) => 
        api.get<ApiResponse<any>>(`/memory/entities/${id}`),
      create: (data: any) => 
        api.post<ApiResponse<any>>('/memory/entities', data),
      update: (id: string, data: any) => 
        api.patch<ApiResponse<any>>(`/memory/entities/${id}`, data),
      delete: (id: string) => 
        api.delete(`/memory/entities/${id}`),
      search: (query: string, params?: Record<string, any>) => 
        api.get<ApiResponse<any[]>>('/memory/search', { params: { q: query, ...params } }),
    },
    relations: {
      list: (entityId?: string) => 
        api.get<ApiResponse<any[]>>('/memory/relations', { params: { entity_id: entityId } }),
      create: (data: any) => 
        api.post<ApiResponse<any>>('/memory/relations', data),
      delete: (id: string) => 
        api.delete(`/memory/relations/${id}`),
    },
    ingest: {
      url: (url: string) => 
        api.post<ApiResponse<any>>('/memory/ingest-url', { url }),
      text: (text: string, source?: string) => 
        api.post<ApiResponse<any>>('/memory/ingest-text', { text, source }),
    },
  },
  
  // MCP Tools
  mcp: {
    tools: {
      list: () => 
        api.get<ApiResponse<string[]>>('/mcp-tools/list'),
      metrics: () => 
        api.get<ApiResponse<any>>('/mcp-tools/metrics'),
    },
    stream: (endpoint: string) => {
      // Server-Sent Events endpoint
      return new EventSource(`${API_BASE_URL}/mcp-tools/${endpoint}`);
    },
  },
  
  // Users and Authentication
  auth: {
    login: (credentials: { username: string; password: string }) => 
      api.post<ApiResponse<{ token: string; user: any }>>('/auth/login', credentials),
    logout: () => 
      api.post('/auth/logout'),
    register: (userData: any) => 
      api.post<ApiResponse<any>>('/auth/register', userData),
    profile: () => 
      api.get<ApiResponse<any>>('/auth/profile'),
    updateProfile: (data: any) => 
      api.patch<ApiResponse<any>>('/auth/profile', data),
  },
  
  // System and Health
  system: {
    health: () => 
      api.get<ApiResponse<any>>('/health'),
    metrics: () => 
      api.get<ApiResponse<any>>('/metrics'),
    version: () => 
      api.get<ApiResponse<{ version: string }>>('/version'),
  },
};

// Export default API instance
export default api;

// Utility functions for common API patterns
export const apiUtils = {
  // Handle paginated responses
  handlePagination: async <T>(
    apiCall: (page: number, perPage: number) => Promise<AxiosResponse<any>>,
    options: { perPage?: number; maxPages?: number } = {}
  ): Promise<T[]> => {
    const { perPage = 50, maxPages = 10 } = options;
    const results: T[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore && page <= maxPages) {
      try {
        const response = await apiCall(page, perPage);
        const data = response.data.data || response.data;
        
        if (Array.isArray(data)) {
          results.push(...data);
          hasMore = data.length === perPage;
        } else {
          hasMore = false;
        }
        
        page++;
      } catch (error) {
        console.error(`Failed to fetch page ${page}:`, error);
        hasMore = false;
      }
    }
    
    return results;
  },
  
  // Retry failed requests
  withRetry: async <T>(
    apiCall: () => Promise<T>,
    options: { maxRetries?: number; delay?: number } = {}
  ): Promise<T> => {
    const { maxRetries = 3, delay = 1000 } = options;
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }
    
    throw lastError;
  },
};
