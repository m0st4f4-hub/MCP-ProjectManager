import { StatusID } from '@/lib/statusUtils';
import { buildApiUrl, API_CONFIG } from './config';

/** Error type thrown when API requests fail */
export class ApiError extends Error {
  status: number;
  url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
  }
}

// Helper to normalize status string to a known StatusID
export const normalizeToStatusID = (
  backendStatus: string | null | undefined,
  completedFlag: boolean
): StatusID => {
  if (completedFlag) {
    return 'Completed';
  }
  if (backendStatus) {
    const validStatuses: StatusID[] = [
      'To Do',
      'In Progress',
      'In Review',
      'Completed',
      'Blocked',
      'Cancelled',
    ];
    if (validStatuses.includes(backendStatus as StatusID)) {
      return backendStatus as StatusID;
    }

    console.warn(
      `Unknown backend status string: "${backendStatus}". Defaulting to "To Do".`
    );
    return 'To Do';
  }
  return 'To Do';
};

async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(
      buildApiUrl(API_CONFIG.ENDPOINTS.AUTH, '/refresh'),
      {
        method: 'POST',
        credentials: 'include',
      }
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (data && data.access_token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.access_token);
      }
      return data.access_token as string;
    }
    return null;
  } catch (err) {
    console.error('Failed to refresh token', err);
    return null;
  }
}

// Helper function to handle API requests
export async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  if (!('Authorization' in headers)) {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  const method = options.method?.toUpperCase();
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (err) {
    throw new ApiError((err as Error).message || 'Network Error', 0, url);
  }

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      (headers as Record<string, string>).Authorization = `Bearer ${refreshed}`;
      response = await fetch(url, { ...options, headers, credentials: 'include' });
    }
  }

  if (!response.ok) {
    console.error(`API request failed for URL: ${url}`, {
      status: response.status,
      options,
    });
    let errorDetail = `API request failed with status ${response.status} for ${url}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        errorDetail = errorData.detail;
      } else if (errorData && errorData.message) {
        errorDetail = errorData.message;
      } else {
        errorDetail = response.statusText || errorDetail;
      }
    } catch (e) {
      console.warn(`Failed to parse error response as JSON for URL: ${url}`, e);
      errorDetail = response.statusText || errorDetail;
    }
    throw new ApiError(errorDetail, response.status, url);
  }

  if (response.status === 204) {
    return null as T;
  }

  const responseData = await response.json();

  if (
    responseData &&
    typeof responseData === 'object' &&
    'data' in responseData
  ) {
    return responseData.data as T;
  }

  return responseData as T;
}
