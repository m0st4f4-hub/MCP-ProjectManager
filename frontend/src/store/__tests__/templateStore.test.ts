import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { useTemplateStore } from '../templateStore';
import { projectTemplatesApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  projectTemplatesApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApi = vi.mocked(projectTemplatesApi);

const initialState = {
  templates: [],
  loading: false,
  error: null,
};

describe('templateStore', () => {
  beforeEach(() => {
    useTemplateStore.setState(initialState as any);
    vi.clearAllMocks();
  });

  it('removeTemplate calls API and updates state', async () => {
    useTemplateStore.setState({
      ...initialState,
      templates: [{ id: 't1', name: 'T1', description: '', template_data: {} }],
    } as any);
    mockedApi.delete.mockResolvedValueOnce({} as any);

    await act(async () => {
      await useTemplateStore.getState().removeTemplate('t1');
    });

    expect(mockedApi.delete).toHaveBeenCalledWith('t1');
    expect(useTemplateStore.getState().templates).toEqual([]);
  });

  it('fetchTemplates loads templates from API', async () => {
    const templates = [
      { id: 't1', name: 'T1', description: '', template_data: {} },
    ];
    mockedApi.list.mockResolvedValueOnce(templates as any);

    await act(async () => {
      await useTemplateStore.getState().fetchTemplates();
    });

    expect(mockedApi.list).toHaveBeenCalled();
    expect(useTemplateStore.getState().templates).toEqual(templates);
  });

  it('addTemplate adds template to list', async () => {
    const tmpl = { id: 't2', name: 'T2', description: '', template_data: {} };
    mockedApi.create.mockResolvedValueOnce(tmpl as any);

    await act(async () => {
      await useTemplateStore.getState().addTemplate({ name: 'T2' } as any);
    });

    expect(mockedApi.create).toHaveBeenCalledWith({ name: 'T2' });
    expect(useTemplateStore.getState().templates[0]).toEqual(tmpl);
  });

  it('updateTemplate updates template', async () => {
    useTemplateStore.setState({
      ...initialState,
      templates: [{ id: 't1', name: 'T1', description: '', template_data: {} }],
    } as any);
    const updated = {
      id: 't1',
      name: 'T1b',
      description: '',
      template_data: {},
    };
    mockedApi.update.mockResolvedValueOnce(updated as any);

    await act(async () => {
      await useTemplateStore
        .getState()
        .updateTemplate('t1', { name: 'T1b' } as any);
    });

    expect(mockedApi.update).toHaveBeenCalledWith('t1', { name: 'T1b' });
    expect(useTemplateStore.getState().templates[0].name).toBe('T1b');
  });
});
