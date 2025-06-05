import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';
import type {
  MCPToolResponse,
  MCPProjectCreateRequest,
  MCPProjectDeleteRequest,
  MCPProjectUpdateRequest,
  MCPTaskCreateRequest,
  MCPTaskUpdateRequest,
  MCPTaskDeleteRequest,
  MCPMemoryCreateEntityRequest,
  MCPMemoryCreateObservationRequest,
  MCPMemoryCreateRelationRequest,
  MCPMemoryGetContentRequest,
  MCPMemoryGetMetadataRequest,
  MCPProjectMemberAddRequest,
  MCPProjectMemberRemoveRequest,
  MCPProjectFileAddRequest,
  MCPProjectFileRemoveRequest,
  MCPProjectTemplateCreateRequest,
  MCPProjectTemplateDeleteRequest,
  MCPToolInfo,
} from '@/types/mcp';
import type { ProjectFileAssociation } from './projects';

export const mcpApi = {
  // --- Project MCP Tools ---
  project: {
    create: async (data: MCPProjectCreateRequest): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/project/create'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    update: async (data: MCPProjectUpdateRequest): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/project/update'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    delete: async (data: MCPProjectDeleteRequest): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/project/delete'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },
  },

  // --- Project Template MCP Tools ---
  projectTemplate: {
    create: async (
      data: MCPProjectTemplateCreateRequest
    ): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/template/create'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    list: async (skip = 0, limit = 100): Promise<MCPToolResponse> => {
      const params = new URLSearchParams({
        skip: String(skip),
        limit: String(limit),
      });
      return await request<MCPToolResponse>(
        buildApiUrl(
          API_CONFIG.ENDPOINTS.MCP_TOOLS,
          `/template/list?${params.toString()}`
        )
      );
    },

    delete: async (
      data: MCPProjectTemplateDeleteRequest
    ): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/template/delete'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },
  },

  // --- Task MCP Tools ---
  task: {
    create: async (data: MCPTaskCreateRequest): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/task/create'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    update: async (data: MCPTaskUpdateRequest): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/task/update'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    delete: async (data: MCPTaskDeleteRequest): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/task/delete'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    complete: async (
      projectId: string,
      taskNumber: number
    ): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/task/complete'),
        {
          method: 'POST',
          body: JSON.stringify({
            project_id: projectId,
            task_number: taskNumber,
          }),
        }
      );
    },

    addComment: async (
      projectId: string,
      taskNumber: number,
      content: string
    ): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/task/comment'),
        {
          method: 'POST',
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
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/memory/entity/create'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },
    createObservation: async (
      data: MCPMemoryCreateObservationRequest
    ): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(
          API_CONFIG.ENDPOINTS.MCP_TOOLS,
          '/memory/observation/create'
        ),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    createRelation: async (
      data: MCPMemoryCreateRelationRequest
    ): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/memory/relation/create'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    getContent: async (
      data: MCPMemoryGetContentRequest
    ): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/memory/get-content'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    getMetadata: async (
      data: MCPMemoryGetMetadataRequest
    ): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/memory/get-metadata'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    search: async (query: string): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(
          API_CONFIG.ENDPOINTS.MCP_TOOLS,
          `/memory/search?q=${encodeURIComponent(query)}`
        )
      );
    },

    searchGraph: async (query: string): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(
          API_CONFIG.ENDPOINTS.MCP_TOOLS,
          `/memory/search-graph?q=${encodeURIComponent(query)}`
        )
      );
    },
  },

  // --- Project Member MCP Tools ---
  projectMember: {
    add: async (data: MCPProjectMemberAddRequest): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/project/member/add'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    remove: async (
      data: MCPProjectMemberRemoveRequest
    ): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/project/member/remove'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },
  },

  // --- Project File MCP Tools ---
  projectFile: {
    add: async (data: MCPProjectFileAddRequest): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/project/file/add'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    list: async (
      projectId: string,
      skip = 0,
      limit = 100
    ): Promise<ProjectFileAssociation[]> => {
      const params = new URLSearchParams();
      params.append('project_id', projectId);
      params.append('skip', String(skip));
      params.append('limit', String(limit));
      const response = await request<{
        files: { project_id: string; file_memory_entity_id: number }[];
      }>(
        buildApiUrl(
          API_CONFIG.ENDPOINTS.MCP_TOOLS,
          `/project/file/list?${params.toString()}`
        )
      );
      return response.files.map((f) => ({
        project_id: f.project_id,
        file_id: String(f.file_memory_entity_id),
      }));
    },

    remove: async (
      data: MCPProjectFileRemoveRequest
    ): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/project/file/remove'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },
  },

  // --- Rule MCP Tools ---
  rule: {
    createMandate: async (data: {
      title: string;
      description: string;
      priority?: number;
      is_active?: boolean;
    }): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/rule/mandate/create'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    createAgentRule: async (data: {
      agent_id: string;
      rule_type: string;
      rule_content: string;
      is_active?: boolean;
    }): Promise<MCPToolResponse> => {
      return await request<MCPToolResponse>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/rule/agent/create'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },
  },

  // --- Tool Discovery ---
  tools: {
    list: async (): Promise<MCPToolInfo[]> => {
      const response = await request<{ tools: MCPToolInfo[] }>(
        buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/list')
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

  // --- Metrics ---
  metrics: async (): Promise<Record<string, number>> => {
    const response = await request<{ metrics: Record<string, number> }>(
      buildApiUrl(API_CONFIG.ENDPOINTS.MCP_TOOLS, '/metrics')
    );
    return response.metrics;
  },
};
