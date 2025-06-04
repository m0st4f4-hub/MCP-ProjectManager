import { StatusID } from "@/lib/statusUtils";

/** Error type thrown when API requests fail */
export class ApiError extends Error {
  status: number;
  url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
  }
}

// Helper to normalize status string to a known StatusID (now simplified since formats match)
export const normalizeToStatusID = (
  backendStatus: string | null | undefined,
  completedFlag: boolean,
): StatusID => {
  if (completedFlag) {
    return "Completed";
  }
  if (backendStatus) {
    // Direct mapping since frontend and backend now use the same format
    const validStatuses: StatusID[] = [
      "To Do",
      "In Progress",
      "In Review",
      "Completed",
      "Blocked",
      "Cancelled",
    ];
    if (validStatuses.includes(backendStatus as StatusID)) {
      return backendStatus as StatusID;
    }

    // Fallback for unknown status strings
    console.warn(
      `Unknown backend status string: "${backendStatus}". Defaulting to "To Do".`,
    );
    return "To Do";
  }
  // If backendStatus is null/undefined and not completed, default to 'To Do'
  return "To Do";
};

// Helper function to handle API requests
export async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  // Conditionally add Content-Type for methods that typically have a body
  const method = options.method?.toUpperCase();
  if (method === "POST" || method === "PUT" || method === "PATCH") {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers, // Use the modified headers object
    });
  } catch (err) {
    throw new ApiError((err as Error).message || "Network Error", 0, url);
  }

  if (!response.ok) {
    console.error(`API request failed for URL: ${url}`, {
      status: response.status,
      options,
    });
    let errorDetail = `API request failed with status ${response.status} for ${url}`; // Default generic message
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        errorDetail = errorData.detail;
      } else if (errorData && errorData.message) {
        // Handle standardized ErrorResponse format
        errorDetail = errorData.message;
      } else {
        errorDetail = response.statusText || errorDetail; // Use statusText if detail is not present
      }
    } catch (e) {
      // JSON parsing failed, stick with the more generic error or statusText
      console.warn(`Failed to parse error response as JSON for URL: ${url}`, e);
      errorDetail = response.statusText || errorDetail;
    }
    throw new ApiError(errorDetail, response.status, url);
  }
  // For DELETE requests, backend might return the deleted object or no content
  if (response.status === 204) {
    return null as T; // Or handle as needed, maybe a specific type for no content
  }

  const responseData = await response.json();

  // Handle standardized backend response formats
  // Check if this is a DataResponse<T> or ListResponse<T> wrapper
  if (
    responseData &&
    typeof responseData === "object" &&
    "data" in responseData
  ) {
    // This is a wrapped response from the backend
    return responseData.data as T;
  }

  // For backwards compatibility, return the raw response if it's not wrapped
  return responseData as T;
}
