import { createBaseStore, BaseState, withLoading } from './baseStore';
import { projectTemplatesApi } from '@/services/api';
import {
  ProjectTemplate,
  ProjectTemplateCreateData,
  ProjectTemplateUpdateData,
} from '@/types/project_template';

export interface TemplateState extends BaseState {
  templates: ProjectTemplate[];
  fetchTemplates: () => Promise<void>;
  addTemplate: (data: ProjectTemplateCreateData) => Promise<void>;
  updateTemplate: (
    id: string,
    data: ProjectTemplateUpdateData
  ) => Promise<void>;
  removeTemplate: (id: string) => Promise<void>;
}

const initialData: Omit<
  TemplateState,
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
      const templates = await projectTemplatesApi.list();
      set({ templates });
    }),
  addTemplate: async (data: ProjectTemplateCreateData) =>
    withLoading(set, async () => {
      const t = await projectTemplatesApi.create(data);
      set((state: TemplateState) => ({ templates: [...state.templates, t] }));
    }),
  updateTemplate: async (id: string, data: ProjectTemplateUpdateData) =>
    withLoading(set, async () => {
      const updated = await projectTemplatesApi.update(id, data);
      set((state: TemplateState) => ({
        templates: state.templates.map((t) => (t.id === id ? updated : t)),
      }));
    }),
  removeTemplate: async (id: string) =>
    withLoading(set, async () => {
      await projectTemplatesApi.delete(id);
      set((state: TemplateState) => ({
        templates: state.templates.filter((t) => t.id !== id),
      }));
    }),
});

export const useTemplateStore = createBaseStore<
  TemplateState,
  ReturnType<typeof actionsCreator>
>(initialData as any, actionsCreator, { name: 'template-store' });
