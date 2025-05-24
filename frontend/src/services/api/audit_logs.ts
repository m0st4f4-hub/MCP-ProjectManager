import { request } from \"./request\";\nimport { AuditLog, AuditLogFilters } from \"@/types/audit_log\";\nimport { AuditLogCreate } from \"@/types/backend_schemas\"; // Assuming a schema for creation might be needed, or use types directly\n\nconst API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || \"http://localhost:8080\";\n\n// Fetch a single audit log entry by ID\nexport const getAuditLogById = async (logId: string): Promise<AuditLog> => {\n  return request<AuditLog>(`${API_BASE_URL}/audit_logs/${logId}`);\n};\n\n// Fetch audit log entries by Entity\nexport const getAuditLogsByEntity = async (\n  entityType: string,\n  entityId: string,\n  skip: number = 0,\n  limit: number = 100\n): Promise<AuditLog[]> => {\n  const queryParams = new URLSearchParams();\n  queryParams.append(\"skip\", String(skip));\n  queryParams.append(\"limit\", String(limit));\n  const queryString = queryParams.toString();\n  const url = `${API_BASE_URL}/audit_logs/entity/${entityType}/${entityId}${queryString ? `?${queryString}` : \"\"}`;\n  return request<AuditLog[]>(url);\n};\n\n// Fetch audit log entries by User\nexport const getAuditLogsByUser = async (\n  userId: string,\n  skip: number = 0,\n  limit: number = 100\n): Promise<AuditLog[]> => {\n  const queryParams = new URLSearchParams();\n  queryParams.append(\"skip\", String(skip));\n  queryParams.append(\"limit\", String(limit));\n  const queryString = queryParams.toString();\n  const url = `${API_BASE_URL}/audit_logs/user/${userId}${queryString ? `?${queryString}` : \"\"}`;\n  return request<AuditLog[]>(url);\n};\n\n// Note: The backend also has a POST /audit_logs/ endpoint,
// but creating audit logs is typically handled internally by the backend
// when events occur, not directly by the frontend via a user action.
// If a direct creation function is needed, it would look something like:
/*
export const createAuditLogEntry = async (logEntryData: AuditLogCreate): Promise<AuditLog> => {
    return request<AuditLog>(`${API_BASE_URL}/audit_logs/`, { method: \"POST\", body: JSON.stringify(logEntryData) });
  };
*/\n\n// A general function to fetch audit logs with filters could be added
// if the backend had a broader GET endpoint, e.g.:
/*
export const getAuditLogs = async (filters?: AuditLogFilters): Promise<AuditLog[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.user_id !== undefined) queryParams.append(\"user_id\", filters.user_id);
  if (filters?.action !== undefined) queryParams.append(\"action\", filters.action);
  if (filters?.start_time !== undefined) queryParams.append(\"start_time\", filters.start_time);
  if (filters?.end_time !== undefined) queryParams.append(\"end_time\", filters.end_time);
  if (filters?.skip !== undefined) queryParams.append(\"skip\", String(filters.skip));
  if (filters?.limit !== undefined) queryParams.append(\"limit\", String(filters.limit));

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/audit_logs/${queryString ? `?${queryString}` : \"\"}`;;
  return request<AuditLog[]>(url);
};
*/ 