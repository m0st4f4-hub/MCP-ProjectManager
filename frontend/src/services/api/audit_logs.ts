import { request } from "./request";
import { AuditLog, AuditLogFilters } from "@/types/audit_log";
import { buildApiUrl, API_CONFIG } from "./config";

// Fetch audit logs with optional filters
export const getAuditLogs = async (
  filters?: AuditLogFilters & { project_id?: string }
): Promise<AuditLog[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.user_id) queryParams.append("user_id", filters.user_id);
  if (filters?.project_id) queryParams.append("project_id", filters.project_id);
  if (filters?.skip !== undefined) queryParams.append("skip", String(filters.skip));
  if (filters?.limit !== undefined) queryParams.append("limit", String(filters.limit));
  const queryString = queryParams.toString();
  const url = buildApiUrl(
    API_CONFIG.ENDPOINTS.AUDIT_LOGS,
    queryString ? `?${queryString}` : ""
  );
  return request<AuditLog[]>(url);
};

// Fetch a single audit log entry by ID
export const getAuditLogById = async (logId: string): Promise<AuditLog> => {
  return request<AuditLog>(buildApiUrl(API_CONFIG.ENDPOINTS.AUDIT_LOGS, `/${logId}`));
};

// Fetch audit log entries by Entity
export const getAuditLogsByEntity = async (
  entityType: string,
  entityId: string,
  skip: number = 0,
  limit: number = 100
): Promise<AuditLog[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append("skip", String(skip));
  queryParams.append("limit", String(limit));
  const queryString = queryParams.toString();
  const url = buildApiUrl(API_CONFIG.ENDPOINTS.AUDIT_LOGS, `/entity/${entityType}/${entityId}${queryString ? `?${queryString}` : ""}`);
  return request<AuditLog[]>(url);
};

// Fetch audit log entries by User
export const getAuditLogsByUser = async (
  userId: string,
  skip: number = 0,
  limit: number = 100
): Promise<AuditLog[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append("skip", String(skip));
  queryParams.append("limit", String(limit));
  const queryString = queryParams.toString();
  const url = buildApiUrl(API_CONFIG.ENDPOINTS.AUDIT_LOGS, `/user/${userId}${queryString ? `?${queryString}` : ""}`);
  return request<AuditLog[]>(url);
};

// Note: The backend also has a POST /audit_logs/ endpoint,
// but creating audit logs is typically handled internally by the backend
// when events occur, not directly by the frontend via a user action.
