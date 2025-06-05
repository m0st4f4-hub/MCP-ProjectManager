import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type {
  UniversalMandate,
  UniversalMandateCreateData,
  UniversalMandateUpdateData,
  UniversalMandateFilters,
  RuleListResponse,
  RuleResponse,
} from '@/types/rules';

export const getUniversalMandates = async (
  filters?: UniversalMandateFilters & { skip?: number; limit?: number }
): Promise<RuleListResponse<UniversalMandate>> => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  return await request<RuleListResponse<UniversalMandate>>(
    buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/mandates?${params.toString()}`)
  );
};

export const createUniversalMandate = async (
  data: UniversalMandateCreateData
): Promise<UniversalMandate> => {
  const response = await request<RuleResponse<UniversalMandate>>(
    buildApiUrl(API_CONFIG.ENDPOINTS.RULES, '/mandates'),
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  return response.data;
};

export const updateUniversalMandate = async (
  mandateId: string,
  data: UniversalMandateUpdateData
): Promise<UniversalMandate> => {
  const response = await request<RuleResponse<UniversalMandate>>(
    buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/mandates/${mandateId}`),
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
  return response.data;
};

export const deleteUniversalMandate = async (
  mandateId: string
): Promise<void> => {
  await request(
    buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/mandates/${mandateId}`),
    {
      method: 'DELETE',
    }
  );
};

export const toggleUniversalMandate = async (
  mandateId: string
): Promise<UniversalMandate> => {
  const response = await request<RuleResponse<UniversalMandate>>(
    buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/mandates/${mandateId}/toggle`),
    {
      method: 'PUT',
    }
  );
  return response.data;
};
