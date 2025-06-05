import { request } from "./request";
import { buildApiUrl, API_CONFIG } from "./config";
import type {
  VerificationRequirement,
  VerificationRequirementCreateData,
  VerificationRequirementUpdateData,
} from "@/types/agents";

/**
 * Typed API client for agent verification requirements.
 */
export const verificationRequirementsApi = {
  /**
   * List verification requirements for a specific agent role.
   */
  async list(agentRoleId: string): Promise<VerificationRequirement[]> {
    return request<VerificationRequirement[]>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/${agentRoleId}/verification-requirements`
      )
    );
  },

  /**
   * Create a new verification requirement under an agent role.
   */
  async create(
    agentRoleId: string,
    data: VerificationRequirementCreateData
  ): Promise<VerificationRequirement> {
    return request<VerificationRequirement>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/${agentRoleId}/verification-requirements`
      ),
      { method: "POST", body: JSON.stringify(data) }
    );
  },

  /**
   * Update an existing verification requirement.
   */
  async update(
    requirementId: string,
    data: VerificationRequirementUpdateData
  ): Promise<VerificationRequirement> {
    return request<VerificationRequirement>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/verification-requirements/${requirementId}`
      ),
      { method: "PUT", body: JSON.stringify(data) }
    );
  },

  /**
   * Delete a verification requirement by ID.
   */
  async delete(requirementId: string): Promise<void> {
    await request<void>(
      buildApiUrl(
        API_CONFIG.ENDPOINTS.RULES,
        `/roles/verification-requirements/${requirementId}`
      ),
      { method: "DELETE" }
    );
  },
};
