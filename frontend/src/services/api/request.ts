import { StatusID } from "@/lib/statusUtils";

// Helper to normalize status string to a known StatusID
export const normalizeToStatusID = (
  backendStatus: string | null | undefined,
  completedFlag: boolean,
): StatusID => {
  if (completedFlag) {
    return "COMPLETED";
  }
  if (backendStatus) {
    const lowerStatus = backendStatus.toLowerCase();
    // Exact matches first for precise StatusIDs
    if (lowerStatus === "execution_in_progress") return "EXECUTION_IN_PROGRESS";
    if (lowerStatus === "to do" || lowerStatus === "todo") return "TO_DO";
    if (lowerStatus === "in progress") return "IN_PROGRESS";
    if (lowerStatus === "blocked") return "BLOCKED";
    if (lowerStatus === "completed") return "COMPLETED";
    if (lowerStatus === "cancelled") return "FAILED"; // Map cancelled to FAILED as closest equivalent
    if (lowerStatus === "pending_verification") return "PENDING_VERIFICATION";
    if (lowerStatus === "verification_complete") return "VERIFICATION_COMPLETE";
    if (lowerStatus === "verification_failed") return "VERIFICATION_FAILED";
    if (lowerStatus === "failed") return "FAILED";
    if (lowerStatus === "context_acquired") return "CONTEXT_ACQUIRED";
    if (lowerStatus === "planning_complete") return "PLANNING_COMPLETE";
    if (lowerStatus === "completed_awaiting_project_manager")
      return "COMPLETED_AWAITING_PROJECT_MANAGER";
    if (lowerStatus.startsWith("completed_handoff_to_"))
      return "COMPLETED_HANDOFF_TO_...";
    if (lowerStatus === "in_progress_awaiting_subtask")
      return "IN_PROGRESS_AWAITING_SUBTASK";
    if (lowerStatus === "pending_recovery_attempt")
      return "PENDING_RECOVERY_ATTEMPT";
    // Fallback for unknown status strings
    console.warn(
      `Unknown backend status string: "${backendStatus}". Defaulting to "TO_DO".`,
    );
    return "TO_DO";
  }
  // If backendStatus is null/undefined and not completed, default to 'TO_DO'
  return "TO_DO";
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

  const response = await fetch(url, {
    ...options,
    headers, // Use the modified headers object
  });
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
    throw new Error(errorDetail);
  }
  // For DELETE requests, backend might return the deleted object or no content
  if (response.status === 204) {
    return null as T; // Or handle as needed, maybe a specific type for no content
  }
  
  const responseData = await response.json();
  
  // Handle standardized backend response formats
  // Check if this is a DataResponse<T> or ListResponse<T> wrapper
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    // This is a wrapped response from the backend
    return responseData.data as T;
  }
  
  // For backwards compatibility, return the raw response if it's not wrapped
  return responseData as T;
}
