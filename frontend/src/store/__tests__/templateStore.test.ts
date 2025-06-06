<<<<<<< HEAD
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { useTemplateStore } from '../templateStore';
import { projectTemplatesApi } from '@/services/api';
=======
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from 'react-dom/test-utils'
import { useTemplateStore } from '../templateStore'
import { projectTemplatesApi } from '@/services/api'
>>>>>>> origin/codex/add-delete-buttons-for-templates

vi.mock('@/services/api', () => ({
  projectTemplatesApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
<<<<<<< HEAD
}));

const mockedApi = vi.mocked(projectTemplatesApi);
=======
}))

const mockedApi = vi.mocked(projectTemplatesApi)
>>>>>>> origin/codex/add-delete-buttons-for-templates

const initialState = {
  templates: [],
  loading: false,
  error: null,
<<<<<<< HEAD
};

describe('templateStore', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      ...initialState,
      clearError: useTemplateStore.getState().clearError,
    } as any);
    vi.clearAllMocks();
  });
=======
}

describe('templateStore', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      ...initialState,
      clearError: useTemplateStore.getState().clearError,
    } as any)
    vi.clearAllMocks()
  })
>>>>>>> origin/codex/add-delete-buttons-for-templates

  it('removeTemplate calls API and updates state', async () => {
    useTemplateStore.setState({
      ...initialState,
<<<<<<< HEAD
      templates: [
        {
          id: '1',
          name: 'Temp',
          description: null,
          template_data: {},
          created_at: '',
          updated_at: '',
        },
      ],
=======
<<<<<<< HEAD
      templates: [{ id: 't1', name: 'T1', description: '', template_data: {} }],
>>>>>>> 14b950c31aedbeba84d7312e494d16c0062b0ea5
    } as any);
    mockedApi.delete.mockResolvedValueOnce({} as any);

    await act(async () => {
      await useTemplateStore.getState().removeTemplate('1');
    });

    expect(mockedApi.delete).toHaveBeenCalledWith('1');
    expect(useTemplateStore.getState().templates).toEqual([]);
  });
});
=======
      templates: [
        {
          id: '1',
          name: 'Temp',
          description: null,
          template_data: {},
          created_at: '',
          updated_at: '',
        },
      ],
    } as any)
    mockedApi.delete.mockResolvedValueOnce({} as any)

    await act(async () => {
      await useTemplateStore.getState().removeTemplate('1')
    })

    expect(mockedApi.delete).toHaveBeenCalledWith('1')
    expect(useTemplateStore.getState().templates).toEqual([])
  })
})
>>>>>>> origin/codex/add-delete-buttons-for-templates
