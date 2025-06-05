import { request } from "./request";
import { buildApiUrl } from "./config";
import type {
  ErrorProtocol,
  ErrorProtocolCreateData,
  ErrorProtocolUpdateData,
} from "@/types/agents";

/**
 * CRUD wrapper for /error-protocols endpoints
 */
export const errorProtocolsApi = {
  /** List error protocols optionally filtered by role */
  async list(
    agentRoleId?: string,
    skip = 0,
    limit = 100,
  ): Promise<ErrorProtocol[]> {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (agentRoleId) params.append("agent_role_id", agentRoleId);
    return request<ErrorProtocol[]>(
      buildApiUrl("/error-protocols", `?${params.toString()}`),
    );
  },

  /** Retrieve a single error protocol */
  async get(protocolId: string): Promise<ErrorProtocol> {
    return request<ErrorProtocol>(
      buildApiUrl("/error-protocols", `/${protocolId}`),
    );
  },

  /** Create a new error protocol */
  async create(data: ErrorProtocolCreateData): Promise<ErrorProtocol> {
    return request<ErrorProtocol>(buildApiUrl("/error-protocols"), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Update an existing error protocol */
  async update(
    protocolId: string,
    data: ErrorProtocolUpdateData,
  ): Promise<ErrorProtocol> {
    return request<ErrorProtocol>(
      buildApiUrl("/error-protocols", `/${protocolId}`),
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  },

  /** Delete an error protocol */
  async delete(protocolId: string): Promise<{ message: string }> {
    return request<{ message: string }>(
      buildApiUrl("/error-protocols", `/${protocolId}`),
      { method: "DELETE" },
    );
  },
};
