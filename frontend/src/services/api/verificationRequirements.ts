import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type {
  VerificationRequirement,
  VerificationRequirementCreateData,
  VerificationRequirementUpdateData,
} from '@/types/verificationRequirement';

export const verificationRequirementsApi = {
  async list(agentRoleId: string): Promise<VerificationRequirement[]> {
    return request(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/${agentRoleId}/verification-requirements`
      )
    );
  },
  async create(
    agentRoleId: string,
    data: VerificationRequirementCreateData
  ): Promise<VerificationRequirement> {
    return request(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/${agentRoleId}/verification-requirements`
      ),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },
  async update(
    id: string,
    data: VerificationRequirementUpdateData
  ): Promise<VerificationRequirement> {
    return request(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/verification-requirements/${id}`
      ),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },
  async remove(id: string): Promise<void> {
    await request(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/verification-requirements/${id}`
      ),
      { method: 'DELETE' }
    );
  },
};
