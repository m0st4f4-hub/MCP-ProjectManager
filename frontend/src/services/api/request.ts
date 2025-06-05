import { StatusID } from '@/lib/statusUtils';
import { TaskStatus } from '@/types/task';

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
    return TaskStatus.COMPLETED;
  }
  if (backendStatus) {
    const validStatuses: StatusID[] = [
      TaskStatus.TO_DO,
      TaskStatus.IN_PROGRESS,
      TaskStatus.IN_REVIEW,
      TaskStatus.COMPLETED,
      TaskStatus.BLOCKED,
      TaskStatus.CANCELLED,
    ];
    if (validStatuses.includes(backendStatus as StatusID)) {
      return backendStatus as StatusID;
    }

    console.warn(
      `Unknown backend status string: "${backendStatus}". Defaulting to "${TaskStatus.TO_DO}".`
    );
    return TaskStatus.TO_DO;
  }
  return TaskStatus.TO_DO;
};

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
    });
  } catch (err) {
    throw new NetworkError((err as Error).message || 'Network Error', url);
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

  let responseData: any;
  try {
    responseData = await response.json();
  } catch (e) {
    console.warn(`Failed to parse response as JSON for URL: ${url}`, e);
    throw new ApiError('Invalid JSON response', response.status, url);
  }

  if (
    responseData &&
    typeof responseData === 'object' &&
    'data' in responseData
  ) {
    return responseData.data as T;
  }

  return responseData as T;
}
