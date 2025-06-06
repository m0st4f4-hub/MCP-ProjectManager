import { createBaseStore, BaseState, withLoading } from './baseStore';
import { rulesApi } from '@/services/api';
import {
  UniversalMandate,
  UniversalMandateCreateData,
  UniversalMandateUpdateData,
} from '@/types/rules';

export interface UniversalMandateState extends BaseState {
  mandates: UniversalMandate[];
  fetchMandates: () => Promise<void>;
  addMandate: (data: UniversalMandateCreateData) => Promise<void>;
  updateMandate: (id: string, data: UniversalMandateUpdateData) => Promise<void>;
  removeMandate: (id: string) => Promise<void>;
}

const initialData: Omit<
  UniversalMandateState,
  | keyof BaseState
  | 'fetchMandates'
  | 'addMandate'
  | 'updateMandate'
  | 'removeMandate'
> = { mandates: [] };

const actionsCreator = (set: any, get: any) => ({
  fetchMandates: async () =>
    withLoading(set, async () => {
      const res = await rulesApi.mandates.list();
      set({ mandates: res.data });
    }),
  addMandate: async (data: UniversalMandateCreateData) =>
    withLoading(set, async () => {
      const m = await rulesApi.mandates.create(data);
      set((s: UniversalMandateState) => ({ mandates: [...s.mandates, m] }));
    }),
  updateMandate: async (id: string, data: UniversalMandateUpdateData) =>
    withLoading(set, async () => {
      const updated = await rulesApi.mandates.update(id, data);
      set((s: UniversalMandateState) => ({
        mandates: s.mandates.map((m) => (m.id === id ? updated : m)),
      }));
    }),
  removeMandate: async (id: string) =>
    withLoading(set, async () => {
      await rulesApi.mandates.delete(id);
      set((s: UniversalMandateState) => ({
        mandates: s.mandates.filter((m) => m.id !== id),
      }));
    }),
});

export const useUniversalMandateStore = createBaseStore<
  UniversalMandateState,
  ReturnType<typeof actionsCreator>
>(initialData as any, actionsCreator, { name: 'universal-mandate-store' });
