import { request } from "./request";
import { buildApiUrl, API_CONFIG } from "./config";
import type {
  MemoryEntity,
  MemoryEntityCreateData,
  MemoryEntityUpdateData,
  MemoryEntityListResponse,
  MemoryEntityResponse,
  MemoryEntityFilters,
  MemoryObservation,
  MemoryObservationCreateData,
  MemoryObservationUpdateData,
  MemoryRelation,
  MemoryRelationCreateData,
  MemoryRelationFilters,
  KnowledgeGraph,
} from "@/types/memory";

// --- Memory Entity APIs ---
export const memoryApi = {
  // Create a new memory entity
  createEntity: async (data: MemoryEntityCreateData): Promise<MemoryEntity> => {
    const response = await request<MemoryEntityResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.MEMORY),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  // Get a memory entity by ID
  getEntity: async (entityId: number): Promise<MemoryEntity> => {
    const response = await request<MemoryEntityResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.MEMORY, `/${entityId}`)
    );
    return response.data;
  },

  // List memory entities with optional filters
  listEntities: async (
    filters?: MemoryEntityFilters & { skip?: number; limit?: number }
  ): Promise<MemoryEntityListResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return await request<MemoryEntityListResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.MEMORY, `?${params.toString()}`)
    );
  },
  // Update a memory entity
  updateEntity: async (
    entityId: number,
    data: MemoryEntityUpdateData
  ): Promise<MemoryEntity> => {
    const response = await request<MemoryEntityResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.MEMORY, `/${entityId}`),
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  // Delete a memory entity
  deleteEntity: async (entityId: number): Promise<void> => {
    await request(
      buildApiUrl(API_CONFIG.ENDPOINTS.MEMORY, `/${entityId}`),
      {
        method: "DELETE",
      }
    );
  },

  // Ingest a file from the server filesystem
  ingestFile: async (filePath: string): Promise<MemoryEntity> => {
    const response = await request<MemoryEntityResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.MEMORY, "/entities/ingest/file"),
      {
        method: "POST",
        body: JSON.stringify({ file_path: filePath }),
      }
    );
    return response.data;
  },

  // Ingest content directly from a URL
  ingestUrl: async (url: string): Promise<MemoryEntity> => {
    const response = await request<MemoryEntityResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.MEMORY, "/ingest-url"),
      {
        method: "POST",
        body: JSON.stringify({ url }),
      }
    );
    return response.data;
  },

  // Ingest a raw text snippet
  ingestText: async (text: string): Promise<MemoryEntity> => {
    const response = await request<MemoryEntityResponse>(
      buildApiUrl(API_CONFIG.ENDPOINTS.MEMORY, "/ingest-text"),
      {
        method: "POST",
        body: JSON.stringify({ text }),
      }
    );
    return response.data;
  },

  // --- Memory Observation APIs ---
  // Add an observation to an entity
  addObservation: async (data: MemoryObservationCreateData): Promise<MemoryObservation> => {
    const response = await request<{ data: MemoryObservation }>(
      buildApiUrl(API_CONFIG.ENDPOINTS.MEMORY, "/observations"),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  // Get observations for an entity
  getObservations: async (entityId: number): Promise<MemoryObservation[]> => {
    const response = await request<{ data: MemoryObservation[] }>(
      buildApiUrl(API_CONFIG.ENDPOINTS.MEMORY, `/entities/${entityId}/observations`)
    );
    return response.data;
  },

  // Update an observation
  updateObservation: async (
    observationId: number,
    data: MemoryObservationUpdateData
  ): Promise<MemoryObservation> => {
    const response = await request<{ data: MemoryObservation }>(
      buildApiUrl(API_CONFIG.ENDPOINTS.MEMORY, `/observations/${observationId}`),
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  // Delete an observation
  deleteObservation: async (observationId: number): Promise<void> => {
    await request(
      buildApiUrl(API_CONFIG.ENDPOINTS.MEMORY, `/observations/${observationId}`),
      {
        method: "DELETE",
      }
    );
  },
  // --- Memory Relation APIs ---
  // Create a relation between entities
  createRelation: async (data: MemoryRelationCreateData): Promise<MemoryRelation> => {
    const response = await request<{ data: MemoryRelation }>(
      buildApiUrl(API_CONFIG.ENDPOINTS.MEMORY, "/relations"),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  // Get relations with filters
  getRelations: async (filters?: MemoryRelationFilters): Promise<MemoryRelation[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await request<{ data: MemoryRelation[] }>(
      buildApiUrl(API_CONFIG.ENDPOINTS.MEMORY, `/relations?${params.toString()}`)
    );
    return response.data;
  },

  // Delete a relation
  deleteRelation: async (relationId: number): Promise<void> => {
    await request(
      buildApiUrl(API_CONFIG.ENDPOINTS.MEMORY, `/relations/${relationId}`),
      {
        method: "DELETE",
      }
    );
  },

  // --- Knowledge Graph APIs ---
  // Get the full knowledge graph
  getKnowledgeGraph: async (): Promise<KnowledgeGraph> => {
    const response = await request<{ data: KnowledgeGraph }>(
      buildApiUrl(API_CONFIG.ENDPOINTS.MEMORY, "/graph")
    );
    return response.data;
  },

  // Search the knowledge graph
  searchGraph: async (query: string): Promise<MemoryEntity[]> => {
    const response = await request<{ data: MemoryEntity[] }>(
      buildApiUrl(API_CONFIG.ENDPOINTS.MEMORY, `/search?q=${encodeURIComponent(query)}`)
    );
    return response.data;
  },
};
