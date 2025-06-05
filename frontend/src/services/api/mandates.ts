import { request } from "./request";
import { buildApiUrl, API_CONFIG } from "./config";
import type {
  Mandate,
  MandateCreateData,
  MandateUpdateData,
  MandateFilters,
  RuleListResponse,
  RuleResponse,
} from "@/types/rules";

export const listMandates = async (
  filters?: MandateFilters & { skip?: number; limit?: number }
): Promise<RuleListResponse<Mandate>> => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  return await request<RuleListResponse<Mandate>>(
    buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/mandates?${params.toString()}`)
  );
};

export const createMandate = async (
  data: MandateCreateData
): Promise<Mandate> => {
  const response = await request<RuleResponse<Mandate>>(
    buildApiUrl(API_CONFIG.ENDPOINTS.RULES, "/mandates"),
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  return response.data;
};

export const updateMandate = async (
  mandateId: string,
  data: MandateUpdateData
): Promise<Mandate> => {
  const response = await request<RuleResponse<Mandate>>(
    buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/mandates/${mandateId}`),
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
  return response.data;
};

export const deleteMandate = async (mandateId: string): Promise<void> => {
  await request(
    buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/mandates/${mandateId}`),
    {
      method: "DELETE",
    }
  );
};
