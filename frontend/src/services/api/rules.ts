import { request } from "./request";
import { buildApiUrl, API_CONFIG } from "./config";
import type {
  UniversalMandate,
  UniversalMandateCreateData,
  UniversalMandateUpdateData,
  RuleAgentRule,
  AgentRuleCreateData,
  AgentRuleUpdateData,
  RuleResponse,
  RuleListResponse,
  UniversalMandateFilters,
  AgentRuleFilters,
} from "@/types/rules";
import type {
  AgentPromptTemplate,
  AgentPromptTemplateCreateData,
  AgentPromptTemplateUpdateData,
} from "@/types/agent_prompt_template";

export const rulesApi = {
  // --- Universal Mandate APIs ---
  mandates: {
    // Get all universal mandates
    list: async (
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
    },

    // Create a new universal mandate
    create: async (
      data: UniversalMandateCreateData
    ): Promise<UniversalMandate> => {
      const response = await request<RuleResponse<UniversalMandate>>(
        buildApiUrl(API_CONFIG.ENDPOINTS.RULES, "/mandates"),
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      return response.data;
    },

    // Update a universal mandate
    update: async (
      mandateId: string,
      data: UniversalMandateUpdateData
    ): Promise<UniversalMandate> => {
      const response = await request<RuleResponse<UniversalMandate>>(
        buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/mandates/${mandateId}`),
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );
      return response.data;
    },

    // Delete a universal mandate
    delete: async (mandateId: string): Promise<void> => {
      await request(
        buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/mandates/${mandateId}`),
        {
          method: "DELETE",
        }
      );
    },

    // Toggle mandate active status
    toggle: async (mandateId: string): Promise<UniversalMandate> => {
      const response = await request<RuleResponse<UniversalMandate>>(
        buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/mandates/${mandateId}/toggle`),
        {
          method: "PUT",
        }
      );
      return response.data;
    },
  },

  // --- Agent Rule APIs ---
  agentRules: {
    // Get agent rules
    list: async (
      agentId: string,
      filters?: Omit<AgentRuleFilters, "agent_id">
    ): Promise<RuleListResponse<RuleAgentRule>> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      return await request<RuleListResponse<RuleAgentRule>>(
        buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/agents/${agentId}/rules?${params.toString()}`)
      );
    },
    // Create a new agent rule
    create: async (
      agentId: string,
      data: AgentRuleCreateData
    ): Promise<RuleAgentRule> => {
      const response = await request<RuleResponse<RuleAgentRule>>(
        buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/agents/${agentId}/rules`),
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      return response.data;
    },

    // Update an agent rule
    update: async (
      ruleId: string,
      data: AgentRuleUpdateData
    ): Promise<RuleAgentRule> => {
      const response = await request<RuleResponse<RuleAgentRule>>(
        buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/agent-rules/${ruleId}`),
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );
      return response.data;
    },

    // Delete an agent rule
    delete: async (ruleId: string): Promise<void> => {
      await request(
        buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/agent-rules/${ruleId}`),
        {
          method: "DELETE",
        }
      );
    },

    // Toggle agent rule active status
    toggle: async (ruleId: string): Promise<RuleAgentRule> => {
      const response = await request<RuleResponse<RuleAgentRule>>(
        buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/agent-rules/${ruleId}/toggle`),
        {
          method: "PUT",
        }
      );
      return response.data;
    },
  },

  // --- Rule Template APIs ---
  templates: {
    // Get all rule templates
    list: async (): Promise<AgentPromptTemplate[]> => {
      const response = await request<{ data: AgentPromptTemplate[] }>(
        buildApiUrl(API_CONFIG.ENDPOINTS.RULES, "/templates")
      );
      return response.data;
    },

    // Get single rule template
    get: async (templateId: string): Promise<AgentPromptTemplate> => {
      const response = await request<{ data: AgentPromptTemplate }>(
        buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/templates/${templateId}`)
      );
      return response.data;
    },

    // Create a new rule template
    create: async (
      data: AgentPromptTemplateCreateData
    ): Promise<AgentPromptTemplate> => {
      const response = await request<{ data: AgentPromptTemplate }>(
        buildApiUrl(API_CONFIG.ENDPOINTS.RULES, "/templates"),
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      return response.data;
    },

    // Update an existing template
    update: async (
      templateId: string,
      data: AgentPromptTemplateUpdateData
    ): Promise<AgentPromptTemplate> => {
      const response = await request<{ data: AgentPromptTemplate }>(
        buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/templates/${templateId}`),
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );
      return response.data;
    },

    // Delete a template
    delete: async (templateId: string): Promise<void> => {
      await request(
        buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/templates/${templateId}`),
        { method: "DELETE" }
      );
    },

    // Apply a template to an agent
    apply: async (
      agentId: string,
      templateId: string
    ): Promise<RuleAgentRule[]> => {
      const response = await request<{ data: RuleAgentRule[] }>(
        buildApiUrl(API_CONFIG.ENDPOINTS.RULES, `/templates/${templateId}/apply/${agentId}`),
        {
          method: "POST",
        }
      );
      return response.data;
    },
  },
};
