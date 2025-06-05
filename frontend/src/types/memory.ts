import { z } from 'zod';

// --- Memory Entity Schemas ---
export const memoryEntityBaseSchema = z.object({
  entity_type: z.string().min(1, 'Entity type is required'),
  content: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
});

export const memoryEntityCreateSchema = memoryEntityBaseSchema;

export type MemoryEntityCreateData = z.infer<typeof memoryEntityCreateSchema>;

export const memoryEntityUpdateSchema = memoryEntityBaseSchema.partial();

export type MemoryEntityUpdateData = z.infer<typeof memoryEntityUpdateSchema>;

export const memoryEntitySchema = memoryEntityBaseSchema.extend({
  id: z.number(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
  updated_at: z
    .string()
    .datetime({ message: 'Invalid ISO datetime string' })
    .optional(),
});

export type MemoryEntity = z.infer<typeof memoryEntitySchema>;

// --- Memory Observation Schemas ---
export const memoryObservationBaseSchema = z.object({
  entity_id: z.number(),
  content: z.string().min(1, 'Content is required'),
});

export const memoryObservationCreateSchema = memoryObservationBaseSchema;

export type MemoryObservationCreateData = z.infer<
  typeof memoryObservationCreateSchema
>;

export const memoryObservationUpdateSchema =
  memoryObservationBaseSchema.partial();

export type MemoryObservationUpdateData = z.infer<
  typeof memoryObservationUpdateSchema
>;

export const memoryObservationSchema = memoryObservationBaseSchema.extend({
  id: z.number(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});

export type MemoryObservation = z.infer<typeof memoryObservationSchema>;

// --- Memory Relation Schemas ---
export const memoryRelationBaseSchema = z.object({
  from_entity_id: z.number(),
  to_entity_id: z.number(),
  relation_type: z.string().min(1, 'Relation type is required'),
  metadata: z.record(z.any()).nullable().optional(),
});

export const memoryRelationCreateSchema = memoryRelationBaseSchema;

export type MemoryRelationCreateData = z.infer<
  typeof memoryRelationCreateSchema
>;

export const memoryRelationSchema = memoryRelationBaseSchema.extend({
  id: z.number(),
  created_at: z.string().datetime({ message: 'Invalid ISO datetime string' }),
});

export type MemoryRelation = z.infer<typeof memoryRelationSchema>;

// --- Memory API Response Types ---
export interface MemoryEntityResponse {
  data: MemoryEntity;
  error?: { code: string; message: string; field?: string };
}

export interface MemoryEntityListResponse {
  data: MemoryEntity[];
  total: number;
  page: number;
  pageSize: number;
  error?: { code: string; message: string; field?: string };
}

// --- Memory Search and Filter Types ---
export interface MemoryEntityFilters {
  entity_type?: string;
  search?: string;
  metadata_key?: string;
  metadata_value?: string;
}

export interface MemoryRelationFilters {
  from_entity_id?: number;
  to_entity_id?: number;
  relation_type?: string;
}

export interface KnowledgeGraph {
  entities: MemoryEntity[];
  relations: MemoryRelation[];
}
