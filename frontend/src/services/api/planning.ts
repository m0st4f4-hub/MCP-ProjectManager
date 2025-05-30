import { request } from "./request";
import { buildApiUrl, API_CONFIG } from "./config";

export interface PlanningRequestData {
  goal: string;
}

export interface PlanningResponseData {
  prompt: string;
}

export const generateProjectManagerPlanningPrompt = (
  data: PlanningRequestData,
): Promise<PlanningResponseData> => {
  return request<PlanningResponseData>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, "/generate-planning-prompt"),
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
};
