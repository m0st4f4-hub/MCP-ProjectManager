import { createBaseStore, BaseState, withLoading } from './baseStore';
import { rulesApi } from '@/services/api';
import {
  AgentPromptTemplate,
  AgentPromptTemplateCreateData,
  AgentPromptTemplateUpdateData,
} from '@/types/agent_prompt_template';

export interface RuleTemplateState extends BaseState {
  templates: AgentPromptTemplate[];
  fetchTemplates: () => Promise<void>;
  addTemplate: (data: AgentPromptTemplateCreateData) => Promise<void>;
  updateTemplate: (id: string, data: AgentPromptTemplateUpdateData) => Promise<void>;
  removeTemplate: (id: string) => Promise<void>;
}

const initialData: Omit<
  RuleTemplateState,
  | keyof BaseState
  | 'fetchTemplates'
  | 'addTemplate'
  | 'updateTemplate'
  | 'removeTemplate'
> = {
  templates: [],
};

const actionsCreator = (set: any, get: any) => ({
  fetchTemplates: async () =>
    withLoading(set, async () => {
      const templates = await rulesApi.templates.list();
      set({ templates });
    }),
  addTemplate: async (data: AgentPromptTemplateCreateData) =>
    withLoading(set, async () => {
      const t = await rulesApi.templates.create(data);
      set((state: RuleTemplateState) => ({ templates: [...state.templates, t] }));
    }),
  updateTemplate: async (id: string, data: AgentPromptTemplateUpdateData) =>
    withLoading(set, async () => {
      const updated = await rulesApi.templates.update(id, data);
      set((state: RuleTemplateState) => ({
        templates: state.templates.map((t) => (t.id === id ? updated : t)),
      }));
    }),
  removeTemplate: async (id: string) =>
    withLoading(set, async () => {
      await rulesApi.templates.delete(id);
      set((state: RuleTemplateState) => ({
        templates: state.templates.filter((t) => t.id !== id),
      }));
    }),
});

export const useRuleTemplateStore = createBaseStore<
  RuleTemplateState,
  ReturnType<typeof actionsCreator>
>(initialData as any, actionsCreator, { name: 'rule-template-store' });
