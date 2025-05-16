import { request } from "./request";

export interface PlanningRequestData {
    goal: string;
}

export interface PlanningResponseData {
    prompt: string;
}

export const generateProjectManagerPlanningPrompt = (data: PlanningRequestData): Promise<PlanningResponseData> => {
  return request<PlanningResponseData>(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/projects/generate-planning-prompt`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}; 