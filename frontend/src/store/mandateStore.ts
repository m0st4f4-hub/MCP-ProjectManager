import { createBaseStore, BaseState, withLoading } from './baseStore';
import { rulesApi } from '@/services/api';
import type { UniversalMandate, UniversalMandateCreateData } from '@/types/rules';

export interface MandateState extends BaseState {
  mandates: UniversalMandate[];
  fetchMandates: () => Promise<void>;
  addMandate: (data: UniversalMandateCreateData) => Promise<void>;
  removeMandate: (id: string) => Promise<void>;
}

const initialData: Omit<MandateState, keyof BaseState | 'fetchMandates' | 'addMandate' | 'removeMandate'> = {
  mandates: [],
};

const actionsCreator = (set: any) => ({
  fetchMandates: async () =>
    withLoading(set, async () => {
      const resp = await rulesApi.mandates.list();
      set({ mandates: resp.data });
    }),
  addMandate: async (data: UniversalMandateCreateData) =>
    withLoading(set, async () => {
      const m = await rulesApi.mandates.create(data);
      set((state: MandateState) => ({ mandates: [...state.mandates, m] }));
    }),
  removeMandate: async (id: string) =>
    withLoading(set, async () => {
      await rulesApi.mandates.delete(id);
      set((state: MandateState) => ({
        mandates: state.mandates.filter((m) => m.id !== id),
      }));
    }),
});

export const useMandateStore = createBaseStore<MandateState, ReturnType<typeof actionsCreator>>(
  initialData as any,
  actionsCreator,
  { name: 'mandate-store' },
);
