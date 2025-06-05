import { createBaseStore, BaseState, withLoading } from './baseStore';
import { rulesApi } from '@/services/api';
import type {
  UniversalMandate,
  UniversalMandateCreateData,
  UniversalMandateUpdateData,
} from '@/types/rules';

export interface UniversalMandateState extends BaseState {
  mandates: UniversalMandate[];
  fetchMandates: () => Promise<void>;
  addMandate: (data: UniversalMandateCreateData) => Promise<void>;
  updateMandate: (
    id: string,
    data: UniversalMandateUpdateData
  ) => Promise<void>;
  removeMandate: (id: string) => Promise<void>;
}

const initialData: Omit<
  UniversalMandateState,
  | keyof BaseState
  | 'fetchMandates'
  | 'addMandate'
  | 'updateMandate'
  | 'removeMandate'
> = {
  mandates: [],
};

const actionsCreator = (set: any, get: any) => ({
  fetchMandates: async () =>
    withLoading(set, async () => {
      const response = await rulesApi.mandates.list();
      set({ mandates: response.data });
    }),
  addMandate: async (data: UniversalMandateCreateData) =>
    withLoading(set, async () => {
      const created = await rulesApi.mandates.create(data);
      set((state: UniversalMandateState) => ({
        mandates: [...state.mandates, created],
      }));
    }),
  updateMandate: async (id: string, data: UniversalMandateUpdateData) =>
    withLoading(set, async () => {
      const updated = await rulesApi.mandates.update(id, data);
      set((state: UniversalMandateState) => ({
        mandates: state.mandates.map((m) => (m.id === id ? updated : m)),
      }));
    }),
  removeMandate: async (id: string) =>
    withLoading(set, async () => {
      await rulesApi.mandates.delete(id);
      set((state: UniversalMandateState) => ({
        mandates: state.mandates.filter((m) => m.id !== id),
      }));
    }),
});

export const useUniversalMandateStore = createBaseStore<
  UniversalMandateState,
  ReturnType<typeof actionsCreator>
>(initialData as any, actionsCreator, { name: 'universal-mandate-store' });
