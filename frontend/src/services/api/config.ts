/**
 * Central API configuration for consistent base URLs across all API services
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const API_VERSION = "/api"; // Backend uses /api, not /api/v1

export const API_CONFIG = {
  BASE_URL: `${API_BASE_URL}${API_VERSION}`,
  ENDPOINTS: {
    PROJECTS: "/projects/",
    TASKS: "/tasks/", // This might need adjustment for nested structure
    AGENTS: "/agents",
    USERS: "/users",
    AUDIT_LOGS: "/audit-logs",
    COMMENTS: "/comments",
    MEMORY: "/memory",
    RULES: "/rules",
    MCP_TOOLS: "/mcp-tools",
  },
} as const;

/**
 * Helper function to build API URLs
 */
export const buildApiUrl = (endpoint: string, path: string = ""): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}${path}`;
};
