import { z } from "zod";

// --- MCP Tool Response Schema ---
export const mcpToolResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export type MCPToolResponse = z.infer<typeof mcpToolResponseSchema>;

// --- MCP Project Tool Schemas ---
export const mcpProjectCreateRequestSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().nullable().optional(),
});

export type MCPProjectCreateRequest = z.infer<typeof mcpProjectCreateRequestSchema>;

export const mcpProjectDeleteRequestSchema = z.object({
  project_id: z.string(),
});

export type MCPProjectDeleteRequest = z.infer<typeof mcpProjectDeleteRequestSchema>;

// --- MCP Task Tool Schemas ---
export const mcpTaskCreateRequestSchema = z.object({
  project_id: z.string(),
  title: z.string().min(1, "Task title is required"),
  description: z.string().nullable().optional(),
  agent_id: z.string().nullable().optional(),
});

export type MCPTaskCreateRequest = z.infer<typeof mcpTaskCreateRequestSchema>;

export const mcpTaskUpdateRequestSchema = z.object({
  project_id: z.string(),
  task_number: z.number(),
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  status: z.string().optional(),
  agent_id: z.string().nullable().optional(),
});

export type MCPTaskUpdateRequest = z.infer<typeof mcpTaskUpdateRequestSchema>;

// --- MCP Memory Tool Schemas ---
export const mcpMemoryCreateEntityRequestSchema = z.object({
  entity_type: z.string().min(1, "Entity type is required"),
  content: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
});

export type MCPMemoryCreateEntityRequest = z.infer<typeof mcpMemoryCreateEntityRequestSchema>;

export const mcpMemoryCreateObservationRequestSchema = z.object({
  entity_id: z.number(),
  content: z.string().min(1, "Observation content is required"),
});

export type MCPMemoryCreateObservationRequest = z.infer<typeof mcpMemoryCreateObservationRequestSchema>;

export const mcpMemoryCreateRelationRequestSchema = z.object({
  from_entity_id: z.number(),
  to_entity_id: z.number(),
  relation_type: z.string().min(1, "Relation type is required"),
  metadata: z.record(z.any()).nullable().optional(),
});

export type MCPMemoryCreateRelationRequest = z.infer<typeof mcpMemoryCreateRelationRequestSchema>;

// --- MCP Tool Categories ---
export enum MCPToolCategory {
  PROJECT = "project",
  TASK = "task", 
  MEMORY = "memory",
  AGENT = "agent",
  RULE = "rule",
}

// --- MCP Tool Info ---
export interface MCPToolInfo {
  name: string;
  description: string;
  category: MCPToolCategory;
  parameters: Record<string, any>;
  example?: Record<string, any>;
}
