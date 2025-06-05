import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { useTemplateStore } from '../templateStore';
import * as api from '@/services/api';

vi.mock('@/services/api', () => ({
  projectTemplatesApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api.projectTemplatesApi);

const initialState = {
  templates: [],
  loading: false,
  error: null,
};

describe('templateStore', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      ...initialState,
      fetchTemplates: useTemplateStore.getState().fetchTemplates,
      addTemplate: useTemplateStore.getState().addTemplate,
      updateTemplate: useTemplateStore.getState().updateTemplate,
      removeTemplate: useTemplateStore.getState().removeTemplate,
      clearError: useTemplateStore.getState().clearError,
    } as any);
    vi.clearAllMocks();
  });

  it('removeTemplate calls API and updates state', async () => {
    useTemplateStore.setState({
      ...initialState,
      templates: [
        {
          id: 't1',
          name: 'T1',
          description: '',
          template_data: {},
          created_at: '',
          updated_at: '',
        },
      ],
    } as any);
    mockedApi.delete.mockResolvedValueOnce({} as any);

    await act(async () => {
      await useTemplateStore.getState().removeTemplate('t1');
    });

    expect(mockedApi.delete).toHaveBeenCalledWith('t1');
    expect(useTemplateStore.getState().templates).toEqual([]);
  });
});
