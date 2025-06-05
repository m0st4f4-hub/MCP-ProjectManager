import { z } from 'zod';
import { projectTemplateCreateSchema } from './project_template';

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
  name: z.string().min(1, 'Project name is required'),
  description: z.string().nullable().optional(),
});

export type MCPProjectCreateRequest = z.infer<
  typeof mcpProjectCreateRequestSchema
>;

export const mcpProjectDeleteRequestSchema = z.object({
  project_id: z.string(),
});

export type MCPProjectDeleteRequest = z.infer<
  typeof mcpProjectDeleteRequestSchema
>;

export const mcpProjectUpdateRequestSchema = z.object({
  project_id: z.string(),
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  is_archived: z.boolean().optional(),
});

export type MCPProjectUpdateRequest = z.infer<
  typeof mcpProjectUpdateRequestSchema
>;

// --- MCP Task Tool Schemas ---
export const mcpTaskCreateRequestSchema = z.object({
  project_id: z.string(),
  title: z.string().min(1, 'Task title is required'),
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

export const mcpTaskDeleteRequestSchema = z.object({
  project_id: z.string(),
  task_number: z.number(),
});

export type MCPTaskDeleteRequest = z.infer<typeof mcpTaskDeleteRequestSchema>;

// --- MCP Memory Tool Schemas ---
export const mcpMemoryCreateEntityRequestSchema = z.object({
  entity_type: z.string().min(1, 'Entity type is required'),
  content: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
});

export type MCPMemoryCreateEntityRequest = z.infer<
  typeof mcpMemoryCreateEntityRequestSchema
>;

export const mcpMemoryCreateObservationRequestSchema = z.object({
  entity_id: z.number(),
  content: z.string().min(1, 'Observation content is required'),
});

export type MCPMemoryCreateObservationRequest = z.infer<
  typeof mcpMemoryCreateObservationRequestSchema
>;

export const mcpMemoryCreateRelationRequestSchema = z.object({
  from_entity_id: z.number(),
  to_entity_id: z.number(),
  relation_type: z.string().min(1, 'Relation type is required'),
  metadata: z.record(z.any()).nullable().optional(),
});

export type MCPMemoryCreateRelationRequest = z.infer<
  typeof mcpMemoryCreateRelationRequestSchema
>;

export const mcpMemoryGetContentRequestSchema = z.object({
  entity_id: z.number(),
});

export type MCPMemoryGetContentRequest = z.infer<
  typeof mcpMemoryGetContentRequestSchema
>;

export const mcpMemoryGetMetadataRequestSchema = z.object({
  entity_id: z.number(),
});

export type MCPMemoryGetMetadataRequest = z.infer<
  typeof mcpMemoryGetMetadataRequestSchema
>;

// --- MCP Project Member Tool Schemas ---
export const mcpProjectMemberAddRequestSchema = z.object({
  project_id: z.string(),
  user_id: z.string(),
  role: z.string(),
});

export type MCPProjectMemberAddRequest = z.infer<
  typeof mcpProjectMemberAddRequestSchema
>;

export const mcpProjectMemberRemoveRequestSchema = z.object({
  project_id: z.string(),
  user_id: z.string(),
});

export type MCPProjectMemberRemoveRequest = z.infer<
  typeof mcpProjectMemberRemoveRequestSchema
>;

// --- MCP Project File Tool Schemas ---
export const mcpProjectFileAddRequestSchema = z.object({
  project_id: z.string(),
  file_id: z.string(),
});

export type MCPProjectFileAddRequest = z.infer<
  typeof mcpProjectFileAddRequestSchema
>;

export const mcpProjectFileRemoveRequestSchema = z.object({
  project_id: z.string(),
  file_id: z.string(),
});

export type MCPProjectFileRemoveRequest = z.infer<
  typeof mcpProjectFileRemoveRequestSchema
>;

// --- MCP Project Template Tool Schemas ---
export const mcpProjectTemplateCreateRequestSchema =
  projectTemplateCreateSchema;
export type MCPProjectTemplateCreateRequest = z.infer<
  typeof mcpProjectTemplateCreateRequestSchema
>;

export const mcpProjectTemplateDeleteRequestSchema = z.object({
  template_id: z.string(),
});
export type MCPProjectTemplateDeleteRequest = z.infer<
  typeof mcpProjectTemplateDeleteRequestSchema
>;

// --- MCP Tool Categories ---
export enum MCPToolCategory {
  PROJECT = 'project',
  TASK = 'task',
  MEMORY = 'memory',
  AGENT = 'agent',
  RULE = 'rule',
}

// --- MCP Tool Info ---
export interface MCPToolInfo {
  name: string;
  description: string;
  category: MCPToolCategory;
  parameters: Record<string, any>;
  example?: Record<string, any>;
}

export interface MCPToolMetrics {
  [tool: string]: number;
}
