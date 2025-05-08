import { z } from 'zod';
import { Task } from './task';

// Base Agent schema for validation
export const agentSchema = z.object({
    id: z.number(),
    name: z.string().min(1, 'Name is required'),
    created_at: z.string(),
    updated_at: z.string().optional()
});

// Runtime type for Agent
export type Agent = z.infer<typeof agentSchema>;

// Schema for creating a new agent
export const agentCreateSchema = agentSchema.omit({ 
    id: true, 
    created_at: true, 
    updated_at: true 
});

export type AgentCreateData = z.infer<typeof agentCreateSchema>;

// Schema for updating an agent
export const agentUpdateSchema = agentSchema.partial().omit({ 
    id: true, 
    created_at: true, 
    updated_at: true 
});

export type AgentUpdateData = z.infer<typeof agentUpdateSchema>;

// Agent with computed fields and relationships
export interface AgentWithMeta extends Agent {
    tasks?: Task[];
    taskCount?: number;
    completedTaskCount?: number;
    efficiency?: number;
    status?: 'available' | 'busy' | 'offline';
    lastActive?: string;
}

// Agent filter options
export interface AgentFilters {
    search?: string;
    status?: 'all' | 'available' | 'busy' | 'offline';
}

// Agent sort options
export type AgentSortField = 'created_at' | 'name' | 'efficiency' | 'status';
export type SortDirection = 'asc' | 'desc';

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
    | 'BuilderAgent'
    | 'DocsAgent'
    | 'FrontendAgent'
    | 'ImageProcessingAgent'
    | 'ImprovementAgent'
    | 'InitializationAgent'
    | 'MultimodalClassifierAgent'
    | 'OvermindAgent'
    | 'RefactorAgent'
    | 'ResearchAgent'
    | 'RuleEditorAgent'
    | 'RuleGeneratingAgent'
    | 'RulesSyncAgent'
    | 'RunnerAgent'; 