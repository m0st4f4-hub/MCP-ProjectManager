import { request } from "./request";
import { buildApiUrl, API_CONFIG } from "./config";
import type {
  MCPToolResponse,
  MCPProjectCreateRequest,
  MCPProjectDeleteRequest,
  MCPTaskCreateRequest,
  MCPTaskUpdateRequest,
  MCPMemoryCreateEntityRequest,
  MCPMemoryCreateObservationRequest,
  MCPMemoryCreateRelationRequest,
  MCPToolInfo,
} from "@/types/mcp";

export const mcpApi = {
  // --- Project MCP Tools ---
  project: {
    create: async (data: MCPProjectCreateRequest): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, "/project/create"),
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
    },

    delete: async (data: MCPProjectDeleteRequest): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, "/project/delete"),
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
    },
  },

  // --- Task MCP Tools ---
  task: {
    create: async (data: MCPTaskCreateRequest): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, "/task/create"),
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
    },

    update: async (data: MCPTaskUpdateRequest): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, "/task/update"),
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
    },

    complete: async (projectId: string, taskNumber: number): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, "/task/complete"),
        {
          method: "POST",
          body: JSON.stringify({ project_id: projectId, task_number: taskNumber }),
        }
      );
    },

    addComment: async (
      projectId: string,
      taskNumber: number,
      content: string
    ): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, "/task/comment"),
        {
          method: "POST",
          body: JSON.stringify({
            project_id: projectId,
            task_number: taskNumber,
            content,
          }),
        }
      );
    },
  },

  // --- Memory MCP Tools ---
  memory: {
    createEntity: async (
      data: MCPMemoryCreateEntityRequest
    ): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, "/memory/entity/create"),
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
    },
    createObservation: async (
      data: MCPMemoryCreateObservationRequest
    ): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, "/memory/observation/create"),
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
    },

    createRelation: async (
      data: MCPMemoryCreateRelationRequest
    ): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, "/memory/relation/create"),
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
    },

    search: async (query: string): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, `/memory/search?q=${encodeURIComponent(query)}`)
      );
    },
  },

  // --- Rule MCP Tools ---
  rule: {
    createMandate: async (data: {
      title: string;
      content: string;
      priority?: number;
      category?: string;
    }): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, "/rule/mandate/create"),
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
    },

    createAgentRule: async (data: {
      agent_id: string;
      rule_type: string;
      rule_content: string;
    }): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, "/rule/agent/create"),
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
    },
  },

  // --- Tool Discovery ---
  tools: {
    list: async (): Promise<MCPToolInfo[]> => {
      const response = await request<{ tools: MCPToolInfo[] }>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, "/list")
      );
      return response.tools;
    },

    info: async (toolName: string): Promise<MCPToolInfo> => {
      const response = await request<MCPToolInfo>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, `/info/${toolName}`)
      );
      return response;
    },
  },
};
