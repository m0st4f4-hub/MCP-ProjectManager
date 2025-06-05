import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type {
  VerificationRequirement,
  VerificationRequirementCreateData,
  VerificationRequirementListResponse,
  VerificationRequirementResponse,
} from '@/types/verification_requirement';

export const verificationRequirementsApi = {
  async list(agentRoleId: string): Promise<VerificationRequirement[]> {
    const response = await request<VerificationRequirementListResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.VERIFICATION_REQUIREMENTS, `?agent_role_id=${agentRoleId}`)
    );
    return response.data;
  },

  async create(data: VerificationRequirementCreateData): Promise<VerificationRequirement> {
    const response = await request<VerificationRequirementResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.VERIFICATION_REQUIREMENTS),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await request(
      buildApiUrl(API_CONFIG.ENDPOINTS.VERIFICATION_REQUIREMENTS, `/${id}`),
      { method: 'DELETE' }
    );
  },
};
