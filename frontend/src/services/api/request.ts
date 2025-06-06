import * as logger from '@/utils/logger';
import { StatusID } from '@/lib/statusUtils';
import { buildApiUrl, API_CONFIG } from './config';

/** Error type thrown when API requests fail */
export class ApiError extends Error {
  status: number;
  url: string;
  errorCode?: string;
  errorDetails?: any;

  constructor(
    message: string,
    status: number,
    url: string,
    errorCode?: string,
    errorDetails?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
    this.errorCode = errorCode;
    this.errorDetails = errorDetails;
  }
}

/** Error type for network failures */
export class NetworkError extends ApiError {
  constructor(message: string, url: string) {
    super(message, 0, url);
    this.name = 'NetworkError';
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

    logger.warn(
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
      logger.error("Failed to refresh token: Server responded with an error", response);
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
    logger.error('Failed to refresh token', err);
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
  if (
    (method === 'POST' || method === 'PUT' || method === 'PATCH') &&
    !(options.body instanceof FormData)
  ) {
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
    throw new NetworkError((err as Error).message || 'Network Error', url);
  }

  // Handle 401 Unauthorized by attempting to refresh token
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      (headers as Record<string, string>).Authorization = `Bearer ${refreshed}`;
      // Re-attempt the original request with the new token
      response = await fetch(url, { ...options, headers, credentials: 'include' });
    } else {
      // If token refresh failed, re-throw the 401 to be handled by the caller (e.g., redirect to login)
      throw new ApiError(`Unauthorized: ${response.statusText || 'Token refresh failed'}`, response.status, url);
    }
  }

  if (!response.ok) {
    logger.error(`API request failed for URL: ${url}`, {
      status: response.status,
      options,
    });
    let errorDetail = `API request failed with status ${response.status} for ${url}`;
    let errorCode: string | undefined;
    let errorDetails: any;
    try {
      const errorData = await response.json();
      if (errorData && typeof errorData === 'object') {
        if (errorData.message) {
          errorDetail = errorData.message;
        } else if (errorData.detail) {
          errorDetail = errorData.detail;
        }
        errorCode = errorData.error_code;
        errorDetails = errorData.error_details;
      } else {
        errorDetail = response.statusText || errorDetail;
      }
    } catch (e) {
      logger.warn(`Failed to parse error response as JSON for URL: ${url}`, e);
      errorDetail = response.statusText || errorDetail;
    }
    throw new ApiError(errorDetail, response.status, url, errorCode, errorDetails);
  }

  if (response.status === 204) {
    return null as T;
  }

  let responseData: any;
  try {
    responseData = await response.json();
  } catch (e) {
    logger.warn(`Failed to parse response as JSON for URL: ${url}`, e);
    throw new ApiError('Invalid JSON response', response.status, url);
  }

  // Return the raw response data, or responseData.data if it exists (for DataResponse schema)
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData.data as T;
  }

  return responseData as T;
}
