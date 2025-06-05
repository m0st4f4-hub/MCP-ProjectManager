import { StoreApi } from 'zustand';
import {
  createBaseStore,
  BaseState,
  extractErrorMessage,
} from './baseStore';
import { handleApiError } from '@/lib/apiErrorHandler';
import { memoryApi } from '@/services/api';
import type { MemoryEntity, MemoryEntityFilters } from '@/types/memory';

interface MemoryActions {
  fetchEntities: (filters?: MemoryEntityFilters) => Promise<void>;
  ingestFile: (filePath: string) => Promise<void>;
  ingestUrl: (url: string) => Promise<void>;
  ingestText: (text: string) => Promise<void>;
  deleteEntity: (id: number) => Promise<void>;
}

export interface MemoryState extends BaseState, MemoryActions {
  entities: MemoryEntity[];
  ingestionLoading: boolean;
  ingestionError: string | null;
}

const initialData: Omit<MemoryState, keyof BaseState | keyof MemoryActions> = {
  entities: [],
  ingestionLoading: false,
  ingestionError: null,
};

const actionsCreator = (
  set: StoreApi<MemoryState>['setState'],
  get: StoreApi<MemoryState>['getState']
): MemoryActions => ({
  fetchEntities: async (filters?: MemoryEntityFilters) => {
    set({ loading: true, error: null });
    try {
      const resp = await memoryApi.listEntities({
        skip: 0,
        limit: 100,
        ...filters,
      });
      set({ entities: resp.data, loading: false });
    } catch (err) {
      const msg = extractErrorMessage(err);
      set({ error: msg, loading: false });
      handleApiError(err);
    }
  },
  ingestFile: async (filePath: string) => {
    set({ ingestionLoading: true, ingestionError: null });
    try {
      const entity = await memoryApi.ingestFile(filePath);
      set((state) => ({
        entities: [entity, ...state.entities],
        ingestionLoading: false,
      }));
    } catch (err) {
      const msg = extractErrorMessage(err);
      set({ ingestionError: msg, ingestionLoading: false });
      handleApiError(err);
      throw err;
    }
  },
  ingestUrl: async (url: string) => {
    set({ ingestionLoading: true, ingestionError: null });
    try {
      const entity = await memoryApi.ingestUrl(url);
      set((state) => ({
        entities: [entity, ...state.entities],
        ingestionLoading: false,
      }));
    } catch (err) {
      const msg = extractErrorMessage(err);
      set({ ingestionError: msg, ingestionLoading: false });
      handleApiError(err);
      throw err;
    }
  },
  ingestText: async (text: string) => {
    set({ ingestionLoading: true, ingestionError: null });
    try {
      const entity = await memoryApi.ingestText(text);
      set((state) => ({
        entities: [entity, ...state.entities],
        ingestionLoading: false,
      }));
    } catch (err) {
      const msg = extractErrorMessage(err);
      set({ ingestionError: msg, ingestionLoading: false });
      handleApiError(err);
      throw err;
    }
  },
  deleteEntity: async (id: number) => {
    set({ loading: true });
    try {
      await memoryApi.deleteEntity(id);
      set((state) => ({
        entities: state.entities.filter((e) => e.id !== id),
        loading: false,
      }));
    } catch (err) {
      const msg = extractErrorMessage(err);
      set({ error: msg, loading: false });
      handleApiError(err);
      throw err;
    }
  },
});

export const useMemoryStore = createBaseStore<MemoryState, MemoryActions>(
  initialData,
  actionsCreator,
  { name: 'memory-store', persist: false }
);
