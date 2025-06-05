import { request } from "./request";
import { buildApiUrl, API_CONFIG } from "./config";

let cachedStatuses: string[] | null = null;

export const getTaskStatuses = async (): Promise<string[]> => {
  if (cachedStatuses) return cachedStatuses;
  const statuses = await request<string[]>(
    buildApiUrl(API_CONFIG.ENDPOINTS.ENUMS, "/task-status")
  );
  cachedStatuses = statuses;
  return statuses;
};
