import { request } from "./request";
import { buildApiUrl, API_CONFIG } from "./config";
import type {
  UniversalMandate,
  UniversalMandateCreateData,
  UniversalMandateUpdateData,
  UniversalMandateFilters,
  RuleResponse,
  RuleListResponse,
} from "@/types/rules";

/**
 * CRUD wrapper for universal mandate endpoints.
 */
export const universalMandatesApi = {
  /** List universal mandates with optional filters */
  async list(
    filters?: UniversalMandateFilters & { skip?: number; limit?: number },
  ): Promise<UniversalMandate[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await request<RuleListResponse<UniversalMandate>>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/mandates?${params.toString()}`),
    );
    return response.data;
  },

  /** Retrieve a single universal mandate */
  async get(id: string): Promise<UniversalMandate> {
    const response = await request<RuleResponse<UniversalMandate>>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/mandates/${id}`),
    );
    return response.data;
  },

  /** Create a new universal mandate */
  async create(data: UniversalMandateCreateData): Promise<UniversalMandate> {
    const response = await request<RuleResponse<UniversalMandate>>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, "/mandates"),
      { method: "POST", body: JSON.stringify(data) },
    );
    return response.data;
  },

  /** Update an existing universal mandate */
  async update(
    id: string,
    data: UniversalMandateUpdateData,
  ): Promise<UniversalMandate> {
    const response = await request<RuleResponse<UniversalMandate>>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/mandates/${id}`),
      { method: "PUT", body: JSON.stringify(data) },
    );
    return response.data;
  },

  /** Delete a universal mandate */
  async delete(id: string): Promise<void> {
    await request(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/mandates/${id}`),
      { method: "DELETE" },
    );
  },

  /** Toggle active status of a universal mandate */
  async toggle(id: string): Promise<UniversalMandate> {
    const response = await request<RuleResponse<UniversalMandate>>(
      buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/mandates/${id}/toggle`),
      { method: "PUT" },
    );
    return response.data;
  },
};
