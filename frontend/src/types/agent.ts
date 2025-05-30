import { z } from "zod";
import { Task } from "./task";
import { SortDirection } from "./index";

// --- Agent Schemas ---
export const agentBaseSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  is_archived: z.boolean().default(false), // Assuming default false based on backend query param
});

export const agentCreateSchema = agentBaseSchema.omit({ is_archived: true });

export type AgentCreateData = z.infer<typeof agentCreateSchema>;

export const agentUpdateSchema = agentBaseSchema.partial();

export type AgentUpdateData = z.infer<typeof agentUpdateSchema>;

export const agentSchema = agentBaseSchema.extend({
  id: z.string(), // Assuming UUID as string
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  task_count: z.number().optional(),
  completed_task_count: z.number().optional(),
  project_names: z.array(z.string()).optional(),
  status: z.string().optional(),
  tasks: z.array(z.any()).optional(), // Tasks array from backend
  agent_rules: z.array(z.any()).optional(), // Agent rules from backend
});

export type Agent = z.infer<typeof agentSchema>;

// --- Agent Rule Association Schema ---
export const agentRuleSchema = z.object({
  agent_id: z.string(), // Assuming UUID as string
  rule_id: z.string(), // Assuming rule ID as string
});

export type AgentRule = z.infer<typeof agentRuleSchema>;

// --- Agent Archive/Unarchive Response Schema ---
// Backend returns the updated Agent object
export const agentArchiveResponseSchema = agentSchema;
export type AgentArchiveResponse = z.infer<typeof agentArchiveResponseSchema>;

export const agentUnarchiveResponseSchema = agentSchema;
export type AgentUnarchiveResponse = z.infer<typeof agentUnarchiveResponseSchema>;

// --- Agent Rule Add/Remove Response Schemas ---
// Backend add rule returns AgentRule object
export const agentRuleAddResponseSchema = agentRuleSchema;
export type AgentRuleAddResponse = z.infer<typeof agentRuleAddResponseSchema>;

// Backend remove rule returns a message dict
export const agentRuleRemoveResponseSchema = z.object({
  message: z.string(),
});
export type AgentRuleRemoveResponse = z.infer<typeof agentRuleRemoveResponseSchema>;

// Agent with computed fields and relationships
export interface AgentWithMeta extends Agent {
  tasks?: Task[];
  taskCount?: number;
  completedTaskCount?: number;
  efficiency?: number;
  status?: "available" | "busy" | "offline";
  lastActive?: string;
}

// Agent filter options
export interface AgentFilters {
  search?: string;
  status?: "all" | "available" | "busy" | "offline";
  projectId?: string | null;
  is_archived?: boolean | null;
}

// Agent sort options
export type AgentSortField = "created_at" | "name" | "efficiency" | "status";

export interface AgentSortOptions {
  field: AgentSortField;
  direction: SortDirection;
}

// Agent error types
export interface AgentError {
  code: string;
  message: string;
  field?: string;
}

// Agent API response types
export interface AgentResponse {
  data: Agent;
  error?: AgentError;
}

export interface AgentListResponse {
  data: Agent[];
  total: number;
  page: number;
  pageSize: number;
  error?: AgentError;
}

// Agent capability types
export interface AgentCapability {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}

// Agent role types
export type AgentRole =
  | "BuilderAgent"
  | "DocsAgent"
  | "FrontendAgent"
  | "ImageProcessingAgent"
  | "ImprovementAgent"
  | "InitializationAgent"
  | "MultimodalClassifierAgent"
  | "OvermindAgent"
  | "RefactorAgent"
  | "ResearchAgent"
  | "RuleEditorAgent"
  | "RuleGeneratingAgent"
  | "RulesSyncAgent"
  | "RunnerAgent";
